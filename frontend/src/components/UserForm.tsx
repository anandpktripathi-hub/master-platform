import React, { useEffect, useMemo, useState } from 'react';
import rbacApi, { Role } from '../services/rbacApi';

interface UserData {
  _id?: string;
  userTenantId?: string;
  email?: string;
  name?: string;
  roleId?: string;
  isLoginEnabled?: boolean;
  dateOfBirth?: string;
  password?: string;
  [key: string]: unknown;
}

export interface UserFormProps {
  mode?: "create" | "edit";
  user?: UserData;
  onSubmit?: (data: UserData) => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  mode = 'create',
  user,
  onSubmit,
  onCancel,
}) => {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [roleId, setRoleId] = useState(user?.roleId || '');
  const [isLoginEnabled, setIsLoginEnabled] = useState(
    user?.isLoginEnabled ?? true,
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    rbacApi
      .getRoles()
      .then((res) => {
        if (!mounted) return;
        setRoles(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (!mounted) return;
        setRoles([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!isEdit && !email.trim()) return false;
    if (!roleId) return false;
    if (!isEdit && (!password || password.length < 8)) return false;
    return true;
  }, [name, email, roleId, password, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError(
        isEdit
          ? 'Please fill in required fields'
          : 'Please fill in required fields (password min 8 chars)',
      );
      return;
    }

    const payload: UserData = {
      ...(user?._id ? { _id: user._id } : {}),
      name: name.trim(),
      ...(isEdit ? {} : { email: email.trim() }),
      ...(isEdit ? {} : { password }),
      roleId,
      isLoginEnabled,
      ...(dateOfBirth ? { dateOfBirth } : {}),
    };

    try {
      setSaving(true);
      if (onSubmit) {
        await Promise.resolve(onSubmit(payload));
        return;
      }

      // Optional: allow the form to be used standalone.
      if (isEdit) {
        const id = String(user?._id || user?.userTenantId || '');
        if (!id) {
          setError('Missing user id for edit');
          return;
        }
        await rbacApi.updateUser(id, payload as any);
      } else {
        await rbacApi.createUser(payload as any);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          {isEdit ? 'Edit user' : 'Create user'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="user-name">
            Name *
          </label>
          <input
            id="user-name"
            className="border rounded px-2 py-1 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="user-email">
            Email {!isEdit ? '*' : ''}
          </label>
          <input
            id="user-email"
            type="email"
            className="border rounded px-2 py-1 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            disabled={saving || isEdit}
          />
        </div>

        {!isEdit && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600" htmlFor="user-password">
              Password *
            </label>
            <input
              id="user-password"
              type="password"
              className="border rounded px-2 py-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              disabled={saving}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="user-role">
            Role *
          </label>
          <select
            id="user-role"
            className="border rounded px-2 py-1 text-sm"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={saving}
          >
            <option value="">
              {roles.length ? 'Select a role' : 'No roles available'}
            </option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="user-dob">
            Date of birth
          </label>
          <input
            id="user-dob"
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input
            id="user-login-enabled"
            type="checkbox"
            checked={isLoginEnabled}
            onChange={(e) => setIsLoginEnabled(e.target.checked)}
            disabled={saving}
          />
          <label htmlFor="user-login-enabled" className="text-sm text-gray-700">
            Login enabled
          </label>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          disabled={saving || !canSubmit}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
