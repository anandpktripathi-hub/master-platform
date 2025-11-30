import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@transformatrix.com',
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const html = this.compileTemplate('welcome', { firstName });
    await this.sendEmail(email, 'Welcome to Master Platform!', html);
  }

  async sendPasswordChangedEmail(email: string, firstName: string) {
    const html = this.compileTemplate('password-changed', { firstName });
    await this.sendEmail(email, 'Password Changed Successfully', html);
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.compileTemplate('password-reset', { firstName, resetUrl });
    await this.sendEmail(email, 'Password Reset Request', html);
  }

  async sendPasswordResetConfirmationEmail(email: string, firstName: string) {
    const html = this.compileTemplate('password-reset-confirmation', { firstName });
    await this.sendEmail(email, 'Password Reset Successful', html);
  }
}
