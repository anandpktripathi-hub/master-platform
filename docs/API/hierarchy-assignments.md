# Hierarchy Assignment API Documentation

## Domain Hierarchy Assignment
- `POST /domain-hierarchy/:domainId` — Assign hierarchy nodes to a domain
- `GET /domain-hierarchy/:domainId` — Get assigned hierarchy nodes for a domain
- `DELETE /domain-hierarchy/:domainId` — Remove all hierarchy assignments from a domain

## Package Hierarchy Assignment
- `POST /package-hierarchy/:packageId` — Assign hierarchy nodes to a package
- `GET /package-hierarchy/:packageId` — Get assigned hierarchy nodes for a package
- `DELETE /package-hierarchy/:packageId` — Remove all hierarchy assignments from a package

## Billing Hierarchy Assignment
- `POST /billing-hierarchy/:billingId` — Assign hierarchy nodes to a billing entity
- `GET /billing-hierarchy/:billingId` — Get assigned hierarchy nodes for a billing entity
- `DELETE /billing-hierarchy/:billingId` — Remove all hierarchy assignments from a billing entity

### Request Body
```json
{
  "nodeIds": ["hierarchyNodeId1", "hierarchyNodeId2", ...]
}
```

### Response
- Returns the updated assignment document with populated hierarchy nodes.

### Notes
- All endpoints require authentication.
- Hierarchy nodes must exist in the system.
- Assignments are upserted (created or updated).
