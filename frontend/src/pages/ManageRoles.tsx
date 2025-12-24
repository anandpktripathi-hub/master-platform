import React, { useState, useEffect } from 'react';
import rbacApi, { Role, Permission } from '../services/rbacApi';
import '../styles/ManageRoles.css';

export const ManageRoles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rbacApi.getRoles();
      setRoles(response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await rbacApi.deleteRole(roleId);
      await fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowCreateModal(true);
  };

  if (loading) return <div className="loading">Loading roles...</div>;

  return (
    <div className="manage-roles-container">
      <div className="manage-roles-header">
        <h1>Manage Roles</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Role
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="roles-list">
        {roles.map((role) => (
          <div key={role._id} className="role-item">
            <div className="role-header">
              <div className="role-info">
                <h3>{role.name}</h3>
                {role.description && <p className="description">{role.description}</p>}
              </div>
              <div className="role-actions">
                <button
                  className="btn-icon"
                  onClick={() => setExpandedRole(expandedRole === role._id ? null : role._id)}
                >
                  {expandedRole === role._id ? '▼' : '▶'}
                </button>
                {!role.isSystem && (
                  <>
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEditRole(role)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteRole(role._id)}
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>

            {expandedRole === role._id && (
              <div className="role-permissions">
                <h4>Permissions:</h4>
                <div className="permissions-grid">
                  {role.permissions.map((perm) => (
                    <span key={perm._id} className="permission-chip">
                      {perm.action}: {perm.module}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateRoleModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
            fetchRoles();
          }}
          editingRole={editingRole}
        />
      )}
    </div>
  );
};

interface CreateRoleModalProps {
  onClose: () => void;
  editingRole?: Role | null;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, editingRole }) => {
  const [name, setName] = useState(editingRole?.name || '');
  const [description, setDescription] = useState(editingRole?.description || '');
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(editingRole?.permissions.map((p) => p._id) || []),
  );
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await rbacApi.getAllPermissions();
      const perms = response || [];
      setAllPermissions(perms);
      const uniqueModules = Array.from(new Set(perms.map((p) => p.module)));
      setModules(uniqueModules.sort());
    } catch (err: any) {
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const getModulePermissions = (module: string) => {
    return allPermissions.filter((p) => p.module === module);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError('Role name is required');
      return;
    }

    if (selectedPermissions.size === 0) {
      setError('Please select at least one permission');
      return;
    }

    try {
      setSaving(true);
      const permissionIds = Array.from(selectedPermissions);
      if (editingRole) {
        await rbacApi.updateRole(editingRole._id, {
          name,
          description,
          permissionIds,
        });
      } else {
        await rbacApi.createRole({
          name,
          description,
          permissionIds,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="modal-loading">Loading permissions...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error-message">{error}</div>}

          <div className="role-info-section">
            <div className="form-group">
              <label htmlFor="name">Role Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
          </div>

          <div className="permissions-section">
            <h3>Assign General Permission to Roles</h3>
            <div className="permissions-matrix">
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Manage</th>
                    <th>Create</th>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Show</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => {
                    const modulePerms = getModulePermissions(module);
                    return (
                      <tr key={module}>
                        <td className="module-name">{module}</td>
                        {['manage', 'create', 'edit', 'delete', 'show'].map((action) => {
                          const perm = modulePerms.find((p) => p.action === action);
                          return (
                            <td key={action} className="checkbox-cell">
                              {perm ? (
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(perm._id)}
                                  onChange={() => togglePermission(perm._id)}
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
