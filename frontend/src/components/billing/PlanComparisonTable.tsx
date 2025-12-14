import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

type PlanId = "basic" | "pro" | "enterprise";

interface FeatureRow {
  feature: string;
  plans: Record<PlanId, boolean>;
}

const planLabels: Record<PlanId, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

const rows: FeatureRow[] = [
  {
    feature: "Number of tenants",
    plans: { basic: true, pro: true, enterprise: true },
  },
  {
    feature: "Advanced RBAC",
    plans: { basic: false, pro: true, enterprise: true },
  },
  {
    feature: "Custom Themes",
    plans: { basic: false, pro: true, enterprise: true },
  },
  {
    feature: "Priority Support",
    plans: { basic: false, pro: false, enterprise: true },
  },
];

const PlanComparisonTable: React.FC = () => {
  const planOrder: PlanId[] = ["basic", "pro", "enterprise"];

  return (
    <Box component={Paper} sx={{ mt: 4, overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle1" fontWeight="bold">
                Features
              </Typography>
            </TableCell>
            {planOrder.map((plan) => (
              <TableCell key={plan} align="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  {planLabels[plan]}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.feature}>
              <TableCell>
                <Typography variant="body2">{row.feature}</Typography>
              </TableCell>
              {planOrder.map((plan) => (
                <TableCell key={plan} align="center">
                  {row.plans[plan] ? <CheckIcon fontSize="small" /> : "�"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default PlanComparisonTable;
export { PlanComparisonTable };
