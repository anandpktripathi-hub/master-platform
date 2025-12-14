import React from "react";

interface UserData {
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface UserFormProps {
  mode?: "create" | "edit";
  user?: UserData;
  onSubmit?: (data: UserData) => void;
  onCancel?: () => void;
}

/**
 * Minimal placeholder UserForm component.
 * Replace with real form UI & validation later.
 */
const UserForm: React.FC<UserFormProps> = ({ mode = "create" }) => {
  return (
    <div style={{ padding: "1rem", border: "1px dashed #555", borderRadius: 8 }}>
      <p>UserForm placeholder ({mode} mode).</p>
      <p>TODO: Implement full user form UI.</p>
    </div>
  );
};

export default UserForm;
