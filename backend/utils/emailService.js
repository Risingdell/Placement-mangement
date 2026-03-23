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

const sendDriveNotificationEmail = async ({ to, studentName, companyName, role, ctc, driveDate, registrationDeadline, applicationLink }) => {
  if (!isEmailConfigured()) {
    throw new Error('Resend email service is not configured');
  }

  const name = studentName || 'Student';
  const formattedDriveDate = new Date(driveDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedDeadline = new Date(registrationDeadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject: `Placement Opportunity: ${companyName} - ${role}`,
      text: [
        `Hello ${name},`,
        '',
        `You are eligible to apply for a placement opportunity at ${companyName}.`,
        '',
        `Position: ${role}`,
        `Package: ${ctc} LPA`,
        `Drive Date: ${formattedDriveDate}`,
        `Application Deadline: ${formattedDeadline}`,
        '',
        'Click the link below to apply:',
        applicationLink,
        '',
        'Best of luck with your application!',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <p>Hello ${name},</p>
          <p>You are eligible to apply for a placement opportunity at <strong>${companyName}</strong>.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:6px;margin:16px 0;">
            <p style="margin:8px 0;"><strong>Position:</strong> ${role}</p>
            <p style="margin:8px 0;"><strong>Package:</strong> ${ctc} LPA</p>
            <p style="margin:8px 0;"><strong>Drive Date:</strong> ${formattedDriveDate}</p>
            <p style="margin:8px 0;"><strong>Application Deadline:</strong> ${formattedDeadline}</p>
          </div>
          <p>
            <a href="${applicationLink}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">
              Apply Now
            </a>
          </p>
          <p>If the button does not open, use this link:</p>
          <p><a href="${applicationLink}">${applicationLink}</a></p>
          <p>Best of luck with your application!</p>
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
  sendDriveNotificationEmail,
};
