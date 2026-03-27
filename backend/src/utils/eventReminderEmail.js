const { sendEmail } = require('./emailer');

const buildEventReminderHtml = ({ firstName, eventTitle, eventDate, location, ticketUrl }) => {
  const safeName = firstName || 'there';
  const safeTitle = eventTitle || 'your event';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin:0 0 12px;">Reminder: ${safeTitle}</h2>
      <p style="margin:0 0 10px;">Hi ${safeName},</p>
      <p style="margin:0 0 10px;">This is a reminder that your event is coming up soon.</p>
      <ul style="margin:0 0 14px; padding-left: 18px;">
        <li><strong>Date:</strong> ${eventDate || 'TBA'}</li>
        <li><strong>Location:</strong> ${location || 'TBA'}</li>
      </ul>
      ${ticketUrl ? `<p style="margin:0 0 14px;">View your ticket: <a href="${ticketUrl}">${ticketUrl}</a></p>` : ''}
      <p style="margin:0; color:#475569; font-size: 12px;">If you no longer want event reminders, you can disable them in your profile preferences.</p>
    </div>
  `;
};

const sendEventReminderEmail = async ({ to, firstName, eventTitle, eventDate, location, ticketUrl }) => {
  const html = buildEventReminderHtml({ firstName, eventTitle, eventDate, location, ticketUrl });
  return sendEmail({
    to,
    subject: `Event Reminder: ${eventTitle || 'Upcoming event'}`,
    html,
  });
};

module.exports = { sendEventReminderEmail };
