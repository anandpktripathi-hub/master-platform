import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from '../schemas/invoice.schema';
import { Tenant, TenantDocument } from '../../schemas/tenant.schema';
import * as PDFKit from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { SettingsService } from '../../../backend/src/modules/settings/settings.service';
import { entriesToBrandingDto } from '../../../backend/src/modules/settings/mappers/branding-settings-mappers';
import { entriesToCurrencyDto } from '../../../backend/src/modules/settings/mappers/currency-settings-mappers';
import { entriesToSystemDto } from '../../../backend/src/modules/settings/mappers/system-settings-mappers';
import { CurrencySettingsDto } from '../../../backend/src/modules/settings/dto/currency-settings.dto';
import { SystemSettingsDto } from '../../../backend/src/modules/settings/dto/system-settings.dto';

@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    private readonly settingsService: SettingsService,
  ) {}

  async generate(invoice: Invoice): Promise<Buffer> {
    const appName = this.configService.get<string>('APP_NAME') || 'Master Platform';

    // Global company branding + currency/system formats from settings
    const [brandingGroup, currencyGroup, systemGroup] = await Promise.all([
      this.settingsService.getGroupAdmin('branding'),
      this.settingsService.getGroupAdmin('currency'),
      this.settingsService.getGroupAdmin('system'),
    ]);

    const branding = entriesToBrandingDto(brandingGroup.items);
    const currencySettings = entriesToCurrencyDto(currencyGroup.items);
    const systemSettings = entriesToSystemDto(systemGroup.items);

    const logoPath = branding.logoDark || branding.siteLogo || undefined;

    const companyName = branding.titleText || this.configService.get<string>('COMPANY_NAME') || appName;
    const companyAddress = this.configService.get<string>('COMPANY_ADDRESS') || '';

    // Resolve tenant display name up front (no async work inside PDF stream callbacks)
    let tenantDisplay = `Tenant: ${invoice['tenantId']}`;
    try {
      const tenant = await this.tenantModel
        .findById(invoice['tenantId'])
        .lean();
      if (tenant && tenant.name) {
        tenantDisplay = tenant.name as string;
      }
    } catch {
      // Fallback to raw tenant id
    }

    // Attempt to load logo image (from URL or filesystem). Failures are non-fatal.
    const logoBuffer = await this.loadLogoBuffer(logoPath);

    const doc = new PDFKit({ size: 'A4', margin: 50 });

    const chunks: Uint8Array[] = [];
    return await new Promise<Buffer>((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks.map((c) => Buffer.from(c))));
      });

      // Header / Branding with optional logo image
      const headerTop = doc.y;

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, headerTop, { fit: [120, 40] });
        } catch {
          // If the image cannot be rendered, continue without failing PDF generation
        }
      }

      const textStartY = headerTop + (logoBuffer ? 45 : 0);

      doc
        .fillColor('#111827')
        .fontSize(20)
        .text(companyName, 50, textStartY);

      if (companyAddress) {
        doc
          .moveDown(0.3)
          .fontSize(9)
          .fillColor('#4b5563')
          .text(companyAddress, { align: 'left' });
      }

      doc
        .fontSize(26)
        .fillColor('#111827')
        .text('INVOICE', 0, headerTop, { align: 'right' });

      doc.moveDown(1.5);

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .lineWidth(1)
        .stroke('#e5e7eb');

      doc.moveDown(1);

      // Invoice metadata
      const currency = (invoice.currency || 'USD').toUpperCase();
      const createdAt = invoice['createdAt'] ? new Date(invoice['createdAt']) : new Date();
      const dueDate = invoice['dueDate'] ? new Date(invoice['dueDate']) : null;

      doc
        .fontSize(10)
        .fillColor('#4b5563')
        .text(`Invoice Number`, 50, doc.y, { continued: true })
        .fillColor('#111827')
        .text(`  ${invoice.invoiceNumber || invoice['_id']}`);

      doc
        .fillColor('#4b5563')
        .text(`Issued On`, 50, doc.y, { continued: true })
        .fillColor('#111827')
        .text(`  ${this.formatDateForSystem(createdAt, systemSettings)}`);

      if (dueDate) {
        doc
          .fillColor('#4b5563')
          .text(`Due Date`, 50, doc.y, { continued: true })
          .fillColor('#111827')
          .text(`  ${this.formatDateForSystem(dueDate, systemSettings)}`);
      }

      if (invoice['status']) {
        doc
          .fillColor('#4b5563')
          .text(`Status`, 50, doc.y, { continued: true })
          .fillColor('#111827')
          .text(`  ${invoice['status']}`);
      }

      doc.moveDown(1);

      // Bill To (tenant display info)
      doc
        .fontSize(10)
        .fillColor('#4b5563')
        .text('Bill To')
        .moveDown(0.3)
        .fillColor('#111827')
        .text(tenantDisplay);

      doc.moveDown(1.2);

      // Line items table
      const tableTop = doc.y;
      const itemDescriptionX = 50;
      const itemQtyX = 340;
      const itemAmountX = 430;

      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('Description', itemDescriptionX, tableTop)
        .text('Qty', itemQtyX, tableTop)
        .text('Amount', itemAmountX, tableTop, { align: 'right' });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(545, tableTop + 15)
        .lineWidth(1)
        .stroke('#e5e7eb');

      let y = tableTop + 25;
      const lineItems = invoice.lineItems || [];

      if (lineItems.length > 0) {
        lineItems.forEach((item) => {
          doc
            .fontSize(10)
            .fillColor('#111827')
            .text(item.description, itemDescriptionX, y, { width: 270 })
            .text(String(item.quantity ?? 1), itemQtyX, y)
            .text(
              this.formatCurrencyAmount(item.amount, currency, currencySettings),
              itemAmountX,
              y,
              {
                align: 'right',
              },
            );

          y += 18;
        });
      } else {
        const baseAmountMajor = (invoice.amount || 0) / 100;
        doc
          .fontSize(10)
          .fillColor('#111827')
            .text('Subscription billing', itemDescriptionX, y, { width: 270 })
            .text('1', itemQtyX, y)
            .text(
              this.formatCurrencyAmount(invoice.amount || 0, currency, currencySettings),
              itemAmountX,
              y,
              {
                align: 'right',
              },
            );

        y += 18;
      }

      // Totals
      const subtotal = invoice.amount || 0;

      doc.moveTo(50, y + 5).lineTo(545, y + 5).lineWidth(1).stroke('#e5e7eb');

      doc
        .fontSize(10)
        .fillColor('#4b5563')
        .text('Subtotal', itemAmountX, y + 15, { align: 'right', continued: true })
        .fillColor('#111827')
        .text(`  ${this.formatCurrencyAmount(subtotal, currency, currencySettings)}`);

      doc.moveDown(2);

      doc
        .fontSize(9)
        .fillColor('#6b7280')
        .text(
          `${companyName} · Generated by ${appName}. This invoice is valid without a signature.`,
          50,
          doc.y,
          { width: 495 },
        );

      doc.end();
    });
  }

  private formatDateForSystem(date: Date, systemSettings: SystemSettingsDto): string {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }

    const fmt = (systemSettings && systemSettings.dateFormat || '').toUpperCase().trim();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    if (!fmt) {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    let separator = '/';
    for (const candidate of ['/', '-', '.', ' ']) {
      if (fmt.includes(candidate)) {
        separator = candidate;
        break;
      }
    }

    if (fmt.startsWith('DD')) {
      return [day, month, year].join(separator);
    }
    if (fmt.startsWith('MM')) {
      return [month, day, year].join(separator);
    }
    if (fmt.startsWith('YYYY')) {
      const parts = fmt.split(separator);
      if (parts[1] && parts[1].startsWith('MM')) {
        return [year, month, day].join(separator);
      }
      return [year, day, month].join(separator);
    }

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatCurrencyAmount(
    amountInCents: number,
    currencyCode: string,
    currencySettings: CurrencySettingsDto,
  ): string {
    const code = (currencyCode || currencySettings?.defaultCurrencyCode || 'USD').toUpperCase();
    const amountMajor = (amountInCents || 0) / 100;

    const decimalFormat = currencySettings?.decimalFormat || '';
    let fractionDigits = 2;
    const match = decimalFormat.match(/0[.,](0+)/);
    if (match) {
      fractionDigits = match[1].length;
    }

    const decimalSep = currencySettings?.decimalSeparator === 'comma' ? ',' : '.';

    let thousandSep: string;
    switch (currencySettings?.thousandSeparator) {
      case 'comma':
        thousandSep = ',';
        break;
      case 'space':
        thousandSep = ' ';
        break;
      case 'none':
        thousandSep = '';
        break;
      case 'dot':
      default:
        thousandSep = '.';
        break;
    }

    const abs = Math.abs(amountMajor);
    const sign = amountMajor < 0 ? '-' : '';

    const base = abs.toFixed(fractionDigits);
    const [intRaw, frac] = base.split('.');

    const useIndianGrouping = code === 'INR';

    const intWithSep = thousandSep
      ? this.formatIntegerWithGrouping(intRaw, thousandSep, useIndianGrouping)
      : intRaw;

    const numeric = frac ? `${intWithSep}${decimalSep}${frac}` : intWithSep;

    let symbol: string;
    if (currencySettings?.currencySymbolMode === 'symbol') {
      const map: Record<string, string> = {
        USD: '$',
        EUR: '€',
        INR: '₹',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
        JPY: '¥',
      };
      symbol = map[code] || code;
    } else {
      symbol = code;
    }

    const space = currencySettings?.currencySymbolSpace === 'with' ? ' ' : '';

    if (currencySettings?.currencySymbolPosition === 'post') {
      return `${sign}${numeric}${space}${symbol}`;
    }

    return `${sign}${symbol}${space}${numeric}`;
  }

  private formatIntegerWithGrouping(
    intRaw: string,
    thousandSep: string,
    useIndianGrouping: boolean,
  ): string {
    if (!thousandSep) {
      return intRaw;
    }

    if (!useIndianGrouping) {
      return intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
    }

    if (intRaw.length <= 3) {
      return intRaw;
    }

    const last3 = intRaw.slice(-3);
    let rest = intRaw.slice(0, -3);
    const parts: string[] = [];

    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }

    if (rest) {
      parts.unshift(rest);
    }

    return `${parts.join(thousandSep)}${thousandSep}${last3}`;
  }

  private async loadLogoBuffer(logoPath?: string | null): Promise<Buffer | null> {
    if (!logoPath) {
      return null;
    }

    try {
      // Remote URL (http/https)
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        const client = logoPath.startsWith('https://') ? https : http;

        return await new Promise<Buffer>((resolve, reject) => {
          client
            .get(logoPath, (res) => {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(
                  new Error(`Failed to fetch logo image, status code ${res.statusCode}`),
                );
              }

              const data: Uint8Array[] = [];
              res.on('data', (chunk) => data.push(chunk));
              res.on('end', () => resolve(Buffer.concat(data.map((c) => Buffer.from(c)))));
            })
            .on('error', reject);
        });
      }

      // URL path relative to public app URL (e.g. `/storage/logo-dark.png`)
      if (logoPath.startsWith('/')) {
        const publicBase =
          this.configService.get<string>('PUBLIC_APP_URL') ||
          process.env.FRONTEND_URL ||
          'http://localhost:5173';

        const fullUrl = `${publicBase.replace(/\/$/, '')}${logoPath}`;
        const client = fullUrl.startsWith('https://') ? https : http;

        return await new Promise<Buffer>((resolve, reject) => {
          client
            .get(fullUrl, (res) => {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(
                  new Error(`Failed to fetch logo image, status code ${res.statusCode}`),
                );
              }

              const data: Uint8Array[] = [];
              res.on('data', (chunk) => data.push(chunk));
              res.on('end', () => resolve(Buffer.concat(data.map((c) => Buffer.from(c)))));
            })
            .on('error', reject);
        });
      }

      // Filesystem path (absolute or relative to process.cwd())
      const resolvedPath = path.isAbsolute(logoPath)
        ? logoPath
        : path.join(process.cwd(), logoPath);

      return await fs.promises.readFile(resolvedPath);
    } catch {
      // Any failure should not break invoice generation
      return null;
    }
  }
}
