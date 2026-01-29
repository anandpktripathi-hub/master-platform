import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

interface TenantPackageResponse {
  packageId?: {
    name?: string;
    description?: string;
    price?: number;
    billingCycle?: string;
    trialDays?: number;
  };
  status?: string;
}

interface UsageResponse {
  packageName: string;
  status: string;
  trialEndsAt?: string;
  expiresAt?: string;
  utilization?: Record<string, number>;
}

const checklistItems = [
  {
    id: "complete-profile",
    label: "Complete your personal profile",
    description: "Add your details and avatar to help your team recognize you.",
    link: "/app/profile",
  },
  {
    id: "company-settings",
    label: "Set up your company profile",
    description: "Confirm company name, address, and branding basics.",
    link: "/app/company",
  },
  {
    id: "crm-first-contact",
    label: "Create your first CRM contact",
    description: "Add at least one contact to start tracking relationships.",
    link: "/app/crm/contacts",
  },
  {
    id: "invite-team",
    label: "Invite a team member",
    description: "Add one colleague so you can collaborate.",
    link: "/app/manage-users",
  },
  {
    id: "visit-feed",
    label: "Visit your social activity feed",
    description: "See how updates and posts will appear for your team.",
    link: "/app/social/feed",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [tenantPackage, setTenantPackage] = useState<TenantPackageResponse | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pkgRes, usageRes] = await Promise.allSettled([
          api.get("/packages/me"),
          api.get("/packages/me/usage"),
        ]);

        if (pkgRes.status === "fulfilled") {
          setTenantPackage(pkgRes.value as TenantPackageResponse);
        }

        if (usageRes.status === "fulfilled") {
          setUsage(usageRes.value as UsageResponse);
        }

        if (pkgRes.status === "rejected" && usageRes.status === "rejected") {
          setError("We could not load your current plan details. You can still continue using the app.");
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || "Failed to load onboarding info");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const planName =
    usage?.packageName || tenantPackage?.packageId?.name || "FREE";
  const planStatus = usage?.status || tenantPackage?.status || "trialing";

  const utilization = usage?.utilization || {};
  const nearLimitEntries = Object.entries(utilization).filter(([, value]) =>
    typeof value === "number" && value >= 80 && value < 100
  );

  const formatLimitKey = (key: string) => {
    // Strip common prefixes like max, then humanize camelCase
    let formatted = key.replace(/^max/, "");
    formatted = formatted.replace(/([A-Z])/g, " $1").trim();
    return formatted || key;
  };

  const nearLimitLabels = nearLimitEntries.map(([key]) => formatLimitKey(key));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome to your workspace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here are your current plan details and a quick checklist to get value in the next few minutes.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your current plan
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mr: 1 }}>
                    {planName}
                  </Typography>
                  <Chip
                    size="small"
                    color={planStatus === "trial" || planStatus === "trialing" ? "primary" : "default"}
                    label={planStatus}
                    sx={{ textTransform: "capitalize" }}
                  />
                </Box>
                {tenantPackage?.packageId?.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tenantPackage.packageId.description}
                  </Typography>
                )}
                {tenantPackage?.packageId?.price != null && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ${tenantPackage.packageId.price} / {tenantPackage.packageId.billingCycle || "monthly"}
                  </Typography>
                )}
                {usage?.trialEndsAt && (
                  <Typography variant="body2" color="text.secondary">
                    Trial ends on {new Date(usage.trialEndsAt).toLocaleDateString()}
                  </Typography>
                )}

                {/* Billing / subscription section */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Billing & subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Manage upgrades, downgrades, billing details, and renewal settings from the subscriptions page.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/app/packages")}
                  >
                    Manage billing & subscription
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Getting started checklist
                </Typography>
                {nearLimitLabels.length > 0 && (
                  <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
                    You are approaching the limits of your current plan for {nearLimitLabels.join(", ")}. Consider
                    upgrading your subscription before you hit a hard limit.
                  </Alert>
                )}
                {seedMessage && (
                  <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setSeedMessage(null)}
                  >
                    {seedMessage}
                  </Alert>
                )}
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={seeding}
                    onClick={async () => {
                      setError(null);
                      setSeedMessage(null);
                      setSeeding(true);
                      try {
                        const res = await api.post("/onboarding/seed-sample", {} as never);
                        const data = res as unknown as { created?: boolean; reason?: string };
                        if (data && data.created === false && data.reason === "already_seeded") {
                          setSeedMessage("Sample data was already created for this workspace.");
                        } else {
                          setSeedMessage("Sample CRM records, a feed post, and a support ticket were created.");
                        }
                      } catch (err: unknown) {
                        const e = err as { message?: string };
                        setError(e.message || "Failed to seed sample data");
                      } finally {
                        setSeeding(false);
                      }
                    }}
                  >
                    {seeding ? "Seeding sample data..." : "Seed sample data"}
                  </Button>
                </Box>
                <List>
                  {checklistItems.map((item) => (
                    <ListItem
                      key={item.id}
                      divider
                      secondaryAction={
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => navigate(item.link)}
                        >
                          Go
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
