const crypto = require('crypto');
const { sendEmail } = require('./emailer');
const logger = require('./logger');

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, firstName, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Eventro</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Welcome to Eventro, ${firstName}! 👋</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up for Eventro. To complete your registration, enter this OTP code in the verification screen.
        </p>
        
        <div style="text-align: center; margin: 26px 0;">
          <div style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #1f2937; background: #ffffff; border: 2px dashed #c7d2fe; border-radius: 10px; padding: 12px 20px;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          This OTP expires in 10 minutes.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0;">
          Never share this code with anyone.<br>
          If you didn't sign up for Eventro, please ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Your Eventro Verification OTP',
      html,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}: ${error.message}`);
    throw error;
  }
};

const sendReverificationSuccessEmail = async (email, firstName) => {
  const safeName = firstName || 'User';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Eventro</h1>
      </div>

      <div style="background: #f8f9fa; padding: 32px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Hi ${safeName},</h2>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Your Eventro account has been re-verified successfully.
        </p>

        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
          If this was not you, please contact support immediately.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Eventro Account Re-Verification Successful',
      html,
    });
    logger.info(`Re-verification success email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send re-verification email to ${email}: ${error.message}`);
    throw error;
  }
};

const sendForgotAccessOtpEmail = async (email, firstName, otp) => {
  const safeName = firstName || 'User';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Eventro</h1>
      </div>

      <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Hi ${safeName},</h2>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You requested a one-time code to access your account.
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <div style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #1f2937; background: #ffffff; border: 2px dashed #93c5fd; border-radius: 10px; padding: 12px 20px;">
            ${otp}
          </div>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center;">
          This OTP expires in 10 minutes.
        </p>

        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">

        <p style="color: #999; font-size: 13px; margin: 0;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Your Eventro Access OTP',
      html,
    });
    logger.info(`Forgot-access OTP email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send forgot-access OTP email to ${email}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendReverificationSuccessEmail,
  sendForgotAccessOtpEmail,
};
