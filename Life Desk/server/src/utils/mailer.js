import nodemailer from 'nodemailer';

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    // 1. Dedicated SMTP configuration (SendGrid, Mailgun, custom host, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      console.log('📬 Configured SMTP mailer with host:', process.env.SMTP_HOST);
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // 2. Gmail / Google Workspace App Password
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      !process.env.EMAIL_PASS.includes('your_16_digit')
    ) {
      console.log('📬 Configured Gmail mailer for:', process.env.EMAIL_USER);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // 3. Fallback: Ethereal test account (with fallback to local logger if offline)
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📬 Created Ethereal test email account:', testAccount.user);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.log('⚠️ Using console logger email transporter (no SMTP configured)');
      return {
        sendMail: async (mailOptions) => {
          console.log('\n================== 📧 EMAIL SENT ==================');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('Body:\n', mailOptions.text || mailOptions.html);
          console.log('====================================================\n');
          return { messageId: 'local-' + Date.now() };
        },
      };
    }
  })();

  return transporterPromise;
}

export async function sendPasswordResetEmail({ toEmail, userName, resetCode, resetLink }) {
  try {
    const transporter = await getTransporter();

    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || '"LifeHub Security" <no-reply@lifehub.local>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #4f46e5; font-size: 22px;">LifeHub</h2>
        </div>
        <p style="font-size: 16px; color: #1e293b; margin-bottom: 12px;">Hello ${userName || 'there'},</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
          We received a request to reset the password for your LifeHub account (<strong>${toEmail}</strong>).
        </p>

        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Your 6-Digit Verification Code</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b; font-family: monospace;">${resetCode}</div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">This code expires in 15 minutes.</p>
        </div>

        ${
          resetLink
            ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Reset Password Directly</a>
          </div>
        `
            : ''
        }

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your LifeHub Password Reset Code: ${resetCode}`,
      text: `Hello ${userName || ''},\n\nYour 6-digit password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nDirect reset link: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('🔗 Ethereal Email Preview URL:', previewUrl);
      }
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw error;
  }
}

