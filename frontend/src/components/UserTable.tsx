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
    <div style={{ padding: "1rem", border: "1px dashed #555", borderRadius: 8 }}>
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
