import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

@Injectable()
export class SslService {
  getSslStatus(domain: string) {
    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const exists = fs.existsSync(certPath);
    return {
      domain,
      ssl: exists,
      certPath: exists ? certPath : null,
    };
  }
}
