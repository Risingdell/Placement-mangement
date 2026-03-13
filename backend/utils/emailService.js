const nodemailer = require('nodemailer');

let transporterPromise = null;

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || 'true') === 'true',
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );
  }

  return transporterPromise;
};

const isEmailConfigured = () => {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  if (!isEmailConfigured()) {
    throw new Error('Email service is not configured');
  }

  const transporter = await getTransporter();
  const sender = process.env.MAIL_FROM || process.env.SMTP_USER;
  const studentName = name || 'Student';

  await transporter.sendMail({
    from: sender,
    to,
    subject: 'Reset your Placement Portal password',
    text: [
      `Hello ${studentName},`,
      '',
      'We received a request to reset your Placement Portal password.',
      'Open the link below to set a new password:',
      resetUrl,
      '',
      'This link expires in 30 minutes.',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hello ${studentName},</p>
        <p>We received a request to reset your Placement Portal password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>If the button does not open, use this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
};
