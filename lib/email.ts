import 'server-only';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  return new Resend(apiKey);
}

function getMagicLinkEmailTemplate(magicLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a14; color: #ffffff;">
      <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">🌍 MapMyVisitors</h1>
        </div>

        <div style="background: #12121f; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">Access Your Dashboard</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #94a3b8; margin: 0 0 24px 0;">
            Click the button below to access your MapMyVisitors dashboard and retrieve your widget code.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Access Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #64748b; margin: 24px 0 0 0;">
            This link expires in 24 hours.<br>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e293b;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            MapMyVisitors - Show the world where your visitors come from
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      // Avoid throwing at import-time/build-time; fail gracefully at runtime.
      logger.error('[Email] RESEND_API_KEY missing; cannot send magic link email');
      return { success: false, error: 'RESEND_API_KEY missing' };
    }

    await resend.emails.send({
      from: 'MapMyVisitors <onboarding@resend.dev>',
      to: email,
      subject: 'Access Your MapMyVisitors Dashboard',
      html: getMagicLinkEmailTemplate(magicLink),
    });

    return { success: true };
  } catch (error) {
    logger.error('[Email] Send failed', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return { success: false, error };
  }
}
