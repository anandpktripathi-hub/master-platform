import React, { useState, useEffect } from 'react';
import rbacApi, { UserTenant, Role } from '../services/rbacApi';
import '../styles/ManageUser.css';

interface UserWithDetails extends UserTenant {
  user?: any;
  role?: Role;
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await rbacApi.getUsers(page, 10);
      setUsers(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userTenantId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await rbacApi.deleteUser(userTenantId);
      await fetchUsers();
      setActionMenuOpenFor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (userTenantId: string) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      await rbacApi.resetPassword(userTenantId, newPassword);
      alert('Password reset successfully');
      setActionMenuOpenFor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleToggleLogin = async (userTenantId: string, currentStatus: boolean) => {
    try {
      await rbacApi.toggleLogin(userTenantId, !currentStatus);
      await fetchUsers();
      setActionMenuOpenFor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update login status');
    }
  };

  const handleEditUser = (user: UserWithDetails) => {
    setEditingUser(user);
    setShowCreateModal(true);
    setActionMenuOpenFor(null);
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="manage-users-container">
      <div className="manage-users-header">
        <h1>Manage Users</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-grid">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-card-header">
              <div className="user-info">
                <div className="user-avatar">
                  {user.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <h3>{user.user?.name}</h3>
                  <p className="email">{user.user?.email}</p>
                </div>
              </div>
              <div className="actions-menu">
                <button
                  className="menu-btn"
                  onClick={() =>
                    setActionMenuOpenFor(
                      actionMenuOpenFor === user._id ? null : user._id,
                    )
                  }
                >
                  ⋮
                </button>
                {actionMenuOpenFor === user._id && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleEditUser(user)}>Edit</button>
                    <button onClick={() => handleDeleteUser(user._id)}>
                      Delete
                    </button>
                    <button onClick={() => handleResetPassword(user._id)}>
                      Reset Password
                    </button>
                    <button
                      onClick={() =>
                        handleToggleLogin(user._id, user.isLoginEnabled)
                      }
                    >
                      {user.isLoginEnabled ? 'Disable Login' : 'Enable Login'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="user-card-body">
              <div className="role-badge">{user.role?.name}</div>
              <div className="user-meta">
                <div className="meta-item">
                  <span className="label">Created:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.lastLoginAt && (
                  <div className="meta-item">
                    <span className="label">Last Login:</span>
                    <span>{new Date(user.lastLoginAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="user-status">
                <span className={`status-badge ${user.isLoginEnabled ? 'enabled' : 'disabled'}`}>
                  {user.isLoginEnabled ? 'Login Enabled' : 'Login Disabled'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
            fetchUsers();
          }}
          editingUser={editingUser}
        />
      )}

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          ← Previous
        </button>
        <span>
          Page {page} of {Math.ceil(total / 10)}
        </span>
        <button
          disabled={page >= Math.ceil(total / 10)}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

interface CreateUserModalProps {
  onClose: () => void;
  editingUser?: UserTenant | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, editingUser }) => {
  const [name, setName] = useState(editingUser?.user?.name || '');
  const [email, setEmail] = useState(editingUser?.user?.email || '');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(editingUser?.user?.dateOfBirth || '');
  const [roleId, setRoleId] = useState(editingUser?.roleId || '');
  const [isLoginEnabled, setIsLoginEnabled] = useState(editingUser?.isLoginEnabled ?? true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rbacApi.getRoles();
      setRoles(response || []);
    } catch (err: any) {
      setError('Failed to load roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !roleId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!editingUser && !password) {
      setError('Password is required for new users');
      return;
    }

    try {
      setLoading(true);
      if (editingUser) {
        await rbacApi.updateUser(editingUser._id, {
          name,
          roleId,
          isLoginEnabled,
          dateOfBirth,
        });
      } else {
        await rbacApi.createUser({
          name,
          email,
          password,
          roleId,
          isLoginEnabled,
          dateOfBirth,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              disabled={editingUser ? false : false}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              disabled={!!editingUser}
            />
          </div>

          {!editingUser && isLoginEnabled && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">User Role *</label>
            <select
              id="role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isLoginEnabled}
                onChange={(e) => setIsLoginEnabled(e.target.checked)}
              />
              Login is Enabled
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
