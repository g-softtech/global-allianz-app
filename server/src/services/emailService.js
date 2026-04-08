const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Global Allianz Insurance" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Global Allianz Insurance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3A8A; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Global Allianz Insurance</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1E3A8A; margin-bottom: 20px;">Email Verification</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Welcome to Global Allianz Insurance Brokers! To complete your registration,
              please verify your email address using the OTP below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #2563EB; color: white;
                          padding: 15px 30px; font-size: 24px; font-weight: bold;
                          border-radius: 8px; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this verification,
              please ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              Global Allianz Insurance Brokers<br>
              Trusted insurance solutions for individuals and businesses
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Global Allianz Insurance" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Global Allianz Insurance!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3A8A; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Global Allianz!</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1E3A8A; margin-bottom: 20px;">Hello ${firstName}!</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for choosing Global Allianz Insurance Brokers. Your account has been
              successfully created and verified.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              You can now access our comprehensive insurance solutions including:
            </p>

            <ul style="font-size: 16px; line-height: 1.8; color: #333;">
              <li>Motor Insurance</li>
              <li>Health Insurance</li>
              <li>Life Insurance</li>
              <li>Travel Insurance</li>
              <li>Corporate Insurance</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login"
                 style="background-color: #2563EB; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Get Started
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Welcome email failed:', error);
    // Don't throw error for welcome emails
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};