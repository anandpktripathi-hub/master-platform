# Plan Changes & Downgrades

This document describes how plan changes, upgrades, and downgrades are intended to work in this platform, and what customers can expect when they manage their subscription.

> Note: This is a reference implementation. You should align this behaviour with your live billing provider configuration and any commercial terms you publish to customers.

## Upgrades

- **When upgrades take effect**
  - In the current implementation, changing to a higher-priced plan via the in-app **Plans & Subscription** page takes effect as soon as the new plan is assigned.
  - Usage limits and feature flags are updated immediately according to the new plan’s limits and feature set.
- **Billing behaviour**
  - The backend currently treats each assignment of a paid package as a new charge for the full billing period.
  - Proration, credits, or mid-cycle adjustments are *not* handled automatically in this codebase; if you need them, implement them in your payment gateway configuration and package-assignment logic.

## Downgrades

- **When downgrades take effect**
  - The reference implementation applies plan changes immediately, regardless of whether the new plan is higher or lower.
  - If you want downgrades to only take effect at the end of the current billing period, you should:
    - Adjust your billing provider (e.g. Stripe, Paddle) to schedule the downgrade at period end, and
    - Update the package-assignment flow to reflect the provider’s effective date.
- **What customers should expect**
  - You should clearly state in your own Terms / Pricing page whether downgrades are:
    - Immediate with no credit, or
    - Applied at the end of the billing period with or without a credit.
  - The in-app copy already reflects neutral language such as “change or cancel your plan” and “manage upgrades, downgrades, billing details, and renewal settings” without promising proration.

## Cancellations & renewal

- **Auto-renewal**
  - For recurring plans, the backend sets an `expiresAt` date based on the billing cycle (monthly or annual).
  - The UI uses phrases like “Current billing period renews on …” to indicate when the next charge will occur under normal circumstances.
- **Cancellation expectations**
  - Out of the box, the codebase does not include a full self-serve cancellation flow wired to a live gateway; instead it provides:
    - Clear plan, trial, and renewal messaging in the UI.
    - Hooks and services where cancellation logic can be added (e.g. in the billing service and package-assignment service).
  - You should decide whether cancellation:
    - Stops renewal but keeps access until period end, or
    - Immediately revokes access, and then reflect that choice in both your billing provider settings and the UI copy.

## Recommended production checklist

Before going live with real customers, you should:

1. **Define commercial rules**
   - Decide how upgrades, downgrades, and cancellations behave (immediate vs end-of-period, proration rules, refunds).
2. **Configure your billing provider**
   - Make sure your Stripe/Paddle/etc. settings match your rules for upgrades/downgrades and cancellation.
3. **Align backend logic**
   - Update the package assignment and billing integration code so that the effective dates and charges match your billing provider’s behaviour.
4. **Review in-app copy**
   - Verify that all mentions of “trial”, “renewal”, “change plan”, and “cancel” match your real-world policies.
5. **Test end-to-end**
   - Run through full flows in a staging environment:
     - New signup on a trial.
     - Upgrade during trial and during an active paid period.
     - Downgrade request and its effective date.
     - Cancellation and access/renewal behaviour.

By following this guide and the existing in-app messaging, you can ship a subscription experience where customers clearly understand what happens when they upgrade, downgrade, or cancel their plan.