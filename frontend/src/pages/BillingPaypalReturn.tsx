import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../lib/api';

const BillingPaypalReturn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isProcessing, setIsProcessing] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('token') || params.get('orderId');

    if (!orderId) {
      setHasError(true);
      setIsProcessing(false);
      enqueueSnackbar('Missing PayPal order information. Please try subscribing again.', {
        variant: 'error',
      });
      return;
    }

    const capture = async () => {
      try {
        setIsProcessing(true);
        const response = await api.post<{ success: boolean }>(
          `/payments/webhook/paypal/capture?orderId=${encodeURIComponent(orderId)}`,
          {},
        );

        if (response.success) {
          enqueueSnackbar('Payment successful! Your subscription will be activated shortly.', {
            variant: 'success',
          });
          navigate('/app/billing');
        } else {
          setHasError(true);
          enqueueSnackbar('Unable to finalize PayPal payment. Please contact support.', {
            variant: 'error',
          });
        }
      } catch (err) {
        setHasError(true);
        const message = err instanceof Error ? err.message : 'Unable to capture PayPal payment';
        enqueueSnackbar(message, { variant: 'error' });
      } finally {
        setIsProcessing(false);
      }
    };

    capture();
  }, [location.search, enqueueSnackbar, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        {isProcessing && (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Finalizing your PayPal payment...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please wait while we confirm your payment and activate your subscription.
            </Typography>
          </>
        )}

        {!isProcessing && !hasError && (
          <>
            <Typography variant="h6" gutterBottom>
              Payment processed
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your PayPal payment has been processed. You will be redirected to the
              billing dashboard.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/app/billing')}>
              Go to Billing Dashboard
            </Button>
          </>
        )}

        {!isProcessing && hasError && (
          <>
            <Typography variant="h6" color="error" gutterBottom>
              PayPal payment could not be confirmed
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Please return to the pricing page and try again, or contact support if the
              problem persists.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/pricing')}>
              Back to Pricing
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default BillingPaypalReturn;
