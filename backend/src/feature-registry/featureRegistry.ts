// Central registry for all modules, submodules, features, subfeatures, options, suboptions, points, and subpoints
// This can be extended or migrated to a database later for full dynamic capability

export interface FeatureNode {
  id: string;
  name: string;
  type: 'module' | 'submodule' | 'feature' | 'subfeature' | 'option' | 'suboption' | 'point' | 'subpoint';
  enabled: boolean;
  children?: FeatureNode[];
  description?: string;
  allowedRoles?: string[];
  allowedTenants?: string[];
}

export const featureRegistry: FeatureNode[] = [
  // PLATFORM / SUPER ADMIN LAYER
  {
    id: 'platform-admin',
    name: 'Platform Administration',
    type: 'module',
    enabled: true,
    allowedRoles: ['PLATFORM_SUPERADMIN'],
    children: [
      {
        id: 'saas-overview-dashboard',
        name: 'SaaS Overview Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Global metrics across all tenants: MRR, churn, tenants, domains, invoices, visitors.',
      },
      {
        id: 'system-health',
        name: 'System Health & Metrics',
        type: 'feature',
        enabled: true,
        description:
          'Node health, queue health, background jobs, SMTP, webhooks and third-party integrations.',
      },
      {
        id: 'tenant-quota-usage',
        name: 'Tenant Quota Usage',
        type: 'feature',
        enabled: true,
        description:
          'Per-tenant limits and current usage for resources such as users, projects, storage and API calls.',
      },
      {
        id: 'audit-logs',
        name: 'Audit Logs Explorer',
        type: 'feature',
        enabled: true,
        description:
          'Central audit log search, export and filters across tenants.',
      },
      {
        id: 'package-features',
        name: 'Package / Plan Features',
        type: 'feature',
        enabled: true,
        description:
          'Matrix of which SaaS features are available on each plan (FREE / PRO / ENTERPRISE).',
      },
      {
        id: 'custom-domains-admin',
        name: 'Custom Domains (Admin)',
        type: 'feature',
        enabled: true,
        description:
          'Global view of domain requests and SSL lifecycle across all tenants.',
      },
    ],
  },

  // TENANT / COMPANY OWNER LAYER
  {
    id: 'tenant-core',
    name: 'Tenant Core Dashboard',
    type: 'module',
    enabled: true,
    allowedRoles: ['TENANT_ADMIN'],
    children: [
      {
        id: 'tenant-overview-dashboard',
        name: 'Tenant Overview Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Per-tenant KPIs: revenue, active users, projects, CRM pipeline, POS sales, CMS traffic.',
      },
      {
        id: 'tenant-billing-dashboard',
        name: 'Billing & Subscription Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Current plan, invoices, payment methods, dunning status and upcoming renewals.',
      },
      {
        id: 'tenant-domains',
        name: 'Tenant Domains & URLs',
        type: 'feature',
        enabled: true,
        description:
          'Subdomains, custom domains, DNS/SSL status and public site URLs.',
      },
    ],
  },

  // BILLING & MONETIZATION MODULES
  {
    id: 'billing',
    name: 'Billing & Monetization',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'billing-dashboard',
        name: 'Billing Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Subscription status, invoices, payment attempts and dunning events per tenant.',
      },
      {
        id: 'revenue-dashboard',
        name: 'Revenue Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'MRR, ARR, LTV, ARPU, churn and cohort metrics powered by invoices and payments.',
      },
      {
        id: 'affiliate-dashboard',
        name: 'Affiliate Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Affiliate referrals, clicks, attributed revenue and payout history.',
      },
      {
        id: 'billing-invoices-explorer',
        name: 'Invoices Explorer',
        type: 'feature',
        enabled: true,
        description:
          'Filterable invoice history with per‑customer and per‑tenant breakdown.',
      },
      {
        id: 'billing-gateway-performance',
        name: 'Gateway Performance Analytics',
        type: 'feature',
        enabled: true,
        description:
          'Failure rates, latency and success ratios per payment gateway and per module.',
      },
    ],
  },

  // ERP MODULE DASHBOARDS (ACCOUNTING, CRM, HRM, POS, PROJECTS)
  {
    id: 'accounting',
    name: 'Accounting',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'accounting-dashboard',
        name: 'Accounting Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Cashflow, income vs expense, receivables, payables and top accounts.',
      },
      {
        id: 'accounting-aging-report',
        name: 'Aging Receivables & Payables',
        type: 'feature',
        enabled: true,
        description:
          'Classic 30/60/90+ aging breakdown for customers and vendors.',
      },
      {
        id: 'accounting-profit-and-loss',
        name: 'Profit & Loss Statement',
        type: 'feature',
        enabled: true,
        description:
          'Multi‑period P&L with drill‑down to accounts and dimensions.',
      },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'crm-dashboard',
        name: 'CRM Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Leads, deals pipeline, win rate, activities and owner performance.',
      },
      {
        id: 'crm-sales-funnel',
        name: 'Sales Funnel & Stages',
        type: 'feature',
        enabled: true,
        description:
          'Stage‑wise conversion, drop‑off points and forecasted revenue.',
      },
      {
        id: 'crm-activity-productivity',
        name: 'Activity & Productivity KPIs',
        type: 'feature',
        enabled: true,
        description:
          'Emails, calls, meetings and tasks per owner and per team.',
      },
    ],
  },
  {
    id: 'hrm',
    name: 'HRM',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'hrm-dashboard',
        name: 'HRM Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Headcount, attendance, leave, timesheets and salary cost overview.',
      },
      {
        id: 'hrm-attrition-and-retention',
        name: 'Attrition & Retention KPIs',
        type: 'feature',
        enabled: true,
        description:
          'Joiners, leavers, retention and tenure distribution across departments.',
      },
      {
        id: 'hrm-payroll-analytics',
        name: 'Payroll Analytics',
        type: 'feature',
        enabled: true,
        description:
          'Salary cost by department, role and location with trend lines.',
      },
    ],
  },
  {
    id: 'pos',
    name: 'POS',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'pos-dashboard',
        name: 'POS Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Store sales, top products, average order value and payment mix.',
      },
      {
        id: 'pos-store-comparison',
        name: 'Store Comparison & Heatmap',
        type: 'feature',
        enabled: true,
        description:
          'Compare stores or locations by sales, margins and basket size.',
      },
      {
        id: 'pos-customer-ltv',
        name: 'Customer LTV & Cohorts',
        type: 'feature',
        enabled: true,
        description:
          'Repeat purchase rates, cohorts and lifetime value for POS customers.',
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'projects-dashboard',
        name: 'Projects Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Active projects, tasks, deadlines and utilization metrics.',
      },
      {
        id: 'projects-utilization',
        name: 'Utilization & Capacity',
        type: 'feature',
        enabled: true,
        description:
          'Billable vs non‑billable utilization and workload per team member.',
      },
      {
        id: 'projects-profitability',
        name: 'Project Profitability',
        type: 'feature',
        enabled: true,
        description:
          'Revenue, costs and margin per project and client.',
      },
    ],
  },

  // CMS, SEO & ANALYTICS
  {
    id: 'cms',
    name: 'CMS & Sites',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'cms-analytics',
        name: 'CMS Analytics',
        type: 'feature',
        enabled: true,
        description:
          'Page views, unique visitors, conversions and top pages per tenant.',
      },
      {
        id: 'cms-seo-audit',
        name: 'SEO Audit',
        type: 'feature',
        enabled: true,
        description:
          'Automated SEO audits with recommendations per page.',
      },
    ],
  },
  {
    id: 'seo',
    name: 'SEO & Discovery',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'sitemaps',
        name: 'Sitemaps & Robots',
        type: 'feature',
        enabled: true,
        description: 'Tenant-specific sitemaps and robots.txt management.',
      },
    ],
  },

  // COMMUNICATION & COLLABORATION
  {
    id: 'notifications',
    name: 'Notifications & Webhooks',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'notification-center',
        name: 'Notification Center',
        type: 'feature',
        enabled: true,
        description: 'Unified tenant notification inbox and bell.',
      },
      {
        id: 'webhooks',
        name: 'Webhooks',
        type: 'feature',
        enabled: true,
        description: 'Per-event outbound webhooks configuration.',
      },
      {
        id: 'notification-rules-engine',
        name: 'Notification Rules Engine',
        type: 'feature',
        enabled: true,
        description:
          'Matrix of channels (email/SMS/chat/push) versus events and recipients.',
      },
    ],
  },
  {
    id: 'chat',
    name: 'Team Chat',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'chat-rooms',
        name: 'Chat Rooms',
        type: 'feature',
        enabled: true,
        description:
          'Tenant-scoped rooms, private rooms, membership and archived rooms.',
      },
      {
        id: 'chat-mentions-and-notifications',
        name: 'Mentions & Smart Notifications',
        type: 'feature',
        enabled: true,
        description:
          'Per-user mention feeds, unread counts and cross‑channel alerts.',
      },
    ],
  },

  // TENANT DOMAINS
  {
    id: 'domains',
    name: 'Domains & SSL',
    type: 'module',
    enabled: true,
    children: [
      {
        id: 'tenant-domains-dashboard',
        name: 'Domains Dashboard',
        type: 'feature',
        enabled: true,
        description:
          'Domain requests, DNS verification, SSL status and site reachability per tenant.',
      },
      {
        id: 'tenant-urls-and-brands',
        name: 'URLs & Brand Profiles',
        type: 'feature',
        enabled: true,
        description:
          'Mapping between brands, workspaces, subdomains and custom domains.',
      },
    ],
  },

  // END‑CUSTOMER / PUBLIC LAYER
  {
    id: 'customer-portal',
    name: 'Customer Portal Experience',
    type: 'module',
    enabled: true,
    allowedRoles: ['CUSTOMER'],
    children: [
      {
        id: 'customer-billing-portal',
        name: 'Billing & Subscription Portal',
        type: 'feature',
        enabled: true,
        description:
          'Self‑service invoices, payment methods, subscription upgrades and cancellations.',
      },
      {
        id: 'customer-support-center',
        name: 'Support Center',
        type: 'feature',
        enabled: true,
        description:
          'Tickets, FAQs and chat accessible to end customers per tenant.',
      },
      {
        id: 'customer-orders-history',
        name: 'Orders & Activity History',
        type: 'feature',
        enabled: true,
        description:
          'Order, project and engagement history surfaced to each end customer.',
      },
    ],
  },
];
