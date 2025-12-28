import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useRequestCustomDomain,
  useVerifyCustomDomain,
  useIssueSsl,
  useDomainStatusPolling,
} from '../../hooks/useCustomDomains';
import type { VerificationMethod } from '../../types/api.types';
import type { CustomDomain } from '../../types/api.types';
import ProvisioningLogViewer from '../../components/logs/ProvisioningLogViewer';
import StatusChip from '../../components/common/StatusChip';

const customDomainSchema = z.object({
  domain: z.string()
    .min(4, 'Domain must be at least 4 characters')
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Invalid domain format (e.g., example.com)'),
  verificationMethod: z.enum(['TXT', 'CNAME'] as const),
});

type CustomDomainFormData = z.infer<typeof customDomainSchema>;

interface CustomDomainRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomDomainRequestModal({ open, onClose }: CustomDomainRequestModalProps) {
  const [requestedDomain, setRequestedDomain] = useState<CustomDomain | null>(null);
  const [step, setStep] = useState<'request' | 'verify' | 'ssl'>('request');

  const requestDomainMutation = useRequestCustomDomain();
  const verifyDomainMutation = useVerifyCustomDomain();
  const issueSslMutation = useIssueSsl();

  // Poll domain status while in verification/ssl phases
  const { data: polledDomain, refetch: refetchPolledDomain } = useDomainStatusPolling(
    requestedDomain?._id || '',
    !!requestedDomain && step !== 'request'
  );

  const currentDomain = polledDomain || requestedDomain;

  useEffect(() => {
    if (!currentDomain) return;
    if (currentDomain.status === 'pending_verification') {
      setStep('verify');
    }
    if (['verified', 'ssl_pending', 'ssl_issued', 'active', 'failed'].includes(currentDomain.status)) {
      setStep('ssl');
    }
  }, [currentDomain]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CustomDomainFormData>({
    resolver: zodResolver(customDomainSchema),
    mode: 'onChange',
    defaultValues: {
      domain: '',
      verificationMethod: 'TXT',
    },
  });

  const watchedMethod = watch('verificationMethod');

  const onSubmit = async (data: CustomDomainFormData) => {
    try {
      const result = await requestDomainMutation.mutateAsync(data);
      setRequestedDomain(result);
      setStep('verify');
    } catch (error) {
      // Error is handled by mutation hook
    }
  };

  const handleVerify = async () => {
    if (!currentDomain) return;
    try {
      const result = await verifyDomainMutation.mutateAsync({
        id: currentDomain._id,
        dto: { method: currentDomain.verificationMethod },
      });
      if (result?.verified) {
        setStep('ssl');
      }
      await refetchPolledDomain();
    } catch (error) {
      // Error is handled by mutation hook
    }
  };

  const handleIssueSsl = async () => {
    if (!currentDomain) return;
    try {
      await issueSslMutation.mutateAsync(currentDomain._id);
      await refetchPolledDomain();
    } catch (error) {
      // Error is handled by mutation hook
    }
  };

  const handleClose = () => {
    reset();
    setRequestedDomain(null);
    setStep('request');
    onClose();
  };

  const renderDnsInstructions = () => {
    const dns = currentDomain?.dnsInstructions as any;
    if (!dns) return null;

    // Backend now returns an object: { method, target, instructions: string[] }
    if (!Array.isArray(dns) && dns.instructions) {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            DNS Configuration Required ({dns.method || 'TXT'}):
          </Typography>
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" gutterBottom>
              Target: <strong>{dns.target}</strong>
            </Typography>
            <Stack spacing={0.5}>
              {(dns.instructions as string[]).map((line: string, idx: number) => (
                <Typography key={idx} variant="body2">
                  {line}
                </Typography>
              ))}
            </Stack>
          </Alert>
        </Box>
      );
    }

    if (Array.isArray(dns) && dns.length > 0) {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            DNS Configuration Required:
          </Typography>
          {dns.map((instruction: any, index: number) => (
            <Alert key={index} severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>{instruction.description}</strong>
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  <strong>Type:</strong> {instruction.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Host:</strong> {instruction.host}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <strong>Value:</strong> {instruction.value}
                </Typography>
              </Stack>
            </Alert>
          ))}
        </Box>
      );
    }

    return null;
  };

