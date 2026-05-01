const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls:    { rejectUnauthorized: false },
});

const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email: SMTP_USER or SMTP_PASS not set');
    return false;
  }
  try {
    await createTransporter().verify();
    console.log('✅ Email: SMTP connection verified —', process.env.SMTP_USER);
    return true;
  } catch (error) {
    console.error('❌ Email: SMTP connection failed —', error.message);
    return false;
  }
};
testEmailConnection();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async ({ to, subject, html, replyTo }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`Email skipped (no SMTP): ${subject} → ${to}`);
    return false;
  }
  try {
    const opts = { from: `"Global Allianz Insurance" <${process.env.SMTP_USER}>`, to, subject, html };
    if (replyTo) opts.replyTo = replyTo;
    const info = await createTransporter().sendMail(opts);
    console.log(`✅ Email sent: ${subject} → ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed: ${subject} → ${to} — ${error.message}`);
    throw error;
  }
};

const LOGO = `<div style="background:#061226;padding:24px;text-align:center"><h1 style="color:#D4AF37;margin:0;font-size:22px">Global Allianz Insurance Brokers</h1></div>`;
const FOOTER_HTML = `<div style="background:#F3F4F6;padding:16px;text-align:center"><p style="color:#9CA3AF;font-size:12px;margin:0">© ${new Date().getFullYear()} Global Allianz Insurance Brokers · NAICOM Licensed</p></div>`;

const sendOTPEmail = async (email, otp) => sendEmail({
  to: email,
  subject: 'Your OTP Code — Global Allianz Insurance',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226;margin:0 0 16px">Verify Your Email Address</h2><p style="color:#374151;line-height:1.6">Welcome to Global Allianz! Use the OTP below to verify your email. This code expires in <strong>10 minutes</strong>.</p><div style="text-align:center;margin:32px 0"><div style="display:inline-block;background:#061226;color:#D4AF37;padding:16px 40px;font-size:32px;font-weight:bold;border-radius:12px;letter-spacing:8px">${otp}</div></div><p style="color:#6B7280;font-size:14px">If you did not create an account, ignore this email. Do not share this code.</p></div>${FOOTER_HTML}</div>`,
});

const sendWelcomeEmail = async (email, firstName) => sendEmail({
  to: email,
  subject: 'Welcome to Global Allianz Insurance!',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">Hello ${firstName}!</h2><p style="color:#374151;line-height:1.6">Your account has been verified. You can now purchase policies, file claims, and manage your coverage.</p><div style="text-align:center;margin:28px 0"><a href="${process.env.CLIENT_URL||'http://localhost:5173'}/dashboard" style="background:#061226;color:#D4AF37;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Go to Dashboard</a></div></div>${FOOTER_HTML}</div>`,
}).catch(() => {});

const sendPasswordResetEmail = async (email, firstName, resetURL) => sendEmail({
  to: email,
  subject: 'Reset Your Password — Global Allianz Insurance',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226;margin:0 0 16px">Reset Your Password</h2><p style="color:#374151;line-height:1.6">Hello ${firstName},</p><p style="color:#374151;line-height:1.6;margin:0 0 24px">We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p><div style="text-align:center;margin:32px 0"><a href="${resetURL}" style="background:linear-gradient(135deg,#B8860B,#D4AF37);color:#061226;padding:14px 36px;font-size:15px;font-weight:bold;border-radius:10px;text-decoration:none;display:inline-block">Reset My Password</a></div><p style="color:#6B7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p><p style="color:#9CA3AF;font-size:11px;word-break:break-all;margin-top:12px">Or copy: <a href="${resetURL}" style="color:#D4AF37">${resetURL}</a></p></div>${FOOTER_HTML}</div>`,
});

