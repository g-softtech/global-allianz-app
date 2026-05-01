// ADD THESE TWO FUNCTIONS to your emailService.js
// Place them before module.exports

// ── KYC Approved Email ────────────────────────────────────────
const sendKYCApprovedEmail = async (email, firstName) => {
  return sendEmail({
    to: email,
    subject: '✅ KYC Verified — Global Allianz Insurance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Identity Verified!</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226;">Congratulations, ${firstName}! 🎉</h2>
          <p style="color: #374151; line-height: 1.6;">
            Your identity has been successfully verified by our compliance team.
            You now have full access to all Global Allianz services.
          </p>
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #15803D; font-weight: 600; margin: 0 0 8px;">You can now:</p>
            <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Purchase insurance policies</li>
              <li>File and track claims</li>
              <li>Access all premium features</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/policies/buy"
               style="background: linear-gradient(135deg, #B8860B, #D4AF37); color: #061226;
                      padding: 14px 32px; font-weight: bold; border-radius: 10px;
                      text-decoration: none; display: inline-block;">
              Buy a Policy Now
            </a>
          </div>
        </div>
        <div style="background: #F3F4F6; padding: 16px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Global Allianz Insurance Brokers · NAICOM Licensed
          </p>
        </div>
      </div>
    `,
  }).catch(console.error);
};

// ── Password Reset Email ──────────────────────────────────────
const sendPasswordResetEmail = async (email, firstName, resetURL) => {
  return sendEmail({
    to: email,
    subject: 'Reset Your Password — Global Allianz Insurance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #061226; padding: 24px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">Global Allianz Insurance Brokers</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #061226; margin: 0 0 16px;">Reset Your Password</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 8px;">Hello ${firstName},</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password.
            Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetURL}"
               style="background: linear-gradient(135deg, #B8860B, #D4AF37); color: #061226;
                      padding: 14px 36px; font-size: 15px; font-weight: bold;
                      border-radius: 10px; text-decoration: none; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6B7280; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #9CA3AF; font-size: 11px; word-break: break-all; margin-top: 12px;">
            Link: <a href="${resetURL}" style="color: #D4AF37;">${resetURL}</a>
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

// UPDATE module.exports to include both new functions:
// module.exports = {
//   generateOTP, sendOTPEmail, sendWelcomeEmail,
//   sendClaimNotification, sendPaymentConfirmation,
//   sendContactEnquiry, sendKYCApprovedEmail,
//   sendPasswordResetEmail, testEmailConnection,
// };
