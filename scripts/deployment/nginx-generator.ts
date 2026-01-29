import fs from 'fs';
import path from 'path';

const templatePath = path.join(__dirname, '../nginx/tenant.conf.template');
const outputDir = path.join(__dirname, '../nginx/dynamic-sites-enabled');

export function generateNginxConfig(domain: string, tenantId: string) {
  const template = fs.readFileSync(templatePath, 'utf-8');
  const config = template
    .replace(/__DOMAIN__/g, domain)
    .replace(/__TENANT_ID__/g, tenantId);
  const outputPath = path.join(outputDir, `${domain}.conf`);
  fs.writeFileSync(outputPath, config);
  return outputPath;
}

// Example usage:
// generateNginxConfig('tenant-domain.com', 'tenant123');
