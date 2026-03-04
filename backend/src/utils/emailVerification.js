const crypto = require('crypto');
const { sendEmail } = require('./emailer');
const logger = require('./logger');

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Eventro</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Welcome to Eventro, ${firstName}! 👋</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up for Eventro. To complete your registration, please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          Or copy and paste this link in your browser:<br>
          <code style="background: #fff; padding: 5px 10px; border-radius: 3px; word-break: break-all;">${verificationUrl}</code>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0;">
          This verification link will expire in 24 hours.<br>
          If you didn't sign up for Eventro, please ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your Email Address - Eventro',
      html,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}: ${error.message}`);
    throw error;
  }
};

module.exports = { generateVerificationToken, sendVerificationEmail };
