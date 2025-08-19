const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email configuration not found. Skipping email send.');
      return { success: false, message: 'Email configuration not available' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // Password reset email template
  passwordReset: (resetUrl, userName) => ({
    subject: 'Password Reset Request - LocalThread',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">LocalThread</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName || 'there'}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your LocalThread account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 15 minutes for security reasons.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email from LocalThread. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  // Email verification template
  emailVerification: (verificationUrl, userName) => ({
    subject: 'Verify Your Email - LocalThread',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">LocalThread</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to LocalThread, ${userName || 'there'}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for creating an account with LocalThread. To complete your registration, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This verification link will expire in 24 hours.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't create an account with LocalThread, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email from LocalThread. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  // Welcome email template
  welcome: (userName) => ({
    subject: 'Welcome to LocalThread!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">LocalThread</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to LocalThread, ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining LocalThread! We're excited to have you as part of our community 
            of local artisans and customers.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Here's what you can do on LocalThread:
          </p>
          
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>Discover unique products from local vendors</li>
            <li>Support local artisans and businesses</li>
            <li>Find authentic, handmade items</li>
            <li>Connect with your local community</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Exploring
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Welcome to the LocalThread family!
          </p>
        </div>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
}; 