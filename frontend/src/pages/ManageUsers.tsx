import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import rbacApi from '../services/rbacApi';
import type { UserTenant } from '../services/rbacApi';
import type { Role } from '../services/rbacApi';
import '../styles/ManageUser.css';
import { usePackageUsage } from '../hooks/usePackages';

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
  // Store hierarchy assignments for each user
  const [userHierarchyMap, setUserHierarchyMap] = useState<Record<string, any[]>>({});

  const { data: packageUsage, isLoading: usageLoading } = usePackageUsage();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await rbacApi.getUsers(page, 10);
      const userList = response.data || [];
      setUsers(userList);
      setTotal(response.total || 0);
      // Fetch hierarchy assignments for all users
      const hierarchyMap: Record<string, any[]> = {};
      await Promise.all(userList.map(async (user: any) => {
        try {
          const result = await UserHierarchyApi.getNodes(user._id);
          hierarchyMap[user._id] = result?.hierarchyNodes || [];
        } catch {
          hierarchyMap[user._id] = [];
        }
      }));
      setUserHierarchyMap(hierarchyMap);
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

  const teamMembersUsed = packageUsage?.usage?.teamMembers ?? users.length;
  const maxTeamMembers = packageUsage?.limits?.maxTeamMembers;
  const atTeamLimit = typeof maxTeamMembers === 'number' && maxTeamMembers >= 0 && teamMembersUsed >= maxTeamMembers;

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <ErrorBoundary>
      <div className="manage-users-container">
      <div className="manage-users-header">
        <h1>Manage Users</h1>
        {typeof maxTeamMembers === 'number' && maxTeamMembers > 0 && (
          <span className="quota-info">
            Team members: {teamMembersUsed} / {maxTeamMembers}
          </span>
        )}
        <button
          className="btn-primary"
          disabled={usageLoading || atTeamLimit}
          onClick={() => {
            if (atTeamLimit) {
              window.location.href = '/app/packages';
              return;
            }
            setShowCreateModal(true);
          }}
        >
          + Add User
        </button>
      </div>

      {atTeamLimit && (
        <div className="info-message warning-message">
          You have reached the team member limit for your current plan. Upgrade your subscription on the Packages page to invite more users.
        </div>
      )}

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
              {/* Display assigned hierarchy nodes */}
              {userHierarchyMap[user._id] && userHierarchyMap[user._id].length > 0 && (
                <div className="user-hierarchy-nodes">
                    <span className="label">Assigned Features/Options:</span>
                    <ul className="assigned-features-list">
                      {userHierarchyMap[user._id].map((node: any) => (
                        <li key={node._id || node} className="assigned-feature-item" tabIndex={0} aria-label={`Feature: ${node.name || node}, Type: ${node.type || ''}`}>
                          {node.name || node} <span className="hierarchy-type">({node.type || ''})</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
            fetchUsers(); // will refresh hierarchy assignments too
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
    </ErrorBoundary>
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
  const [hierarchyNodes, setHierarchyNodes] = useState<any[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<Set<string>>(new Set());
  const [paymentGateway, setPaymentGateway] = useState(editingUser?.user?.paymentGateway || 'stripe');
  const [isPublic, setIsPublic] = useState(editingUser?.user?.isPublic ?? false);
  const [languages, setLanguages] = useState<string[]>(editingUser?.user?.languages || []);
  const availableGateways = ['stripe', 'paypal', 'razorpay'];
  const availableLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Unlimited...'];

  useEffect(() => {
    fetchRoles();
    fetchHierarchy();
    // If editing, fetch assigned nodes
    if (editingUser) {
      fetchAssignedHierarchy(editingUser._id);
    }
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rbacApi.getRoles();
      setRoles(response || []);
    } catch (err: any) {
      setError('Failed to load roles');
    }
  };

  const fetchHierarchy = async () => {
    try {
      // Fetch only features/options
      const nodes = await HierarchyApi.getTree('feature');
      setHierarchyNodes(nodes);
    } catch (err: any) {
      setHierarchyNodes([]);
    }
  };

  const fetchAssignedHierarchy = async (userId: string) => {
    try {
      const result = await UserHierarchyApi.getNodes(userId);
      if (result && result.hierarchyNodes) {
        setSelectedHierarchy(new Set(result.hierarchyNodes.map((n: any) => n._id || n)));
      }
    } catch {
      setSelectedHierarchy(new Set());
    }
  };

  const handleHierarchyToggle = (nodeId: string) => {
    setSelectedHierarchy(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) newSet.delete(nodeId);
      else newSet.add(nodeId);
      return newSet;
    });
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
    if (!paymentGateway) {
      setError('Please select a payment gateway');
      return;
    }
    if (languages.length === 0) {
      setError('Please select at least one language');
      return;
    }

    try {
      setLoading(true);
      let userId = editingUser?._id;
      if (editingUser) {
        await rbacApi.updateUser(editingUser._id, {
          name,
          roleId,
          isLoginEnabled,
          dateOfBirth,
        });
      } else {
        const created = await rbacApi.createUser({
          name,
          email,
          password,
          roleId,
          isLoginEnabled,
          dateOfBirth,
        });
        userId = created._id;
      }
      // Assign hierarchy nodes
      if (userId) {
        await UserHierarchyApi.assignNodes(userId, Array.from(selectedHierarchy));
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
              title="Select user role"
              className="select"
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
            <label htmlFor="gateway">Payment Gateway *</label>
            <select
              id="gateway"
              value={paymentGateway}
              onChange={(e) => setPaymentGateway(e.target.value)}
              title="Select payment gateway"
              className="select"
            >
              <option value="">Select gateway</option>
              {availableGateways.map((gw) => (
                <option key={gw} value={gw}>{gw.charAt(0).toUpperCase() + gw.slice(1)}</option>
              ))}
            </select>
            <span className="hint">Choose how the user will pay for their subscription.</span>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Publicly Visible
            </label>
            <span className="hint">If enabled, user profile will be visible to others.</span>
          </div>
          <div className="form-group">
            <label>Languages *</label>
            <select
              multiple
              value={languages}
              onChange={(e) => setLanguages(Array.from(e.target.selectedOptions, opt => opt.value))}
              title="Select languages"
              className="select select-multiline"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <span className="hint">Select one or more languages. Choose 'Unlimited...' for unlimited support.</span>
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

          <div className="form-group">
            <label>Assign Features/Options</label>
            <div className="hierarchy-list">
              {hierarchyNodes.map((node) => (
                <label key={node._id} className="hierarchy-label">
                  <input
                    type="checkbox"
                    checked={selectedHierarchy.has(node._id)}
                    onChange={() => handleHierarchyToggle(node._id)}
                  />
                  {node.name} <span className="hierarchy-type">({node.type})</span>
                </label>
              ))}
            </div>
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
