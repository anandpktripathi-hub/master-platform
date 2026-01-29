import React, { useRef, useState } from 'react';
import { Box, Button, Avatar, Typography } from '@mui/material';

interface PackageIconUploadProps {
  iconUrl?: string;
  onIconChange: (file: File | null, previewUrl: string | null) => void;
}

const PackageIconUpload: React.FC<PackageIconUploadProps> = ({ iconUrl, onIconChange }) => {
  const [preview, setPreview] = useState<string | null>(iconUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        onIconChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onIconChange(null, null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Avatar src={preview || undefined} sx={{ width: 64, height: 64 }} />
      <Button variant="outlined" onClick={() => inputRef.current?.click()}>
        {preview ? 'Change Icon' : 'Upload Icon'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Typography variant="caption" color="textSecondary">
        Recommended: Square PNG, SVG, or JPG. Max 1MB.
      </Typography>
    </Box>
  );
};

export default PackageIconUpload;
