const nodemailer = require('nodemailer');

// ── Create transporter with better error handling ─────────────
const createTransporter = () => {
  const config = {
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465', // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs in dev
    },
  };
  return nodemailer.CreateTransporter(config);
};

// ── Test SMTP connection on startup ───────────────────────────
const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email: SMTP_USER or SMTP_PASS not set — emails will not send');
    return false;
  }
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email: SMTP connection verified —', process.env.SMTP_USER);
    return true;
  } catch (error) {
    console.error('❌ Email: SMTP connection failed —', error.message);
    console.error('   Fix: Use a Gmail App Password, not your regular Gmail password.');
    console.error('   Guide: myaccount.google.com → Security → 2-Step Verification → App passwords');
    return false;
  }
};

// Run verification on startup (non-blocking)
testEmailConnection();

// ── Generate 6-digit OTP ──────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Send any email (core function) ───────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`Email skipped (no SMTP config): ${subject} → ${to}`);
    return false;
  }
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Global Allianz Insurance" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${subject} → ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed: ${subject} → ${to}`);
    console.error('   Error:', error.message);
    throw error;
  }
};

// ── OTP Email ─────────────────────────────────────────────────
const sendOTPEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your OTP Code — Global Allianz Insurance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Global Allianz Insurance Brokers</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226; margin: 0 0 16px;">Verify Your Email Address</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Welcome to Global Allianz! Use the OTP below to verify your email address.
            This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #061226; color: #D4AF37;
                        padding: 16px 40px; font-size: 32px; font-weight: bold;
                        border-radius: 12px; letter-spacing: 8px;">
              ${otp}
            </div>
          </div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            If you did not create an account, please ignore this email.
            Do not share this code with anyone.
          </p>
        </div>
        <div style="background: #F3F4F6; padding: 16px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Global Allianz Insurance Brokers · NAICOM Licensed
          </p>
        </div>
      </div>
    `,
  });
};

// ── Welcome Email ─────────────────────────────────────────────
const sendWelcomeEmail = async (email, firstName) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to Global Allianz Insurance!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Welcome to Global Allianz!</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226;">Hello ${firstName}!</h2>
          <p style="color: #374151; line-height: 1.6;">
            Your account has been verified. You can now purchase policies, file claims, and manage your coverage.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
               style="background: #061226; color: #D4AF37; padding: 12px 28px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch(() => {}); // Welcome email failure is non-critical
};

// ── Claim Notification ────────────────────────────────────────
const sendClaimNotification = async (email, firstName, claim) => {
  const statusColor = { submitted: '#2563EB', under_review: '#D97706', approved: '#16A34A', rejected: '#DC2626', paid: '#16A34A' }[claim.status] || '#2563EB';
  return sendEmail({
    to: email,
    subject: `Claim ${claim.claimNumber} — ${claim.status?.replace('_', ' ').toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Claim Update</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226;">Hello ${firstName},</h2>
          <p style="color: #374151;">Your claim status has been updated.</p>
          <div style="background: #F8FAFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p><strong>Claim Number:</strong> ${claim.claimNumber}</p>
            <p><strong>Amount:</strong> ₦${claim.claimedAmount?.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${claim.status?.replace('_', ' ').toUpperCase()}</span></p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
               style="background: #061226; color: #D4AF37; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Claim
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch(console.error);
};

// ── Payment Confirmation ──────────────────────────────────────
const sendPaymentConfirmation = async (email, firstName, payment) => {
  return sendEmail({
    to: email,
    subject: `Payment Confirmed — ₦${payment.amount?.toLocaleString()} Received`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Payment Confirmed ✅</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226;">Hello ${firstName},</h2>
          <p style="color: #374151;">Your payment has been received and your policy is now active.</p>
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p><strong>Reference:</strong> ${payment.reference}</p>
            <p><strong>Amount:</strong> ₦${payment.amount?.toLocaleString()} NGN</p>
            <p><strong>Date:</strong> ${new Date(payment.paidAt || Date.now()).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
               style="background: #061226; color: #D4AF37; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View My Policies
            </a>
          </div>
        </div>
      </div>
    `,
  }).catch(console.error);
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendClaimNotification,
  sendPaymentConfirmation,
  testEmailConnection,
};
