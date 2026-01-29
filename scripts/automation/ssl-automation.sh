#!/bin/bash
# Wildcard SSL automation for *.yourdomain.com using certbot
# Usage: ./ssl-automation.sh tenant-domain.com

DOMAIN=$1
EMAIL=admin@yourdomain.com
WEBROOT=/var/www/html
CERT_PATH=/etc/letsencrypt/live/$DOMAIN

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 tenant-domain.com"
  exit 1
fi

echo "[INFO] Requesting wildcard SSL for *.$DOMAIN ..."
certbot certonly --manual --preferred-challenges dns --email $EMAIL --agree-tos --no-eff-email -d "$DOMAIN" -d "*.$DOMAIN" --manual-public-ip-logging-ok --manual-auth-hook ./scripts/certbot-dns-auth.sh --manual-cleanup-hook ./scripts/certbot-dns-cleanup.sh

if [ $? -eq 0 ]; then
  echo "[SUCCESS] Certificate issued for $DOMAIN"
else
  echo "[ERROR] Certificate request failed for $DOMAIN"
  exit 2
fi

# Symlink certs for NGINX
ln -sf $CERT_PATH/fullchain.pem /etc/nginx/certs/$DOMAIN.crt
ln -sf $CERT_PATH/privkey.pem /etc/nginx/certs/$DOMAIN.key

echo "[INFO] Reloading NGINX ..."
systemctl reload nginx
