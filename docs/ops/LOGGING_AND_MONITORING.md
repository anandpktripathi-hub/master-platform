# Logging & Monitoring

This project uses NestJS's built-in logger plus a simple in-memory `PaymentLogService` for payment events. This document describes what is logged today and how to ship those logs to a centralized platform.

## Backend structured logging

### Quota breaches

The `QuotaService` logs a structured warning whenever a tenant exceeds a quota:

- Service: `QuotaService`
- Level: `warn`
- Message: `"Quota breach detected"`
- Metadata fields:
  - `tenantId`: string
  - `eventType`: always `"quota_breach"`
  - `quotaType`: one of `"users" | "storage" | "api_calls"`
  - `current`: current usage value
  - `limit`: configured limit

You can filter on `context = "QuotaService"` and `eventType = quota_breach` in your logging backend to see all quota issues per tenant.

### Payment failures

When assigning a package to a tenant with payment required, the `PackageService.assignPackageToTenant` method will:

- Call the `PaymentGatewayService` to process the payment.
- On failure:
  - Emit an error-level log with:
    - `tenantId`
    - `packageId`
    - `eventType = "payment_failure"`
    - `error` (gateway/local error message)
  - Record a failed `PaymentLog` entry via `PaymentLogService.record` with:
    - `transactionId` (or `"unknown"` if not supplied)
    - `tenantId`
    - `packageId`
    - `amount`, `currency`
    - `status = "failed"`
    - `error`
    - `createdAt`
- On success:
  - Record a `PaymentLog` entry with `status = "success"` and the gateway `transactionId`.

This gives you a reliable audit trail for all attempted payments and an easy way to see which tenants are hitting payment problems.

## Shipping logs to a central platform

NestJS writes logs to STDOUT/STDERR by default. In containerized environments, you typically ship those logs to a log platform by collecting container stdout.

Recommended options:

1. **Cloud-native logging (preferred)**
   - **AWS**: Use CloudWatch log groups with an ECS/EKS log driver configured for the service.
   - **GCP**: Use Cloud Logging (formerly Stackdriver) via GKE or Cloud Run integration.
   - **Azure**: Use Azure Monitor / Log Analytics with the Container insights agent.

2. **Third-party log platforms**
   - Run the app in Docker and use one of:
     - Datadog Agent
     - Logtail / Better Stack
     - New Relic Logs
     - Elastic Stack (Filebeat/Fluent Bit + Elasticsearch + Kibana)
   - Configure the agent/shipper to collect container stdout from the backend service and forward it to your provider.

3. **Self-hosted ELK/EFK**
   - Deploy Fluent Bit or Filebeat as a sidecar/daemonset.
   - Route logs from the backend container to Elasticsearch or OpenSearch.
   - Build dashboards in Kibana/OpenSearch Dashboards for quota and payment events.

## Suggested log queries & dashboards

Once logs are shipped, create saved queries and visualizations such as:

- **Quota breaches per tenant (last 24h)**
  - Filter: `context = "QuotaService" AND eventType = "quota_breach"`
  - Group by: `tenantId`, `quotaType`

- **Payment failures by package**
  - Filter: `context = "PackageService" AND eventType = "payment_failure"`
  - Group by: `packageId`

- **Payment success vs failure rate**
  - Source: `PaymentLog` entries (either exposed via an API later or mirrored to your main log sink).
  - Metric: `count(status = success)` vs `count(status = failed)` over time.

## Next steps

- Wire your chosen log shipper into the backend container/task definition.
- Add environment-specific log levels (e.g. `LOG_LEVEL=debug` in staging, `LOG_LEVEL=info` in production).
- Optionally extend `PaymentLogService` to persist logs to a real database (MongoDB or SQL) if you want in-app payment reporting in addition to centralized logging.
