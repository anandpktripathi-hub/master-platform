# Scripts Directory Organization

This directory contains organized scripts for the SMETASC SaaS Multi-Tenancy platform.

## Directory Structure

### `/setup`
Scripts for initial setup and configuration:
- `auto-setup.ps1` - Automated project setup
- `test-cms.ps1` - CMS testing script
- `setup-default-admin.js` - Create default admin user

### `/automation`
Automated maintenance and operational scripts:
- `auto-git-backup.ps1` - Automated Git backup
- `full-project-backup.ps1` - Complete project backup
- `ssl-automation.sh` - SSL certificate automation
- `asset-sync.sh` - Asset synchronization

### `/deployment`
Deployment and infrastructure scripts:
- `deploy-tenant.sh` - Tenant deployment
- `aws-route53.ts` - AWS Route53 DNS management
- `cloudflare-dns.ts` - Cloudflare DNS management
- `nginx-generator.ts` - NGINX configuration generator

### `/utilities`
Utility and helper scripts:
- `git-workflow.ps1` - Git workflow helpers
- `reset-user.js` - User reset utility

## Usage

Each script contains inline documentation. Run with appropriate permissions:
- PowerShell: `.\script-name.ps1`
- Shell: `./script-name.sh`
- Node.js: `node script-name.js`
