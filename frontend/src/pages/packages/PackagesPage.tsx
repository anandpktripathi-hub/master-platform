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
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import CurrentPlanCard from './CurrentPlanCard';
import { useAuth } from '../../contexts/AuthContext';
import { useApplyCoupon, useValidateCoupon } from '../../hooks/useCoupons';
import { useAssignPackageToSelf, useCurrentPackageWithUsage, usePublicPackages } from '../../hooks/usePackages';
import type { Package, ValidateCouponResponse } from '../../types/api.types';

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
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<ValidateCouponResponse | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

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

      await assignPackageMutation.mutateAsync({ packageId: selectedPackageId, tenantId });
      setUpgradeError(null);
      setCouponResult(null);
      setCouponCode('');
      refetchPackages();
    } catch (error: any) {
      setUpgradeError(error?.message || 'Upgrade failed. Check your permissions or try again.');
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
        <Typography variant="h4">Packages</Typography>
        <Button variant="outlined" onClick={() => { refetchPackages(); }}>
          Refresh
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <CurrentPlanCard />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Choose a package</Typography>

                {packages.length === 0 && (
                  <Alert severity="info">No packages available at the moment.</Alert>
                )}

                <Grid container spacing={2}>
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg._id;
                    return (
                      <Grid item xs={12} sm={6} key={pkg._id}>
                        <Card variant={isSelected ? 'outlined' : undefined} sx={{ borderColor: isSelected ? 'primary.main' : undefined }}>
                          <CardContent>
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{pkg.name}</Typography>
                                <Chip label={pkg.billingCycle.toUpperCase()} size="small" />
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
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
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
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={handleValidateCoupon} disabled={validateCouponMutation.isPending}>
                      Validate
                    </Button>
                    <Button variant="contained" onClick={handleUpgrade} disabled={assignPackageMutation.isPending}>
                      Upgrade
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
    </Box>
  );
}

function DividerSection() {
  return <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 1 }} />;
}
