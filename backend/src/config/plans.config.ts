export type PlanKey = "FREE" | "PRO" | "ENTERPRISE"

export const PLANS: Record<PlanKey, { name: string; priceMonthly: number; maxUsers: number }> = {
  FREE: {
    name: "Free",
    priceMonthly: 0,
    maxUsers: 1,
  },
  PRO: {
    name: "Pro",
    priceMonthly: 29,
    maxUsers: 10,
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 99,
    maxUsers: 1000,
  },
}

export const DEFAULT_PLAN: PlanKey = "FREE"
















