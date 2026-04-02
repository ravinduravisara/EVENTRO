const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
      attachments,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
