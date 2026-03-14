const RESEND_API_URL = 'https://api.resend.com/emails';

const isEmailConfigured = () => {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  if (!isEmailConfigured()) {
    throw new Error('Resend email service is not configured');
  }

  const studentName = name || 'Student';
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
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
    }),
  });

  if (!response.ok) {
    let errorMessage = `Resend API request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.message || errorBody?.error?.message || errorMessage;
    } catch (_) {
      // Keep fallback message if response is not JSON.
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
};
