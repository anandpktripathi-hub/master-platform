import React from "react";

interface User {
  _id?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface UserTableProps {
  users?: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

/**
 * Minimal placeholder UserTable component.
 * Replace with real table, pagination, filters later.
 */
const UserTable: React.FC<UserTableProps> = ({ users = [] }) => {
  return (
    <div className="p-4 border border-dashed border-[var(--admin-border,#555)] rounded-lg">
      <p>UserTable placeholder. Total users: {users.length}</p>
      <ul>
        {users.map((u, idx) => (
          <li key={u._id ?? u.id ?? idx}>{u.email ?? "Unknown user"}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserTable;
