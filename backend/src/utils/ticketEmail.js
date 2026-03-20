const { sendEmail } = require('./emailer');

const escapeHtml = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const buildTicketEmailHtml = ({
  firstName,
  eventTitle,
  eventDate,
  ticketCount,
  totalPrice,
  qrCodeDataUrl,
  ticketUrl,
}) => {
  const safeName = escapeHtml(firstName || 'there');
  const safeTitle = escapeHtml(eventTitle || 'Your Event');
  const safeDate = escapeHtml(eventDate || '');
  const safeCount = escapeHtml(ticketCount);
  const safePrice = escapeHtml(totalPrice);
  const safeUrl = escapeHtml(ticketUrl);

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
    <h2 style="margin: 0 0 12px;">Your Eventro E‑Ticket</h2>
    <p style="margin: 0 0 12px;">Hi ${safeName},</p>
    <p style="margin: 0 0 12px;">Your booking is confirmed for <b>${safeTitle}</b>.</p>
    <div style="margin: 12px 0; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc;">
      <div><b>Date:</b> ${safeDate}</div>
      <div><b>Tickets:</b> ${safeCount}</div>
      <div><b>Total:</b> Rs. ${safePrice}</div>
    </div>
    <p style="margin: 0 0 12px;">Show this QR code at the entrance (one‑time use):</p>
    <div style="margin: 12px 0; text-align: center;">
      <img alt="QR Ticket" src="${qrCodeDataUrl}" style="width: 220px; height: 220px; border: 1px solid #e2e8f0; border-radius: 12px;" />
    </div>
    <p style="margin: 0 0 8px;">If your email client can’t display the QR image, open your ticket here:</p>
    <p style="margin: 0 0 12px;"><a href="${safeUrl}">${safeUrl}</a></p>
    <p style="margin: 0; color: #475569; font-size: 12px;">Powered by Eventro</p>
  </div>
  `;
};

const sendTicketEmail = async ({
  to,
  firstName,
  eventTitle,
  eventDate,
  ticketCount,
  totalPrice,
  qrCodeDataUrl,
  ticketUrl,
}) => {
  const html = buildTicketEmailHtml({
    firstName,
    eventTitle,
    eventDate,
    ticketCount,
    totalPrice,
    qrCodeDataUrl,
    ticketUrl,
  });

  return sendEmail({
    to,
    subject: `Your Eventro Ticket — ${eventTitle}`,
    html,
  });
};

module.exports = { sendTicketEmail };
