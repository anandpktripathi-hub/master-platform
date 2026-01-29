import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  Alert,
  Chip,
  Divider,
  MenuItem,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import CurrentPlanCard from './CurrentPlanCard';
import { useAuth } from '../../contexts/AuthContext';
import { useApplyCoupon, useValidateCoupon } from '../../hooks/useCoupons';
import {
  useAssignPackageToSelf,
  useCurrentPackageWithUsage,
  usePublicPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  usePackagePlanSummary,
} from '../../hooks/usePackages';
import type { Package, ValidateCouponResponse } from '../../types/api.types';
import PackageHierarchyAssignment from '../../modules/hierarchy/PackageHierarchyAssignment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PackageIconUpload from '../../components/PackageIconUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function PackagesPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';

  const {
    package: currentPackage,
    tenantPackage,
    usage,
    isLoading: currentLoading,
    isError: currentError,
  } = useCurrentPackageWithUsage();

  const {
    data: packagesData = [],
    isLoading: packagesLoading,
    isError: packagesError,
    refetch: refetchPackages,
  } = usePublicPackages();

  const packages = useMemo(() => {
    if (Array.isArray(packagesData)) return packagesData as Package[];
    return (packagesData as any)?.data ?? [];
  }, [packagesData]);

  const assignPackageMutation = useAssignPackageToSelf();
  const validateCouponMutation = useValidateCoupon();
  const applyCouponMutation = useApplyCoupon();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showAssignment, setShowAssignment] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<ValidateCouponResponse | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [gatewayName, setGatewayName] = useState<'stripe' | 'paypal'>('stripe');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const deletePackageMutation = useDeletePackage();

  const isPlatformAdmin = user?.role === 'PLATFORM_SUPERADMIN';
  const planSummaryQuery = usePackagePlanSummary();

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setUpgradeError(null);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) {
      setUpgradeError('Enter a coupon code to validate.');
      return;
    }
    if (!selectedPackageId) {
      setUpgradeError('Select a package before applying a coupon.');
      return;
    }

    try {
      const result = await validateCouponMutation.mutateAsync({
        code: couponCode,
        packageId: selectedPackageId,
      });
      setCouponResult(result);
      if (!result.valid) {
        setUpgradeError(result.error || 'Coupon is not valid for this package.');
      } else {
        setUpgradeError(null);
      }
    } catch (error: any) {
      setUpgradeError(error?.message || 'Could not validate coupon.');
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackageId) {
      setUpgradeError('Please select a package to upgrade.');
      return;
    }

    try {
      // Validate and apply coupon if provided
      if (couponCode) {
        const validation = couponResult
          ? couponResult
          : await validateCouponMutation.mutateAsync({ code: couponCode, packageId: selectedPackageId });

        if (!validation.valid) {
          setUpgradeError(validation.error || 'Coupon is not valid for this package.');
          return;
        }

        await applyCouponMutation.mutateAsync({ code: couponCode });
      }

      await assignPackageMutation.mutateAsync({
        packageId: selectedPackageId,
        tenantId,
        gatewayName,
      });
      setUpgradeError(null);
      setCouponResult(null);
      setCouponCode('');
      refetchPackages();
    } catch (error: any) {
      setUpgradeError(error?.message || 'Upgrade failed. Check your permissions or try again.');
    }
  };

  const handleDeletePackage = (pkg: Package) => {
    setPackageToDelete(pkg);
    setShowDeleteDialog(true);
  };

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackageMutation.mutateAsync(packageToDelete._id);
      setShowDeleteDialog(false);
      setPackageToDelete(null);
      refetchPackages();
    } catch (error) {
      // Toasts are handled inside the mutation hook
    }
  };

  const isLoading = packagesLoading || currentLoading;
  const isError = packagesError || currentError;

  if (isLoading) {
    return <LoadingState variant="table" fullHeight />;
  }

  if (isError) {
    return <ErrorState onRetry={() => { refetchPackages(); }} message="Unable to load packages." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Plans & Subscription</Typography>
          <Typography variant="body2" color="textSecondary">
            Review your current plan, manage upgrades or downgrades, and control how your subscription renews.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={() => { refetchPackages(); }}>
            Refresh
          </Button>
          <Button variant="contained" color="primary" onClick={() => { setEditingPackage(null); setShowPackageModal(true); }}>
            + Add Package
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <CurrentPlanCard />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Change plan or manage subscription</Typography>

                {tenantPackage && (
                  <Alert severity="info" variant="outlined">
                    You are currently on{' '}
                    <strong>{(tenantPackage as any).package?.name || currentPackage?.name}</strong>
                    {' '}({tenantPackage.status?.toUpperCase()}).
                    {tenantPackage.trialEndsAt && (
                      <>
                        {' '}Your free trial ends on{' '}
                        {new Date(tenantPackage.trialEndsAt).toLocaleDateString()}.
                      </>
                    )}
                    {tenantPackage.expiresAt && tenantPackage.status === 'active' && (
                      <>
                        {' '}Your current billing period renews on{' '}
                        {new Date(tenantPackage.expiresAt).toLocaleDateString()}.
                      </>
                    )}
                    {!tenantPackage.trialEndsAt && !tenantPackage.expiresAt && (
                      <>
                        {' '}Your subscription stays active until you change or cancel your plan.
                      </>
                    )}
                  </Alert>
                )}

                {packages.length === 0 && (
                  <Alert severity="info">No packages available at the moment.</Alert>
                )}

                <Grid container spacing={2}>
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg._id;
                    return (
                      <React.Fragment key={pkg._id}>
                        <Grid item xs={12} sm={6}>
                          <Card variant={isSelected ? 'outlined' : undefined} sx={{ borderColor: isSelected ? 'primary.main' : undefined }}>
                            <CardContent>
                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="h6">{pkg.name}</Typography>
                                  <Chip label={pkg.billingCycle.toUpperCase()} size="small" />
                                  <Button size="small" variant="text" onClick={() => { setEditingPackage(pkg); setShowPackageModal(true); }}>Edit</Button>
                                  <Button size="small" color="error" variant="text" onClick={() => handleDeletePackage(pkg)}>Delete</Button>
                                </Stack>
                                <Typography variant="body2" color="textSecondary">
                                  {pkg.description || 'Package for your tenant'}
                                </Typography>
                                <Typography variant="h5" color="primary">
                                  ${pkg.price.toFixed(2)}
                                </Typography>
                                <Button
                                  variant={isSelected ? 'contained' : 'outlined'}
                                  fullWidth
                                  onClick={() => handleSelectPackage(pkg._id)}
                                >
                                  {isSelected ? 'Selected' : 'Select'}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 1 }}
                                  onClick={() => setShowAssignment(showAssignment === pkg._id ? null : pkg._id)}
                                >
                                  Assign Features
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        {showAssignment === pkg._id && (
                          <Grid item xs={12}>
                            <PackageHierarchyAssignment packageId={pkg._id} />
                          </Grid>
                        )}
                      </React.Fragment>
                    );
                  })}
                </Grid>

                <DividerSection />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                  <TextField
                    label="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Payment gateway"
                    value={gatewayName}
                    onChange={(e) => setGatewayName(e.target.value as 'stripe' | 'paypal')}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="stripe">Stripe</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                  </TextField>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={handleValidateCoupon}
                      disabled={validateCouponMutation.isPending}
                    >
                      Validate
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleUpgrade}
                      disabled={assignPackageMutation.isPending}
                    >
                      Apply & Change Plan
                    </Button>
                  </Stack>
                </Stack>

                {couponResult && (
                  <Alert severity={couponResult.valid ? 'success' : 'error'}>
                    {couponResult.valid
                      ? `Coupon applied! Discount: ${couponResult.discount ?? 0}`
                      : couponResult.message || couponResult.error || 'Coupon is invalid'}
                  </Alert>
                )}

                {upgradeError && <Alert severity="error">{upgradeError}</Alert>}

                {(assignPackageMutation.isPending || applyCouponMutation.isPending) && (
                  <Alert severity="info">Processing your upgrade...</Alert>
                )}

                {tenantPackage && currentPackage && usage && (
                  <Alert severity="info">
                    Current package: <strong>{currentPackage.name}</strong>. Status: {tenantPackage.status}.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isPlatformAdmin && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Plan Overview (Admin)</Typography>
                {planSummaryQuery.isLoading && (
                  <Typography variant="body2" color="textSecondary">
                    Loading plan summary...
                  </Typography>
                )}
                {planSummaryQuery.isError && (
                  <Alert severity="error">Failed to load plan summary.</Alert>
                )}
                {!planSummaryQuery.isLoading && !planSummaryQuery.isError && (
                  <Grid container spacing={2}>
                    {planSummaryQuery.data?.map((row) => (
                      <Grid item xs={12} md={4} key={row.package._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle1">{row.package.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Billing: {row.package.billingCycle.toUpperCase()} | Status: {row.package.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Expiry warning days: {row.package.expiryWarningDays ?? 'Global default'}
                              </Typography>
                              <Typography variant="body2">
                                Active tenants: {row.activeTenantCount} / Total tenants: {row.totalTenantCount}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Package Create/Edit Modal */}
      <Dialog open={showPackageModal} onClose={() => setShowPackageModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPackage ? 'Edit Package' : 'Create Package'}</DialogTitle>
        <PackageModalForm
          key={editingPackage?._id || 'new'}
          initialPackage={editingPackage}
          onClose={() => { setShowPackageModal(false); setEditingPackage(null); refetchPackages(); }}
        />
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Package"
        description={packageToDelete ? `Are you sure you want to delete the package '${packageToDelete.name}'? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deletePackageMutation.isPending}
        onConfirm={confirmDeletePackage}
        onClose={() => { setShowDeleteDialog(false); setPackageToDelete(null); }}
      />
    </Box>
  );
}

function DividerSection() {
  return <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 1 }} />;
}

// PackageModalForm component for create/edit
function PackageModalForm({ initialPackage, onClose }: { initialPackage?: Package | null; onClose: () => void }) {
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const [name, setName] = useState(initialPackage?.name || '');
  const [description, setDescription] = useState(initialPackage?.description || '');
  const [price, setPrice] = useState(initialPackage?.price?.toString() || '');
  const [billingCycle, setBillingCycle] = useState(initialPackage?.billingCycle || 'monthly');
  const [expiryWarningDays, setExpiryWarningDays] = useState(
    initialPackage && (initialPackage as any).expiryWarningDays
      ? String((initialPackage as any).expiryWarningDays)
      : '',
  );
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(initialPackage?.iconUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIconChange = (file: File | null, previewUrl: string | null) => {
    setIconFile(file);
    setIconPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !price || isNaN(Number(price)) || Number(price) < 0) {
      setError('Please enter a valid package name and price.');
      return;
    }
    if (!billingCycle) {
      setError('Please select a billing cycle.');
      return;
    }
    if (!iconFile && !iconPreview) {
      setError('Please upload a package icon.');
      return;
    }
    setLoading(true);
    try {
      const numericPrice = Number(price);
      const expiryDays = expiryWarningDays ? Number(expiryWarningDays) : undefined;

      if (!initialPackage) {
        const payload = {
          name,
          description,
          price: numericPrice,
          billingCycle: billingCycle as any,
          trialDays: 0,
          featureSet: {},
          limits: {},
          expiryWarningDays: expiryDays,
        };
        await createPackage.mutateAsync(payload as any);
      } else {
        const payload = {
          name,
          description,
          price: numericPrice,
          billingCycle: billingCycle as any,
          expiryWarningDays: expiryDays,
        };
        await updatePackage.mutateAsync({ id: initialPackage._id, dto: payload as any });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save package.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <TextField
          label="Package Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={2}
          fullWidth
        />
        <TextField
          label="Price (USD)"
          value={price}
          onChange={e => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
          required
          fullWidth
          inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', min: 0 }}
        />
        <TextField
          label="Billing Cycle"
          select
          value={billingCycle}
          onChange={e => setBillingCycle(e.target.value)}
          SelectProps={{ native: true }}
          required
          fullWidth
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Yearly</option>
        </TextField>
        <TextField
          label="Expiry warning days (optional, overrides global)"
          value={expiryWarningDays}
          onChange={e => setExpiryWarningDays(e.target.value.replace(/[^\d]/g, ''))}
          fullWidth
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
        />
        <PackageIconUpload iconUrl={iconPreview || undefined} onIconChange={handleIconChange} />
      </Stack>
      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : initialPackage ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </form>
  );
}
