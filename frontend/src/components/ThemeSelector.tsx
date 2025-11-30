import React from 'react';
import { useThemeContext } from '../contexts/ThemeContext';
import { Select, MenuItem, CircularProgress, Typography } from '@mui/material';

const ThemeSelector = () => {
  const { themes, selectTheme, theme, loading, error } = useThemeContext();

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Select
        value={theme?.name || ''}
        onChange={(e) => selectTheme(e.target.value as string)}
        displayEmpty
        inputProps={{ 'aria-label': 'Select Theme' }}
      >
        <MenuItem value="" disabled>
          Select Theme
        </MenuItem>
        {themes.map((theme) => (
          <MenuItem key={theme.name} value={theme.name}>
            {theme.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default ThemeSelector;
