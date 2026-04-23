const nodemailer = require('nodemailer');

const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Warning: Email verification is disabled. Missing environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Create transporter only if all required env vars are present
let transporter = null;

if (missingEnvVars.length === 0) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send email verification link
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} verificationToken - Unique verification token
 * @returns {Promise<boolean>} - Returns true if email sent, false if transporter not configured
 */
async function sendVerificationEmail(email, name, verificationToken) {
  if (!transporter) {
    console.warn(
      'Email transporter not configured. Skipping verification email for:',
      email
    );
    return false;
  }

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Welcome to Movie Watchlist!</h1>
      <p>Hi ${name},</p>
      <p>Please verify your email address to complete your registration.</p>
      <p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you did not create this account, please ignore this email.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">
        Movie Watchlist Team
      </p>
    `,
    text: `
      Welcome to Movie Watchlist!\n
      Please verify your email address to complete your registration.\n
      Click this link: ${verificationLink}\n
      This link will expire in 30 minutes.\n
      If you did not create this account, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error.message);
    throw error;
  }
}

module.exports = {
  transporter,
  sendVerificationEmail,
};
