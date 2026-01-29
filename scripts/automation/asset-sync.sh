#!/bin/bash
# Sync tenant branding assets to S3/Cloudinary
# Usage: ./asset-sync.sh <tenant_id> <local_asset_dir>

TENANT_ID=$1
ASSET_DIR=$2

# S3 Example
if [ -n "$S3_BUCKET" ]; then
  aws s3 sync "$ASSET_DIR" "s3://$S3_BUCKET/branding/$TENANT_ID/" --delete
fi

# Cloudinary Example
if [ -n "$CLOUDINARY_URL" ]; then
  # Requires cloudinary CLI or API
  echo "Sync to Cloudinary not implemented in this script. Use API/SDK."
fi

echo "Asset sync complete for tenant $TENANT_ID."