const sendKYCApprovedEmail = async (email, firstName) => sendEmail({
  to: email,
  subject: '✅ KYC Verified — Global Allianz Insurance',
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">Congratulations, ${firstName}! 🎉</h2><p style="color:#374151;line-height:1.6">Your identity has been successfully verified by our compliance team. You now have full access to all Global Allianz services.</p><div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:20px 0"><p style="color:#15803D;font-weight:600;margin:0 0 8px">You can now:</p><ul style="color:#374151;margin:0;padding-left:20px;line-height:1.8"><li>Purchase insurance policies</li><li>File and track claims</li><li>Access all premium features</li></ul></div><div style="text-align:center;margin:24px 0"><a href="${process.env.CLIENT_URL||'http://localhost:5173'}/policies/buy" style="background:linear-gradient(135deg,#B8860B,#D4AF37);color:#061226;padding:14px 32px;font-weight:bold;border-radius:10px;text-decoration:none;display:inline-block">Buy a Policy Now</a></div></div>${FOOTER_HTML}</div>`,
}).catch(console.error);

const sendClaimNotification = async (email, firstName, claim) => {
  const statusColor = { submitted:'#2563EB',under_review:'#D97706',approved:'#16A34A',rejected:'#DC2626',paid:'#16A34A' }[claim.status] || '#2563EB';
  return sendEmail({
    to: email,
    subject: `Claim ${claim.claimNumber} — ${claim.status?.replace('_',' ').toUpperCase()}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">Hello ${firstName},</h2><p style="color:#374151">Your claim status has been updated.</p><div style="background:#F8FAFF;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin:20px 0"><p><strong>Claim Number:</strong> ${claim.claimNumber}</p><p><strong>Amount:</strong> ₦${claim.claimedAmount?.toLocaleString()}</p><p><strong>Status:</strong> <span style="color:${statusColor};font-weight:bold">${claim.status?.replace('_',' ').toUpperCase()}</span></p></div><div style="text-align:center"><a href="${process.env.CLIENT_URL||'http://localhost:5173'}/dashboard" style="background:#061226;color:#D4AF37;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">View Claim</a></div></div>${FOOTER_HTML}</div>`,
  }).catch(console.error);
};

const sendPaymentConfirmation = async (email, firstName, payment) => sendEmail({
  to: email,
  subject: `Payment Confirmed — ₦${payment.amount?.toLocaleString()} Received`,
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">Hello ${firstName},</h2><p style="color:#374151">Your payment has been received and your policy is now active.</p><div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:20px 0"><p><strong>Reference:</strong> ${payment.reference}</p><p><strong>Amount:</strong> ₦${payment.amount?.toLocaleString()} NGN</p><p><strong>Date:</strong> ${new Date(payment.paidAt||Date.now()).toLocaleDateString('en-NG',{dateStyle:'long'})}</p></div><div style="text-align:center"><a href="${process.env.CLIENT_URL||'http://localhost:5173'}/dashboard" style="background:#061226;color:#D4AF37;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">View My Policies</a></div></div>${FOOTER_HTML}</div>`,
}).catch(console.error);

const sendContactEnquiry = async ({ name, email, phone, subject, message }) => {
  await sendEmail({
    to: process.env.SMTP_USER,
    subject: `New Enquiry: ${subject} — from ${name}`,
    replyTo: email,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">New Contact Enquiry</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Name</td><td style="padding:8px 0;font-weight:600;color:#061226">${name}</td></tr><tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Email</td><td style="padding:8px 0;font-weight:600;color:#061226">${email}</td></tr><tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Phone</td><td style="padding:8px 0;font-weight:600;color:#061226">${phone||'Not provided'}</td></tr><tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Subject</td><td style="padding:8px 0;font-weight:600;color:#061226">${subject}</td></tr></table><div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-top:16px"><p style="color:#374151;font-size:14px;line-height:1.6;margin:0">${message}</p></div></div>${FOOTER_HTML}</div>`,
  });
  await sendEmail({
    to: email,
    subject: 'We received your message — Global Allianz Insurance',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">${LOGO}<div style="padding:32px;background:#fff"><h2 style="color:#061226">Thank you, ${name}!</h2><p style="color:#374151;line-height:1.6">We have received your enquiry and a broker will contact you within 24 hours.</p><p style="color:#374151;line-height:1.6">For urgent matters, call <strong>08033499582</strong> or WhatsApp <strong>09093499582</strong>.</p></div>${FOOTER_HTML}</div>`,
  }).catch(() => {});
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendKYCApprovedEmail,
  sendClaimNotification,
  sendPaymentConfirmation,
  sendContactEnquiry,
  testEmailConnection,
};