  const renderStepContent = () => {
    if (step === 'request') {
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="info">
                Add your own custom domain (e.g., yourbusiness.com) to your tenant.
              </Alert>

              <Controller
                name="domain"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Custom Domain"
                    fullWidth
                    error={!!errors.domain}
                    helperText={errors.domain?.message || 'Enter your domain (e.g., example.com)'}
                    placeholder="example.com"
                  />
                )}
              />

              <FormControl fullWidth>
                <InputLabel>Verification Method</InputLabel>
                <Controller
                  name="verificationMethod"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Verification Method">
                      <MenuItem value="TXT">TXT Record (Recommended)</MenuItem>
                      <MenuItem value="CNAME">CNAME Record</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || requestDomainMutation.isPending}
            >
              {requestDomainMutation.isPending ? <CircularProgress size={24} /> : 'Request Domain'}
            </Button>
          </DialogActions>
        </form>
      );
    }

    if (step === 'verify') {
      return (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Domain: {currentDomain?.domain}
                </Typography>
                {currentDomain?.status && (
                  <StatusChip
                    label={currentDomain.status.replace(/_/g, ' ').toUpperCase()}
                    status={currentDomain.status}
                  />
                )}
              </Box>

              <Divider />

              {currentDomain?.status === 'pending_verification' && (
                <>
                  <Alert severity="warning">
                    Please configure your DNS settings according to the instructions below, then click "Verify DNS".
                  </Alert>
                  {renderDnsInstructions()}
                  {currentDomain?._id && (
                    <ProvisioningLogViewer
                      resourceId={currentDomain._id}
                      resourceType="custom-domain"
                      pollWhile={['pending_verification', 'verified', 'ssl_pending', 'ssl_issued']}
                    />
                  )}
                </>
              )}

              {currentDomain?.status === 'verified' && (
                <Alert severity="success">
                  Domain verified successfully! You can now issue an SSL certificate.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            {currentDomain?.status === 'pending_verification' && (
              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={verifyDomainMutation.isPending}
              >
                {verifyDomainMutation.isPending ? <CircularProgress size={24} /> : 'Verify DNS'}
              </Button>
            )}
            {currentDomain?.status === 'verified' && (
              <Button
                variant="contained"
                onClick={handleIssueSsl}
                disabled={issueSslMutation.isPending}
              >
                {issueSslMutation.isPending ? <CircularProgress size={24} /> : 'Issue SSL Certificate'}
              </Button>
            )}
          </DialogActions>
        </>
      );
    }

    if (step === 'ssl') {
      return (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Domain: {currentDomain?.domain}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {currentDomain?.status && (
                    <StatusChip
                      label={currentDomain.status.replace(/_/g, ' ').toUpperCase()}
                      status={currentDomain.status}
                    />
                  )}
                  {currentDomain?.sslStatus && (
                    <StatusChip
                      label={`SSL: ${currentDomain.sslStatus.toUpperCase()}`}
                      status={currentDomain.sslStatus}
                    />
                  )}
                </Stack>
              </Box>

              <Divider />

              {currentDomain?.sslStatus === 'pending' && (
                <Alert severity="info">
                  SSL certificate issuance in progress. This may take a few minutes.
                </Alert>
              )}

              {currentDomain?.sslStatus === 'issued' && (
                <Alert severity="success">
                  SSL certificate issued successfully! Your custom domain is ready to use.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          </DialogActions>
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {step === 'request' && 'Request Custom Domain'}
        {step === 'verify' && 'Verify Domain Ownership'}
        {step === 'ssl' && 'SSL Certificate'}
      </DialogTitle>
      {renderStepContent()}
    </Dialog>
  );
}
