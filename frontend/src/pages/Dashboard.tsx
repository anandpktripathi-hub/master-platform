import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import api from "../lib/api";

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  error?: string;
  loading: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<{
    products: StatCard;
    customers: StatCard;
    orders: StatCard;
    teamMembers: StatCard;
  }>({
    products: {
      title: "Products",
      value: 0,
      icon: <InventoryIcon />,
      color: "#3f51b5",
      loading: true,
    },
    customers: {
      title: "Customers",
      value: 0,
      icon: <PeopleIcon />,
      color: "#f50057",
      loading: true,
    },
    orders: {
      title: "Orders",
      value: 0,
      icon: <ShoppingCartIcon />,
      color: "#4caf50",
      loading: true,
    },
    teamMembers: {
      title: "Team Members",
      value: 0,
      icon: <GroupIcon />,
      color: "#ff9800",
      loading: true,
    },
  });

  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    console.group("🔄 Dashboard Stats Loading");
    console.log("Starting to load dashboard stats...");

    // Use Promise.allSettled to load all stats in parallel
    // This ensures partial failures don't block successful responses
    const [productsResult, customersResult, ordersResult, teamResult] =
      await Promise.allSettled([
        api.get("/products/stats/dashboard"),
        api.get("/customers/stats/dashboard"),
        api.get("/orders/stats/dashboard"),
        api.get("/team-members/stats/dashboard"),
      ]);

    console.log("📦 Products stats response:", productsResult);
    console.log("👥 Customers stats response:", customersResult);
    console.log("🛒 Orders stats response:", ordersResult);
    console.log("👔 Team members stats response:", teamResult);

    // Process products stats
    const newStats = { ...stats };
    
    if (productsResult.status === "fulfilled") {
      const data = productsResult.value;
      newStats.products = {
        ...newStats.products,
        value: data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      console.error("❌ Products stats failed:", productsResult.reason);
      newStats.products = {
        ...newStats.products,
        error: "Failed to load products stats",
        loading: false,
      };
    }

    // Process customers stats
    if (customersResult.status === "fulfilled") {
      const data = customersResult.value;
      newStats.customers = {
        ...newStats.customers,
        value: data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      console.error("❌ Customers stats failed:", customersResult.reason);
      newStats.customers = {
        ...newStats.customers,
        error: "Failed to load customers stats",
        loading: false,
      };
    }

    // Process orders stats
    if (ordersResult.status === "fulfilled") {
      const data = ordersResult.value;
      newStats.orders = {
        ...newStats.orders,
        value: data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      console.error("❌ Orders stats failed:", ordersResult.reason);
      newStats.orders = {
        ...newStats.orders,
        error: "Failed to load orders stats",
        loading: false,
      };
    }

    // Process team members stats
    if (teamResult.status === "fulfilled") {
      const data = teamResult.value;
      newStats.teamMembers = {
        ...newStats.teamMembers,
        value: data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      console.error("❌ Team members stats failed:", teamResult.reason);
      newStats.teamMembers = {
        ...newStats.teamMembers,
        error: "Failed to load team members stats",
        loading: false,
      };
    }

    setStats(newStats);

    // Show global error only if ALL stats failed
    const allFailed =
      productsResult.status === "rejected" &&
      customersResult.status === "rejected" &&
      ordersResult.status === "rejected" &&
      teamResult.status === "rejected";

    if (allFailed) {
      setGlobalError("Failed to load all dashboard stats. Please try again.");
    }

    console.log("✅ Dashboard stats loading completed");
    console.groupEnd();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Overview of your key metrics
        </Typography>
      </Box>

      {/* Global error banner - only shown if ALL stats failed */}
      {globalError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setGlobalError(null)}>
          {globalError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.entries(stats).map(([key, stat]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card
              sx={{
                height: "100%",
                position: "relative",
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>

                {stat.loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : stat.error ? (
                  <Box>
                    <Typography variant="body2" color="error" sx={{ fontSize: "0.875rem" }}>
                      {stat.error}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

