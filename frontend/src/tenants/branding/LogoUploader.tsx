import React from 'react';

export const LogoUploader: React.FC<{ onUpload: (file: File) => void }> = ({ onUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };
  return (
    <div>
      <label htmlFor="logo-upload">Upload Logo:</label>
      <input id="logo-upload" type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
};

export default LogoUploader;
