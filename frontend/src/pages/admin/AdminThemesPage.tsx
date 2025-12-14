import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, Star, StarBorder } from '@mui/icons-material';
import type {
  ThemeResponse,
  CreateThemeDto,
  UpdateThemeDto,
} from '../../services/themeApi';
import {
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme,
} from '../../services/themeApi';

interface ThemeError {
  response?: { data?: { message?: string } };
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeResponse | null>(null);
  const [formData, setFormData] = useState<CreateThemeDto>({
    name: '',
    slug: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#ffffff',
    surfaceColor: '#f5f5f5',
    textPrimaryColor: '#000000',
    textSecondaryColor: '#666666',
    fontFamily: 'Roboto, sans-serif',
    baseFontSize: 14,
    baseSpacing: 8,
    borderRadius: 4,
    isActive: true,
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllThemes();
      setThemes(data);
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to fetch themes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (theme?: ThemeResponse) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        name: theme.name,
        slug: theme.slug,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        backgroundColor: theme.backgroundColor,
        surfaceColor: theme.surfaceColor,
        textPrimaryColor: theme.textPrimaryColor,
        textSecondaryColor: theme.textSecondaryColor,
        fontFamily: theme.fontFamily,
        baseFontSize: theme.baseFontSize,
        baseSpacing: theme.baseSpacing,
        borderRadius: theme.borderRadius,
        isActive: theme.isActive,
      });
    } else {
      setEditingTheme(null);
      setFormData({
        name: '',
        slug: '',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        backgroundColor: '#ffffff',
        surfaceColor: '#f5f5f5',
        textPrimaryColor: '#000000',
        textSecondaryColor: '#666666',
        fontFamily: 'Roboto, sans-serif',
        baseFontSize: 14,
        baseSpacing: 8,
        borderRadius: 4,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTheme(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (editingTheme) {
        await updateTheme(editingTheme._id, formData as UpdateThemeDto);
        setSuccess('Theme updated successfully');
      } else {
        await createTheme(formData);
        setSuccess('Theme created successfully');
      }
      handleCloseDialog();
      fetchThemes();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to save theme');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      setError(null);
      await deleteTheme(id);
      setSuccess('Theme deleted successfully');
      fetchThemes();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to delete theme');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setError(null);
      await setDefaultTheme(id);
      setSuccess('Default theme updated');
      fetchThemes();
    } catch (err: unknown) {
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to set default theme');
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'slug', headerName: 'Slug', flex: 1 },
    {
      field: 'primaryColor',
      headerName: 'Primary',
      width: 100,
      renderCell: (params: { value: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: params.value, border: '1px solid #ccc' }} />
          <Typography variant="caption">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      renderCell: (params: { value: boolean }) => (
        <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'isDefault',
      headerName: 'Default',
      width: 100,
      renderCell: (params: { value: boolean; row: ThemeResponse }) => (
        <IconButton size="small" onClick={() => !params.value && handleSetDefault(params.row._id)}>
          {params.value ? <Star color="primary" /> : <StarBorder />}
        </IconButton>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: { row: ThemeResponse }) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row._id)} disabled={params.row.isDefault}>
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Theme Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Create Theme
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card>
        <CardContent>
          <DataGrid
            rows={themes}
            columns={columns}
            loading={loading}
            getRowId={(row: ThemeResponse) => row._id}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTheme ? 'Edit Theme' : 'Create Theme'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              required
              helperText="Unique identifier (lowercase, hyphens)"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Primary Color"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                fullWidth
              />
              <TextField
                label="Secondary Color"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                fullWidth
              />
              <TextField
                label="Background Color"
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                fullWidth
              />
              <TextField
                label="Surface Color"
                type="color"
                value={formData.surfaceColor}
                onChange={(e) => setFormData({ ...formData, surfaceColor: e.target.value })}
                fullWidth
              />
              <TextField
                label="Text Primary Color"
                type="color"
                value={formData.textPrimaryColor}
                onChange={(e) => setFormData({ ...formData, textPrimaryColor: e.target.value })}
                fullWidth
              />
              <TextField
                label="Text Secondary Color"
                type="color"
                value={formData.textSecondaryColor}
                onChange={(e) => setFormData({ ...formData, textSecondaryColor: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              label="Font Family"
              value={formData.fontFamily}
              onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Base Font Size (px)"
                type="number"
                value={formData.baseFontSize}
                onChange={(e) => setFormData({ ...formData, baseFontSize: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Base Spacing (px)"
                type="number"
                value={formData.baseSpacing}
                onChange={(e) => setFormData({ ...formData, baseSpacing: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Border Radius (px)"
                type="number"
                value={formData.borderRadius}
                onChange={(e) => setFormData({ ...formData, borderRadius: Number(e.target.value) })}
                fullWidth
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTheme ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
