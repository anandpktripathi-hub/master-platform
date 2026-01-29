import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Plan } from '../types/billing.types';
import billingService from '../../services/billingService';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { formatCurrencyWithSettings } from '../../utils/formatting';

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  userLimit: number;
  productsLimit: number;
  ordersLimit: number;
  storageLimitMB: number;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: PlanFormData = {
  name: '',
  slug: '',
  description: '',
  priceMonthly: 0,
  priceYearly: 0,
  features: [],
  userLimit: 10,
  productsLimit: 50,
  ordersLimit: 100,
  storageLimitMB: 1024,
  isActive: true,
  displayOrder: 0,
};

const PlanManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = useAdminSettings();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [featureInput, setFeatureInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await billingService.getPlans();
        const sorted = [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setPlans(sorted);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load plans';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [enqueueSnackbar]);

  const handleOpenForm = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || '',
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features || [],
        userLimit: plan.userLimit,
        productsLimit: plan.productsLimit,
        ordersLimit: plan.ordersLimit,
        storageLimitMB: plan.storageLimitMB,
        isActive: plan.isActive !== false,
        displayOrder: plan.displayOrder || 0,
      });
    } else {
      setEditingPlan(null);
      setFormData(initialFormData);
    }
    setFeatureInput('');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPlan(null);
    setFormData(initialFormData);
    setFeatureInput('');
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitForm = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.slug.trim()) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingPlan) {
        // Update existing plan
        await billingService.updatePlan(editingPlan._id!, formData);
        enqueueSnackbar('Plan updated successfully', { variant: 'success' });
      } else {
        // Create new plan
        await billingService.createPlan(formData);
        enqueueSnackbar('Plan created successfully', { variant: 'success' });
      }

      // Refresh plans list
      const data = await billingService.getPlans();
      const sorted = [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setPlans(sorted);

      handleCloseForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save plan';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      setIsSubmitting(true);
      await billingService.deletePlan(planToDelete._id!);
      enqueueSnackbar('Plan deleted successfully', { variant: 'success' });

      setPlans((prev) => prev.filter((p) => p._id !== planToDelete._id));
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amountInCents: number) => {
    return formatCurrencyWithSettings(amountInCents, null, currency);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Billing Plans
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage subscription plans available to your customers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Create Plan
        </Button>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Plans Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Monthly Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Yearly Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No plans created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {plan.slug}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(plan.priceMonthly)}</TableCell>
                      <TableCell align="right">{formatCurrency(plan.priceYearly)}</TableCell>
                      <TableCell align="center">
                        {plan.isActive !== false ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : (
                          <Chip label="Inactive" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plan.displayOrder || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(plan)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setPlanToDelete(plan);
                              setDeleteConfirmOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Plan Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? `Edit ${editingPlan.name} Plan` : 'Create New Plan'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {/* Basic Info */}
            <TextField
              label="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              placeholder="e.g., Professional"
            />

            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              fullWidth
              placeholder="e.g., professional"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description of the plan"
            />

            {/* Pricing */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Monthly Price (₹)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={formData.priceMonthly / 100}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceMonthly: Math.round(parseFloat(e.target.value) * 100),
                  }))
                }
              />
              <TextField
                label="Yearly Price (₹)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={formData.priceYearly / 100}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceYearly: Math.round(parseFloat(e.target.value) * 100),
                  }))
                }
              />
            </Box>

            {/* Limits */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Resource Limits
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="User Limit"
                type="number"
                inputProps={{ min: '1' }}
                value={formData.userLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userLimit: parseInt(e.target.value) }))
                }
              />
              <TextField
                label="Product Limit"
                type="number"
                inputProps={{ min: '1' }}
                value={formData.productsLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, productsLimit: parseInt(e.target.value) }))
                }
              />
              <TextField
                label="Order Limit"
                type="number"
                inputProps={{ min: '1' }}
                value={formData.ordersLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ordersLimit: parseInt(e.target.value) }))
                }
              />
              <TextField
                label="Storage Limit (MB)"
                type="number"
                inputProps={{ min: '1' }}
                value={formData.storageLimitMB}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, storageLimitMB: parseInt(e.target.value) }))
                }
              />
            </Box>

            {/* Features */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Features
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Add Feature"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddFeature}
                sx={{ minWidth: 100 }}
              >
                Add
              </Button>
            </Box>

            {formData.features.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.features.map((feature, idx) => (
                  <Chip
                    key={idx}
                    label={feature}
                    onDelete={() => handleRemoveFeature(idx)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {/* Display Settings */}
            <TextField
              label="Display Order"
              type="number"
              inputProps={{ min: '0' }}
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayOrder: parseInt(e.target.value),
                }))
              }
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the <strong>{planToDelete?.name}</strong> plan?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePlan}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlanManager;
