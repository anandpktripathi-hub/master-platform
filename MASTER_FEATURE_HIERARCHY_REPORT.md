# MASTER FEATURE HIERARCHY REPORT

## Overview
This document tracks the implementation of a hierarchical system for modules, submodules, features, subfeatures, options, suboptions, points, and subpoints, as well as the management UIs and APIs for all major business areas (user management, domains, packages, coupons, etc.).

---

## Hierarchy System
- **Backend**: Mongoose schema, service, controller, and module for generic hierarchy nodes.
- **Frontend**: React module for managing and visualizing the hierarchy tree, with create and assign functionality.
- **API**: REST endpoints for CRUD and tree operations.

---

## User Management & Registration
- Registered Users Table: To be integrated with hierarchy for feature/option assignment.
- Add User Form: Extendable for role/feature assignment.

---

## Subdomain & Domain Management
- Subdomain Table, Sidebar, Custom Domain Requests: Can be mapped as modules/features in the hierarchy.

---

## Package & Subscription Management
- Packages, Features, and Pricing: Features can be managed as nodes in the hierarchy.

---

## Coupon Management
- Coupons Table: Can be a feature/option in the hierarchy.

---

## Website Creation & Assignment
- Quick Website Modal, Assign Subscription: Can be mapped to options/suboptions.

---

## Issue & Error Handling
- Issue Table, Details Modal: Can be managed as features/options.

---

## Website List & Actions
- Website Table: Can be mapped as a feature/option.

---

## User Dashboard
- Dashboard Widgets: Can be mapped as features/options.

---

## Role & Permission Management
- Role/Permission Matrix: To be integrated with hierarchy for fine-grained assignment.

---

## Security & Access
- 2FA, Login Enable/Disable, Role-Based Access: All can be managed as features/options in the hierarchy.

---

## Miscellaneous
- Meta Information, Feature Visibility: Can be managed as options/suboptions.

---

## Next Steps
- Integrate hierarchy system with all business modules.
- Extend UI for assignment and visualization in each business area.
- Ensure all build/dev/test passes at root, backend, and frontend.

---

## Change Log
- [2026-01-06] Initial hierarchy system, backend and frontend scaffolding, and report created.

---

## TODO
- UI polish, validation, and integration with business logic.
- API security and permission checks.
- Documentation updates as features are added.
