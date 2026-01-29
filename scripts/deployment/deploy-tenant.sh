#!/bin/bash
# Deploy new tenant: SSL + NGINX config + reload
# Usage: ./deploy-tenant.sh tenant-domain.com tenantId

DOMAIN=$1
TENANT_ID=$2

if [ -z "$DOMAIN" ] || [ -z "$TENANT_ID" ]; then
  echo "Usage: $0 tenant-domain.com tenantId"
  exit 1
fi

# 1. Generate NGINX config
echo "[INFO] Generating NGINX config for $DOMAIN ..."
npx ts-node ./scripts/nginx-generator.ts $DOMAIN $TENANT_ID

# 2. Obtain SSL cert
echo "[INFO] Running SSL automation ..."
./scripts/ssl-automation.sh $DOMAIN

# 3. Reload NGINX
echo "[INFO] Reloading NGINX ..."
systemctl reload nginx

echo "[SUCCESS] Tenant $DOMAIN deployed with SSL and NGINX config."
