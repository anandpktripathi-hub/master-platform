import React from 'react';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDomain, useCheckDomainAvailability } from '../../hooks/useDomains';
import type { DomainType } from '../../types/api.types';

const domainSchema = z.object({
  type: z.enum(['path', 'subdomain'] as const),
  value: z.string()
    .min(3, 'Domain value must be at least 3 characters')
    .max(63, 'Domain value must not exceed 63 characters')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Invalid domain format. Use lowercase letters, numbers, and hyphens only.'),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DomainCreateModal({ open, onClose }: DomainCreateModalProps) {
  const createDomainMutation = useCreateDomain();
  const [checkAvailability, setCheckAvailability] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'subdomain',
      value: '',
    },
  });

  const watchedType = watch('type');
  const watchedValue = watch('value');

  // Check availability when value changes
  const { data: availabilityData, isLoading: checkingAvailability } = useCheckDomainAvailability(
    watchedType,
    watchedValue,
    checkAvailability && watchedValue.length >= 3
  );

  React.useEffect(() => {
    if (watchedValue.length >= 3) {
      setCheckAvailability(true);
    } else {
      setCheckAvailability(false);
    }
  }, [watchedValue]);

  const onSubmit = async (data: DomainFormData) => {
    try {
      await createDomainMutation.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      // Error is handled by mutation hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isAvailable = availabilityData?.available ?? null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create New Domain</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Domain Type */}
            <FormControl fullWidth>
              <InputLabel>Domain Type</InputLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Domain Type">
                    <MenuItem value="path">Path-based (e.g., platform.com/yourshop)</MenuItem>
                    <MenuItem value="subdomain">Subdomain (e.g., yourshop.platform.com)</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            {/* Domain Value */}
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Domain Value"
                  fullWidth
                  error={!!errors.value}
                  helperText={errors.value?.message || 'Enter your desired domain identifier'}
                  placeholder={watchedType === 'path' ? 'myshop' : 'myshop'}
                  InputProps={{
                    endAdornment: checkingAvailability && <CircularProgress size={20} />,
                  }}
                />
              )}
            />

            {/* Availability Status */}
            {isAvailable === true && (
              <Alert severity="success">
                This domain is available!
              </Alert>
            )}
            {isAvailable === false && (
              <Alert severity="error">
                {availabilityData?.message || 'This domain is not available.'}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isAvailable === false || createDomainMutation.isPending}
          >
            {createDomainMutation.isPending ? <CircularProgress size={24} /> : 'Create Domain'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
