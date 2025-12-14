import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Check, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { ThemeResponse } from '../../services/themeApi';
import { getAvailableThemes, getCurrentTheme, selectTheme } from '../../services/themeApi';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeError {
  response?: { data?: { message?: string } };
}

export default function TenantThemeSelectorPage() {
  const navigate = useNavigate();
  const { refreshTheme } = useTheme();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [availableThemes, currentTheme] = await Promise.all([
        getAvailableThemes(),
        getCurrentTheme(),
      ]);
      setThemes(availableThemes);
      setCurrentThemeId(currentTheme.baseThemeId);
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = async (themeId: string) => {
    try {
      setSelecting(themeId);
      setError(null);
      await selectTheme(themeId);
      setCurrentThemeId(themeId);
      setSuccess('Theme selected successfully');
      // Refresh theme context to apply new theme
      await refreshTheme();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to select theme');
    } finally {
      setSelecting(null);
    }
  };

  const handleCustomizeTheme = () => {
    navigate('/tenant/theme/customize');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Select Theme</Typography>
        {currentThemeId && (
          <Button variant="outlined" startIcon={<Edit />} onClick={handleCustomizeTheme}>
            Customize Theme
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Grid container spacing={3}>
        {themes.map((theme) => {
          const isSelected = theme._id === currentThemeId;
          const isSelecting = selecting === theme._id;

          return (
            <Grid item xs={12} sm={6} md={4} key={theme._id} component="div">
              <Card 
                sx={{ 
                  border: isSelected ? 2 : 1, 
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <Chip
                    label="Current"
                    color="primary"
                    size="small"
                    icon={<Check />}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  />
                )}
                
                {/* Theme Preview */}
                <Box 
                  sx={{ 
                    height: 150, 
                    bgcolor: theme.backgroundColor,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 30, 
                        bgcolor: theme.primaryColor, 
                        borderRadius: `${theme.borderRadius}px`,
                      }} 
                    />
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 30, 
                        bgcolor: theme.secondaryColor, 
                        borderRadius: `${theme.borderRadius}px`,
                      }} 
                    />
                  </Box>
                  <Box 
                    sx={{ 
                      flex: 1, 
                      bgcolor: theme.surfaceColor, 
                      borderRadius: `${theme.borderRadius}px`,
                      p: 1.5,
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: theme.textPrimaryColor, 
                        fontFamily: theme.fontFamily,
                        fontSize: `${theme.baseFontSize}px`,
                        mb: 0.5,
                      }}
                    >
                      Sample Text
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: theme.textSecondaryColor, 
                        fontFamily: theme.fontFamily,
                        fontSize: `${theme.baseFontSize - 2}px`,
                      }}
                    >
                      Secondary Text
                    </Typography>
                  </Box>
                </Box>

                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {theme.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip 
                      label={theme.primaryColor} 
                      size="small" 
                      sx={{ bgcolor: theme.primaryColor, color: 'white' }}
                    />
                    <Chip 
                      label={theme.secondaryColor} 
                      size="small" 
                      sx={{ bgcolor: theme.secondaryColor, color: 'white' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Font: {theme.fontFamily}
                  </Typography>
                  {theme.isDefault && (
                    <Chip label="Default" color="info" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>

                <CardActions>
                  {isSelected ? (
                    <Button fullWidth variant="outlined" disabled>
                      Selected
                    </Button>
                  ) : (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => handleSelectTheme(theme._id)}
                      disabled={isSelecting}
                    >
                      {isSelecting ? <CircularProgress size={24} /> : 'Select'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
