import React, { useEffect, useState } from "react";
import ErrorBoundary from '../components/ErrorBoundary';
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
  ResponsiveContainer,
  LineChart,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  AccountBalance as AccountBalanceIcon,
  Badge as BadgeIcon,
  WorkOutline as WorkOutlineIcon,
  PointOfSale as PointOfSaleIcon,
} from "@mui/icons-material";
import api, { type UserNotificationDto } from "../lib/api";

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  error?: string;
  loading: boolean;
}

export default function Dashboard() {
  const [tenantOverview, setTenantOverview] = useState<{
    stats?: {
      users: number;
      posTotalSales: number;
      posTotalOrders: number;
      cmsTotalViewsLast30Days: number;
      cmsUniqueVisitorsLast30Days: number;
    };
    cms?: {
      totalPages: number;
      totalViews: number;
      totalUniqueVisitors: number;
      topPages: any[];
    };
    pos?: {
      totalSales: number;
      totalOrders: number;
    };
    notifications?: UserNotificationDto[];
    features?: any[];
  } | null>(null);
  const [tenantOverviewLoading, setTenantOverviewLoading] = useState<boolean>(true);
  const [tenantOverviewError, setTenantOverviewError] = useState<string | null>(null);

  const [stats, setStats] = useState<{
    products: StatCard;
    customers: StatCard;
    orders: StatCard;
    teamMembers: StatCard;
    accounting: StatCard;
    hrm: StatCard;
    projects: StatCard;
    pos: StatCard;
    cashflow30: StatCard;
    attendanceGoal: StatCard;
    events: StatCard;
    tenantUsersVisitors: StatCard;
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
    accounting: {
      title: "Net Income",
      value: 0,
      icon: <AccountBalanceIcon />,
      color: "#0d9488",
      loading: true,
    },
    hrm: {
      title: "Active Employees",
      value: 0,
      icon: <BadgeIcon />,
      color: "#6366f1",
      loading: true,
    },
    projects: {
      title: "Active Projects",
      value: 0,
      icon: <WorkOutlineIcon />,
      color: "#f97316",
      loading: true,
    },
    pos: {
      title: "POS Sales",
      value: 0,
      icon: <PointOfSaleIcon />,
      color: "#22c55e",
      loading: true,
    },
    cashflow30: {
      title: "Cashflow (30d)",
      value: 0,
      icon: <AccountBalanceIcon />,
      color: "#14b8a6",
      loading: true,
    },
    attendanceGoal: {
      title: "Attendance Goal",
      value: "0%",
      icon: <BadgeIcon />,
      color: "#4f46e5",
      loading: true,
    },
    events: {
      title: "Upcoming Events",
      value: "-",
      icon: <WorkOutlineIcon />,
      color: "#f97316",
      loading: true,
    },
    tenantUsersVisitors: {
      title: "Users / Visitors",
      value: "-",
      icon: <PeopleIcon />,
      color: "#0ea5e9",
      loading: true,
    },
  });
  const [cashflowSeries, setCashflowSeries] = useState<
    { month: string; income: number; expense: number; net: number }[]
  >([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Use Promise.allSettled to load all stats in parallel, including aggregated tenant overview
    // This ensures partial failures don't block successful responses
    const [
      tenantOverviewResult,
      productsResult,
      customersResult,
      ordersResult,
      teamResult,
      accountingResult,
      hrmResult,
      projectsResult,
      posResult,
    ] = await Promise.allSettled([
      api.get("/api/tenant/dashboard"),
      api.get("/products/stats/dashboard"),
      api.get("/customers/stats/dashboard"),
      api.get("/orders/stats/dashboard"),
      api.get("/team-members/stats/dashboard"),
      api.get("/accounting/summary"),
      api.get("/hrm/summary"),
      api.get("/projects/summary"),
      api.get("/pos/summary"),
    ]);

    const newStats = { ...stats };
    let tenantDashboard: any | null = null;

    // Aggregated tenant overview (users, POS, CMS, notifications, features)
    if (tenantOverviewResult.status === "fulfilled") {
      const overview: any = tenantOverviewResult.value ?? null;
      tenantDashboard = overview;
      setTenantOverview(overview);
      setTenantOverviewLoading(false);
      setTenantOverviewError(null);

      const users = overview?.stats?.users ?? 0;
      const visitors = overview?.stats?.cmsUniqueVisitorsLast30Days ?? 0;
      newStats.tenantUsersVisitors = {
        ...newStats.tenantUsersVisitors,
        value: `${users} users / ${visitors} visitors`,
        loading: false,
      };
    } else {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("❌ Tenant overview failed:", tenantOverviewResult.reason);
      }
      setTenantOverview(null);
      setTenantOverviewLoading(false);
      setTenantOverviewError("Failed to load tenant overview");

      newStats.tenantUsersVisitors = {
        ...newStats.tenantUsersVisitors,
        error: "Failed to load tenant users/visitors",
        loading: false,
      };
    }
    
    if (productsResult.status === "fulfilled") {
      const data = productsResult.value;
      newStats.products = {
        ...newStats.products,
        value: data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      // Optionally log error in dev only
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Products stats failed:", productsResult.reason);
      }
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
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Customers stats failed:", customersResult.reason);
      }
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
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Orders stats failed:", ordersResult.reason);
      }
      newStats.orders = {
        ...newStats.orders,
        error: "Failed to load orders stats",
        loading: false,
      };
    }

    // Process team members stats
    if (teamResult.status === "fulfilled") {
      const response: any = teamResult.value;
      const data: any = response?.data ?? response;
      newStats.teamMembers = {
        ...newStats.teamMembers,
        value: data?.teamMembers ?? data?.totalUsers ?? data?.count ?? data?.total ?? 0,
        loading: false,
      };
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Team members stats failed:", teamResult.reason);
      }
      newStats.teamMembers = {
        ...newStats.teamMembers,
        error: "Failed to load team members stats",
        loading: false,
      };
    }

    // Accounting KPI: show net income (all time), 30d cashflow and 6-month cashflow series
    if (accountingResult.status === "fulfilled") {
      const response: any = accountingResult.value;
      const data: any = response?.data ?? response;
      const income = data?.income ?? 0;
      const expense = data?.expense ?? 0;
      const last30 = data?.last30Days ?? { income: 0, expense: 0, net: 0 };
      newStats.accounting = {
        ...newStats.accounting,
        value: income - expense,
        loading: false,
      };
      newStats.cashflow30 = {
        ...newStats.cashflow30,
        value: last30.net ?? 0,
        loading: false,
      };
      setCashflowSeries(data?.last6Months ?? []);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Accounting summary failed:", accountingResult.reason);
      }
      newStats.accounting = {
        ...newStats.accounting,
        error: "Failed to load accounting summary",
        loading: false,
      };
      newStats.cashflow30 = {
        ...newStats.cashflow30,
        error: "Failed to load accounting summary",
        loading: false,
      };
      setCashflowSeries([]);
    }

    // HRM KPIs: active employees and attendance goal (today)
    if (hrmResult.status === "fulfilled") {
      const response: any = hrmResult.value;
      const data: any = response?.data ?? response;
      newStats.hrm = {
        ...newStats.hrm,
        value: data?.activeEmployees ?? 0,
        loading: false,
      };

      const activeEmployees = data?.activeEmployees ?? 0;
      const todayPresent = data?.todayPresent ?? 0;
      const attendancePct = activeEmployees > 0 ? Math.round((todayPresent / activeEmployees) * 100) : 0;
      newStats.attendanceGoal = {
        ...newStats.attendanceGoal,
        value: `${attendancePct}%`,
        loading: false,
      };
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ HRM summary failed:", hrmResult.reason);
      }
      newStats.hrm = {
        ...newStats.hrm,
        error: "Failed to load HRM summary",
        loading: false,
      };
      newStats.attendanceGoal = {
        ...newStats.attendanceGoal,
        error: "Failed to load HRM summary",
        loading: false,
      };
    }

    // Projects KPIs: active projects and events summary (overdue tasks + upcoming trainings/open jobs from HRM)
    if (projectsResult.status === "fulfilled") {
      const response: any = projectsResult.value;
      const data: any = response?.data ?? response;
      newStats.projects = {
        ...newStats.projects,
        value: data?.activeProjects ?? 0,
        loading: false,
      };

      const overdueTasks = data?.overdueTasks ?? 0;
      // Use HRM summary (if available) to enrich events widget
      let openJobs = 0;
      let upcomingTrainings = 0;
      if (hrmResult.status === "fulfilled") {
        const hrmResponse: any = hrmResult.value;
        const hrmData: any = hrmResponse?.data ?? hrmResponse;
        openJobs = hrmData?.openJobs ?? 0;
        upcomingTrainings = hrmData?.upcomingTrainings ?? 0;
      }

      newStats.events = {
        ...newStats.events,
        value: `Overdue tasks: ${overdueTasks}, Open jobs: ${openJobs}, Trainings: ${upcomingTrainings}`,
        loading: false,
      };
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ Projects summary failed:", projectsResult.reason);
      }
      newStats.projects = {
        ...newStats.projects,
        error: "Failed to load projects summary",
        loading: false,
      };
      newStats.events = {
        ...newStats.events,
        error: "Failed to load events summary",
        loading: false,
      };
    }

    // POS KPI: total sales amount (prefer aggregated tenant dashboard if available)
    if (posResult.status === "fulfilled") {
      const response: any = posResult.value;
      const data: any = response?.data ?? response;
      newStats.pos = {
        ...newStats.pos,
        value:
          tenantDashboard?.stats?.posTotalSales ??
          tenantDashboard?.pos?.totalSales ??
          data?.totalSales ?? 0,
        loading: false,
      };
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("❌ POS summary failed:", posResult.reason);
      }
      newStats.pos = {
        ...newStats.pos,
        error: "Failed to load POS summary",
        loading: false,
      };
    }

    setStats(newStats);

    // Show global error only if ALL stats failed
    const allFailed =
      tenantOverviewResult.status === "rejected" &&
      productsResult.status === "rejected" &&
      customersResult.status === "rejected" &&
      ordersResult.status === "rejected" &&
      teamResult.status === "rejected" &&
      accountingResult.status === "rejected" &&
      hrmResult.status === "rejected" &&
      projectsResult.status === "rejected" &&
      posResult.status === "rejected";

    if (allFailed) {
      setGlobalError("Failed to load all dashboard stats. Please try again.");
    }

    // Removed dev logging for production cleanliness
  };

  return (
    <ErrorBoundary>
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

      {/* Tenant overview status */}
      {tenantOverviewLoading && !tenantOverviewError && (
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {tenantOverviewError && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setTenantOverviewError(null)}>
          {tenantOverviewError}
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
      
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cashflow (last 6 months)
            </Typography>
            {cashflowSeries.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Not enough accounting activity to display cashflow yet.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <ComposedChart
                    data={cashflowSeries}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.15}
                      name="Net cashflow"
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Expense"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* CMS, Notifications and Feature overview powered by aggregated tenant dashboard */}
      {tenantOverview && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    CMS Traffic (last 30 days)
                  </Typography>
                  {tenantOverview.cms ? (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Total pages: {tenantOverview.cms.totalPages}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total views: {tenantOverview.cms.totalViews}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Unique visitors: {tenantOverview.cms.totalUniqueVisitors}
                      </Typography>
                      {tenantOverview.cms.topPages && tenantOverview.cms.topPages.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            Top pages
                          </Typography>
                          {tenantOverview.cms.topPages.slice(0, 5).map((page: any) => (
                            <Typography
                              key={String(page.pageId)}
                              variant="body2"
                              color="textSecondary"
                            >
                              • {page.views} views, {page.visitors} visitors
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      CMS analytics are not available yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Notifications
                  </Typography>
                  {tenantOverview.notifications && tenantOverview.notifications.length > 0 ? (
                    tenantOverview.notifications.map((n: UserNotificationDto) => (
                      <Box key={n.id ?? n._id} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2">{n.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {n.message}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No recent notifications.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Enabled Features
                </Typography>
                {tenantOverview.features && tenantOverview.features.length > 0 ? (
                  tenantOverview.features.map((feature: any) => (
                    <Box key={feature.id} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">{feature.name}</Typography>
                      {feature.children && feature.children.length > 0 && (
                        <Typography variant="body2" color="textSecondary">
                          {feature.children.map((child: any) => child.name).join(", ")}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No feature information available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
      </Container>
    </ErrorBoundary>
  );
}

