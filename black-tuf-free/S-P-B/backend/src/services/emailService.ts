import nodemailer from 'nodemailer';
import config from '../config/index';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  if (!config.smtp.user) {
    console.warn('[email] SMTP credentials not configured; emails will be logged only.');
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    }
  });

  return transporter;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const t = getTransporter();
    const from = config.smtp.from;
    await t.sendMail({ from, ...options });
    console.log(`[email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (err) {
    console.error('[email] Send error:', err);
    return false;
  }
};

export const renderTemplate = (template: string, replacements: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
};


