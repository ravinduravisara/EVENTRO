const Booking = require('../../models/Booking');
const Event = require('../../models/Event');
const User = require('../../models/User');
const { sendEmail } = require('../../utils/emailer');

const normalizeMessage = (message) =>
  String(message || '')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br/>');

const buildCampaignEmailHtml = ({ campaignName, message, eventTitle }) => {
  const safeMessage = normalizeMessage(message);
  return `
    <div style="font-family: Segoe UI, Tahoma, Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #111827; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 20px;">Eventro Campaign</h2>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #111827;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Campaign</p>
        <h3 style="margin: 0 0 12px; font-size: 22px;">${campaignName}</h3>
        ${eventTitle ? `<p style="margin: 0 0 16px; color: #374151; font-size: 14px;">Event: <strong>${eventTitle}</strong></p>` : ''}
        <div style="line-height: 1.7; font-size: 15px; color: #1f2937;">${safeMessage || 'No message content provided.'}</div>
      </div>
    </div>
  `;
};

const resolveRecipients = async ({ eventId }) => {
  if (!eventId) {
    const users = await User.find({ isEmailVerified: true }).select('email').lean();
    return users
      .map((user) => user.email)
      .filter(Boolean);
  }

  const event = await Event.findById(eventId).select('title').lean();
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingUserIds = await Booking.find({
    event: eventId,
    status: { $in: ['confirmed', 'used'] },
  }).distinct('user');

  if (!bookingUserIds.length) {
    return { emails: [], eventTitle: event.title };
  }

  const users = await User.find({
    _id: { $in: bookingUserIds },
    isEmailVerified: true,
  })
    .select('email')
    .lean();

  return {
    emails: users
      .map((user) => user.email)
      .filter(Boolean),
    eventTitle: event.title,
  };
};

const sendCampaign = async ({ name, eventId, message }) => {
  const campaignName = String(name || '').trim();
  const campaignMessage = String(message || '').trim();

  if (!campaignName) {
    const error = new Error('Campaign name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!campaignMessage) {
    const error = new Error('Campaign message is required');
    error.statusCode = 400;
    throw error;
  }

  const recipientResult = await resolveRecipients({ eventId });
  const emails = Array.isArray(recipientResult)
    ? recipientResult
    : recipientResult.emails;
  const eventTitle = Array.isArray(recipientResult)
    ? ''
    : recipientResult.eventTitle || '';

  const uniqueEmails = [...new Set(emails.map((email) => String(email).toLowerCase()))];

  if (!uniqueEmails.length) {
    const error = new Error('No verified recipients found for this campaign');
    error.statusCode = 400;
    throw error;
  }

  const subject = eventTitle
    ? `[Eventro] ${campaignName} - ${eventTitle}`
    : `[Eventro] ${campaignName}`;
  const html = buildCampaignEmailHtml({
    campaignName,
    message: campaignMessage,
    eventTitle,
  });

  const sendResults = await Promise.allSettled(
    uniqueEmails.map((email) =>
      sendEmail({
        to: email,
        subject,
        html,
      })
    )
  );

  const sent = sendResults.filter((result) => result.status === 'fulfilled').length;
  const failed = sendResults.length - sent;

  return {
    campaignName,
    eventTitle,
    totalRecipients: uniqueEmails.length,
    sent,
    failed,
  };
};

module.exports = { sendCampaign };
