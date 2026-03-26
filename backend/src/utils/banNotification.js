const { sendEmail } = require('./emailer');
const logger = require('./logger');

const sendBanNotificationEmail = async (email, firstName) => {
  const safeName = firstName || 'User';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <div style="background: #111827; color: #ffffff; padding: 16px 20px; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 22px;">Eventro Account Notice</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; padding: 24px; background: #ffffff;">
        <p style="margin-top: 0;">Hi ${safeName},</p>
        <p>
          Your Eventro account has been banned by an administrator due to a policy or platform rule violation.
        </p>
        <p>
          You will not be able to access your account while this ban is active.
        </p>
        <p>
          If you believe this was a mistake, please contact support to request a review.
        </p>
        <p style="margin-bottom: 0; color: #6b7280; font-size: 13px;">
          This is an automated security notification from Eventro.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Your Eventro account has been banned',
      html,
    });
  } catch (error) {
    logger.error(`Failed to send ban notification to ${email}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendBanNotificationEmail };
