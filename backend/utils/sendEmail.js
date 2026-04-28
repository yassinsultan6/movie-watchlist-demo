const nodemailer = require('nodemailer');

// Validate required SMTP environment variables
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️  Warning: Email service is disabled. Missing environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Create Nodemailer transporter only if all required env vars are present
let transporter = null;

if (missingEnvVars.length === 0) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify SMTP connection on startup
  transporter.verify((error) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
    } else {
      console.log('✅ SMTP connection established — email service ready');
    }
  });
}

/**
 * Send verification email with verification link
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.verifyUrl - Full verification URL with token and email
 * @returns {Promise<boolean>} - Returns true if email sent, false if transporter not configured
 * @throws {Error} - If email sending fails
 */
async function sendVerificationEmail({ to, name, verifyUrl }) {
  if (!transporter) {
    console.warn(
      `⚠️  Email transporter not configured. Verification email not sent to: ${to}`
    );
    return false;
  }

  if (!to || !name || !verifyUrl) {
    const error = new Error('Missing required parameters: to, name, verifyUrl');
    error.status = 400;
    throw error;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify Your Email Address - Movie Watchlist',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #007bff; margin: 0; font-size: 28px; }
            .content { background-color: white; padding: 30px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .message { font-size: 14px; color: #555; margin-bottom: 20px; line-height: 1.8; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .button:hover { background-color: #0056b3; }
            .fallback-link { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Movie Watchlist</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${name},</p>
              <p class="message">
                Thank you for registering! Please verify your email address to complete your account setup and start building your movie watchlist.
              </p>
              <div class="button-container">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <p class="message">
                Or copy and paste this link in your browser:
              </p>
              <div class="fallback-link">
                <p style="word-break: break-all; margin: 0;">${verifyUrl}</p>
              </div>
              <p class="message" style="font-size: 12px; color: #999;">
                This verification link will expire in 30 minutes.
              </p>
              <p class="message" style="font-size: 12px; color: #999;">
                If you did not create this account, please ignore this email or contact support.
              </p>
            </div>
            <div class="footer">
              <p>Movie Watchlist Team</p>
              <p>© 2026 Movie Watchlist. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Movie Watchlist Email Verification

      Hi ${name},

      Thank you for registering! Please verify your email address to complete your account setup and start building your movie watchlist.

      Click this link to verify your email: ${verifyUrl}

      Or copy and paste this link in your browser:
      ${verifyUrl}

      This verification link will expire in 30 minutes.

      If you did not create this account, please ignore this email or contact support.

      Movie Watchlist Team
      © 2026 Movie Watchlist. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Verification email sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`✗ Error sending verification email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  transporter,
};
