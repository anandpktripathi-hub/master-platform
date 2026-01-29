import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Grid, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import api from '../lib/api';

const steps = ['Personal Info', 'Company Info', 'Compliance', 'Plan & Pricing', 'Review'];

interface PackageSummary {
  _id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  trialDays?: number;
  featureSet?: Record<string, boolean>;
  limits?: Record<string, number>;
}

interface PersonalInfo {
  firstName: string;
  secondName: string;
  lastName: string;
  dateOfBirth: string;
  username: string;
  email: string;
  phone: string;
  homeAddress: string;
}

interface CompanyInfo {
  companyName: string;
  companyDateOfBirth: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  positionInCompany: string;
  companyEmailForUser: string;
  companyPhoneForUser: string;
  companyIdNumberForUser: string;
}

interface Compliance {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export default function SignupWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<PackageSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [personal, setPersonal] = useState<PersonalInfo>({
    firstName: '',
    secondName: '',
    lastName: '',
    dateOfBirth: '',
    username: '',
    email: '',
    phone: '',
    homeAddress: '',
  });

  const [company, setCompany] = useState<CompanyInfo>({
    companyName: '',
    companyDateOfBirth: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    positionInCompany: '',
    companyEmailForUser: '',
    companyPhoneForUser: '',
    companyIdNumberForUser: '',
  });

  const [compliance, setCompliance] = useState<Compliance>({
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const [subdomain, setSubdomain] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const PLAN_STEP_INDEX = 3;

  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const res = await api.get('/packages?limit=20');
        const data = Array.isArray(res?.data) ? res.data : res?.data ?? [];
        setPlans(data);

        const freePlan = data.find((pkg: PackageSummary) => pkg.name?.toUpperCase() === 'FREE');
        if (freePlan) {
          setSelectedPlanId(freePlan.name);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const msg =
          error.response?.data?.message ||
          error.message ||
          'Failed to load plans. You can continue with the default Free plan.';
        setPlansError(msg);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      try {
        localStorage.setItem('referralCode', refParam);
      } catch {
        // Ignore storage errors (e.g., disabled cookies)
      }
    } else {
      try {
        const stored = localStorage.getItem('referralCode');
        if (stored) {
          setReferralCode(stored);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [searchParams]);

  const handleNext = () => {
    setError(null);

    if (activeStep === PLAN_STEP_INDEX && !selectedPlanId) {
      setError('Please select a plan to continue');
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!compliance.acceptedTerms || !compliance.acceptedPrivacy) {
      setError('You must accept Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      // API now returns unwrapped response.data directly
      const response = await api.post('/auth/tenant-register', {
        personal,
        company,
        compliance,
        subdomain,
        password,
        planId: selectedPlanId || 'FREE',
        referralCode: referralCode || undefined,
      });

      // Store the access token
      const { accessToken } = response;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }

      alert('Registration successful! Redirecting to dashboard...');
      navigate('/app/onboarding');
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={personal.firstName}
                onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name (Optional)"
                value={personal.secondName}
                onChange={(e) => setPersonal({ ...personal, secondName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={personal.lastName}
                onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={personal.dateOfBirth}
                onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                required
                value={personal.username}
                onChange={(e) => setPersonal({ ...personal, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                required
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Home Address"
                required
                multiline
                rows={2}
                value={personal.homeAddress}
                onChange={(e) => setPersonal({ ...personal, homeAddress: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                required
                value={company.companyName}
                onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Established Date (Optional)"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={company.companyDateOfBirth}
                onChange={(e) => setCompany({ ...company, companyDateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                required
                value={company.companyEmail}
                onChange={(e) => setCompany({ ...company, companyEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Phone"
                required
                value={company.companyPhone}
                onChange={(e) => setCompany({ ...company, companyPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Address"
                required
                multiline
                rows={2}
                value={company.companyAddress}
                onChange={(e) => setCompany({ ...company, companyAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Position in Company"
                required
                value={company.positionInCompany}
                onChange={(e) => setCompany({ ...company, positionInCompany: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Email (Optional)"
                type="email"
                value={company.companyEmailForUser}
                onChange={(e) => setCompany({ ...company, companyEmailForUser: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Phone (Optional)"
                value={company.companyPhoneForUser}
                onChange={(e) => setCompany({ ...company, companyPhoneForUser: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID (Optional)"
                value={company.companyIdNumberForUser}
                onChange={(e) => setCompany({ ...company, companyIdNumberForUser: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Terms and Conditions
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={compliance.acceptedTerms}
                  onChange={(e) => setCompliance({ ...compliance, acceptedTerms: e.target.checked })}
                  required
                />
              }
              label="I accept the Terms of Service"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={compliance.acceptedPrivacy}
                  onChange={(e) => setCompliance({ ...compliance, acceptedPrivacy: e.target.checked })}
                  required
                />
              }
              label="I accept the Privacy Policy"
            />
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                By accepting these terms, you agree to our data processing practices and service policies.
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Your Plan
            </Typography>
            {plansLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {plans.map((plan) => (
                  <Grid item xs={12} sm={6} key={plan._id}>
                    <Card
                      sx={{
                        border: selectedPlanId === plan.name ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedPlanId(plan.name)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">{plan.name}</Typography>
                          {plan.trialDays && plan.trialDays > 0 && (
                            <Chip size="small" color="primary" label={`${plan.trialDays}-day trial`} />
                          )}
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          ${plan.price}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            / {plan.billingCycle}
                          </Typography>
                        </Typography>
                        {plan.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {plan.description}
                          </Typography>
                        )}
                        {plan.featureSet && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(plan.featureSet)
                              .filter(([, enabled]) => enabled)
                              .slice(0, 4)
                              .map(([featureKey]) => (
                                <Chip
                                  key={featureKey}
                                  label={featureKey}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {plans.length === 0 && !plansLoading && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No plans are configured yet. You will be registered on the default Free plan.
                    </Alert>
                  </Grid>
                )}
                {plansError && (
                  <Grid item xs={12}>
                    <Alert severity="warning">{plansError}</Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Complete Registration
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subdomain"
                  required
                  helperText="Your site will be: subdomain.yourdomain.com"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Personal:</strong> {personal.firstName} {personal.lastName} ({personal.email})
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Company:</strong> {company.companyName}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Compliance:</strong> {compliance.acceptedTerms && compliance.acceptedPrivacy ? '✅ Accepted' : '❌ Not Accepted'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Plan:</strong> {selectedPlanId || 'FREE'}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Account
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 300 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
              Log In
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
