import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

interface StripeCheckoutLocationState {
  clientSecret?: string;
  amount?: number;
  currency?: string;
  planName?: string;
}

const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const StripeCheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation() as { state?: StripeCheckoutLocationState };

  const [isProcessing, setIsProcessing] = useState(false);

  const [gatewayName, setGatewayName] = useState<'stripe' | 'paypal'>(
    location.state?.gatewayName === 'paypal' ? 'paypal' : 'stripe',
  );

  const clientSecret = location.state?.clientSecret;
  const amount = location.state?.amount;
  const currency = location.state?.currency || 'usd';
  const planName = location.state?.planName;

  if (gatewayName === 'stripe' && !clientSecret) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Missing payment information
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          We couldn't find an active payment session. Please start again from the pricing page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/app/billing')}
        >
          Go to Billing Dashboard
        </Button>
      </Container>
    );
  }

  if (gatewayName === 'stripe' && (!publishableKey || !stripePromise)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Stripe is not configured
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          The Stripe publishable key is not configured. Please contact support or an administrator.
        </Typography>
      </Container>
    );
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      enqueueSnackbar('Card details not found. Please try again.', { variant: 'error' });
      return;
    }

    try {
      setIsProcessing(true);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        // Handle specific card decline scenarios with user-friendly messages
        let errorMessage = error.message || 'Payment failed. Please try again.';
        
        switch (error.code) {
          case 'card_declined':
            errorMessage = 'Your card was declined. Please check your card details or try a different card.';
            break;
          case 'expired_card':
            errorMessage = 'Your card has expired. Please use a different card.';
            break;
          case 'incorrect_cvc':
            errorMessage = 'The card security code (CVC) is incorrect. Please check and try again.';
            break;
          case 'processing_error':
            errorMessage = 'An error occurred while processing your card. Please try again.';
            break;
          case 'insufficient_funds':
            errorMessage = 'Your card has insufficient funds. Please use a different card.';
            break;
          case 'invalid_number':
            errorMessage = 'The card number is invalid. Please check and try again.';
            break;
          case 'invalid_expiry_month':
          case 'invalid_expiry_year':
            errorMessage = 'The card expiration date is invalid. Please check and try again.';
            break;
        }

        enqueueSnackbar(errorMessage, { variant: 'error' });
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        enqueueSnackbar('Payment successful! Your subscription is now active.', {
          variant: 'success',
        });
        navigate('/app/billing');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'processing') {
        enqueueSnackbar(
          'Your payment is being processed. This may take a few moments. We will update your subscription status automatically.',
          { variant: 'info' }
        );
        navigate('/app/billing');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
        enqueueSnackbar('Payment failed. Please try a different payment method.', {
          variant: 'error',
        });
        return;
      }

      enqueueSnackbar('Payment could not be completed. Please contact support.', {
        variant: 'warning',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected payment error';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Complete Your Payment
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {planName
          ? `Securely pay for your ${planName} plan using your card.`
          : 'Securely complete your subscription payment using your card.'}
      </Typography>

      {typeof amount === 'number' && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Amount:{' '}
          <strong>
            {(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </strong>
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          fullWidth
          label="Payment gateway"
          value={gatewayName}
          onChange={(e) => setGatewayName(e.target.value as 'stripe' | 'paypal')}
          helperText="Choose how you want to complete this subscription payment."
        >
          <MenuItem value="stripe">Stripe (card payment)</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
        </TextField>
      </Box>

      {gatewayName === 'stripe' ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box
              sx={{ mb: 3, p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': {
                        color: '#a0aec0',
                      },
                    },
                    invalid: {
                      color: '#e53e3e',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                type="button"
                onClick={() => navigate('/app/billing')}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!stripe || !elements || isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            </Box>
          </form>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Pay with PayPal
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            PayPal-based subscription checkout will be wired to the live PayPal
            gateway next. For now, please complete this subscription using
            Stripe, or contact support if you require PayPal billing.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/app/billing')}
            >
              Back to Billing
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

const BillingStripeCheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm />
    </Elements>
  );
};

export default BillingStripeCheckoutPage;
