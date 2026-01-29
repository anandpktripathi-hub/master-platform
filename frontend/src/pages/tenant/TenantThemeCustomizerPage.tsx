import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Alert,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import type { CustomizeThemeDto, TenantThemeResponse } from '../../services/themeApi';
import { getCurrentTheme, customizeTheme, resetTheme } from '../../services/themeApi';
import { useTheme } from '../../contexts/ThemeContext';
import { useCanUseFeature } from '../../hooks/usePackages';
import { useNavigate } from 'react-router-dom';

interface ThemeError {
  response?: { data?: { message?: string } };
}

export default function TenantThemeCustomizerPage() {
  const { refreshTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<TenantThemeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [customizations, setCustomizations] = useState<CustomizeThemeDto>({});
  const { data: customThemeFeature, isLoading: featureLoading } = useCanUseFeature('customTheme');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentTheme();
  }, []);

  const fetchCurrentTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      const theme = await getCurrentTheme();
      setCurrentTheme(theme);
      
      // Load existing customizations
      if (theme.customizations) {
        setCustomizations({
          customPrimaryColor: theme.customizations.primaryColor,
          customSecondaryColor: theme.customizations.secondaryColor,
          customBackgroundColor: theme.customizations.backgroundColor,
          customSurfaceColor: theme.customizations.surfaceColor,
          customTextPrimaryColor: theme.customizations.textPrimaryColor,
          customTextSecondaryColor: theme.customizations.textSecondaryColor,
          customFontFamily: theme.customizations.fontFamily,
          customBaseFontSize: theme.customizations.baseFontSize,
          customBaseSpacing: theme.customizations.baseSpacing,
          customBorderRadius: theme.customizations.borderRadius,
        });
      }
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to load theme');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Filter out undefined values
      const payload = Object.fromEntries(
        Object.entries(customizations).filter(([, v]) => v !== undefined)
      ) as CustomizeThemeDto;
      
      await customizeTheme(payload);
      setSuccess('Theme customized successfully');
      
      // Refresh theme context to apply changes
      await refreshTheme();
      await fetchCurrentTheme();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to customize theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all customizations and return to base theme?')) return;
    
    try {
      setSaving(true);
      setError(null);
      await resetTheme();
      setSuccess('Theme reset successfully');
      setCustomizations({});
      
      // Refresh theme context
      await refreshTheme();
      await fetchCurrentTheme();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to reset theme');
    } finally {
      setSaving(false);
    }
  };

  if (featureLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (customThemeFeature && !customThemeFeature.canUse) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Custom themes are not included in your current plan. Upgrade your subscription to unlock theme
          customization.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/app/packages')}>
          View plans & upgrade
        </Button>
      </Box>
    );
  }

  if (!currentTheme) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please select a theme first</Alert>
      </Box>
    );
  }

  const preview = {
    primaryColor: customizations.customPrimaryColor || currentTheme.primaryColor,
    secondaryColor: customizations.customSecondaryColor || currentTheme.secondaryColor,
    backgroundColor: customizations.customBackgroundColor || currentTheme.backgroundColor,
    surfaceColor: customizations.customSurfaceColor || currentTheme.surfaceColor,
    textPrimaryColor: customizations.customTextPrimaryColor || currentTheme.textPrimaryColor,
    textSecondaryColor: customizations.customTextSecondaryColor || currentTheme.textSecondaryColor,
    fontFamily: customizations.customFontFamily || currentTheme.fontFamily,
    baseFontSize: customizations.customBaseFontSize ?? currentTheme.baseFontSize,
    baseSpacing: customizations.customBaseSpacing ?? currentTheme.baseSpacing,
    borderRadius: customizations.customBorderRadius ?? currentTheme.borderRadius,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customize Theme</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleReset} disabled={saving}>
            Reset to Base
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Customization Controls */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Colors</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Primary Color"
                  type="color"
                  value={preview.primaryColor}
                  onChange={(e) => setCustomizations({ ...customizations, customPrimaryColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.primaryColor}`}
                />
                <TextField
                  label="Secondary Color"
                  type="color"
                  value={preview.secondaryColor}
                  onChange={(e) => setCustomizations({ ...customizations, customSecondaryColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.secondaryColor}`}
                />
                <TextField
                  label="Background Color"
                  type="color"
                  value={preview.backgroundColor}
                  onChange={(e) => setCustomizations({ ...customizations, customBackgroundColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.backgroundColor}`}
                />
                <TextField
                  label="Surface Color"
                  type="color"
                  value={preview.surfaceColor}
                  onChange={(e) => setCustomizations({ ...customizations, customSurfaceColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.surfaceColor}`}
                />
                <TextField
                  label="Text Primary Color"
                  type="color"
                  value={preview.textPrimaryColor}
                  onChange={(e) => setCustomizations({ ...customizations, customTextPrimaryColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.textPrimaryColor}`}
                />
                <TextField
                  label="Text Secondary Color"
                  type="color"
                  value={preview.textSecondaryColor}
                  onChange={(e) => setCustomizations({ ...customizations, customTextSecondaryColor: e.target.value })}
                  fullWidth
                  helperText={`Base: ${currentTheme.textSecondaryColor}`}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Typography</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                label="Font Family"
                value={preview.fontFamily}
                onChange={(e) => setCustomizations({ ...customizations, customFontFamily: e.target.value })}
                fullWidth
                helperText={`Base: ${currentTheme.fontFamily}`}
              />

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Base Font Size: {preview.baseFontSize}px</Typography>
                <Slider
                  value={preview.baseFontSize}
                  onChange={(_, value) => setCustomizations({ ...customizations, customBaseFontSize: value as number })}
                  min={10}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Spacing</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Base Spacing: {preview.baseSpacing}px</Typography>
                <Slider
                  value={preview.baseSpacing}
                  onChange={(_, value) => setCustomizations({ ...customizations, customBaseSpacing: value as number })}
                  min={4}
                  max={16}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Border Radius: {preview.borderRadius}px</Typography>
                <Slider
                  value={preview.borderRadius}
                  onChange={(_, value) => setCustomizations({ ...customizations, customBorderRadius: value as number })}
                  min={0}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Live Preview</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box 
                sx={{ 
                  bgcolor: preview.backgroundColor, 
                  p: preview.baseSpacing / 8,
                  minHeight: 400,
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: preview.surfaceColor, 
                    p: preview.baseSpacing / 8,
                    borderRadius: `${preview.borderRadius}px`,
                    mb: preview.baseSpacing / 8,
                  }}
                >
                  <Typography 
                    sx={{ 
                      color: preview.textPrimaryColor, 
                      fontFamily: preview.fontFamily,
                      fontSize: `${preview.baseFontSize}px`,
                      mb: 1,
                    }}
                  >
                    Sample Heading
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: preview.textSecondaryColor, 
                      fontFamily: preview.fontFamily,
                      fontSize: `${preview.baseFontSize - 2}px`,
                    }}
                  >
                    This is sample secondary text to preview your theme customizations.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: preview.baseSpacing / 8 }}>
                  <Box 
                    sx={{ 
                      bgcolor: preview.primaryColor, 
                      color: 'white',
                      p: preview.baseSpacing / 8,
                      borderRadius: `${preview.borderRadius}px`,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: preview.fontFamily,
                    }}
                  >
                    Primary Button
                  </Box>
                  <Box 
                    sx={{ 
                      bgcolor: preview.secondaryColor, 
                      color: 'white',
                      p: preview.baseSpacing / 8,
                      borderRadius: `${preview.borderRadius}px`,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: preview.fontFamily,
                    }}
                  >
                    Secondary Button
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
