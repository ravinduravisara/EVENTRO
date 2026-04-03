const { sendEmail } = require('./emailer');

const escapeHtml = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const buildInvoiceNumber = (bookingId, issuedAt = new Date()) => {
  const year = issuedAt.getFullYear();
  const idPart = String(bookingId || '').slice(-8).toUpperCase();
  return `INV-${year}-${idPart}`;
};

const buildInvoiceEmailHtml = ({
  firstName,
  invoiceNumber,
  issueDate,
  eventTitle,
  eventDate,
  ticketCount,
  unitPrice,
  totalPrice,
}) => {
  const safeName = escapeHtml(firstName || 'there');
  const safeInvoiceNo = escapeHtml(invoiceNumber);
  const safeIssueDate = escapeHtml(issueDate || '');
  const safeEventTitle = escapeHtml(eventTitle || 'Event');
  const safeEventDate = escapeHtml(eventDate || '');
  const safeTicketCount = escapeHtml(ticketCount);
  const safeUnitPrice = escapeHtml(unitPrice);
  const safeTotalPrice = escapeHtml(totalPrice);

  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
    <h2 style="margin: 0 0 12px;">Eventro Payment Invoice</h2>
    <p style="margin: 0 0 12px;">Hi ${safeName},</p>
    <p style="margin: 0 0 12px;">Thank you for your payment. Your invoice has been generated.</p>

    <div style="margin: 12px 0; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc;">
      <div><b>Invoice No:</b> ${safeInvoiceNo}</div>
      <div><b>Issued:</b> ${safeIssueDate}</div>
      <div><b>Event:</b> ${safeEventTitle}</div>
      <div><b>Event Date:</b> ${safeEventDate}</div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">Description</th>
          <th style="text-align: right; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 0;">${safeTicketCount} ticket(s) x Rs. ${safeUnitPrice}</td>
          <td style="padding: 10px 0; text-align: right;">Rs. ${safeTotalPrice}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="border-top: 1px solid #e2e8f0; padding-top: 10px;"><b>Total Paid</b></td>
          <td style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right;"><b>Rs. ${safeTotalPrice}</b></td>
        </tr>
      </tfoot>
    </table>

    <p style="margin: 14px 0 0; font-size: 12px; color: #475569;">Powered by Eventro</p>
  </div>
  `;
};

const sendInvoiceEmail = async ({
  to,
  firstName,
  bookingId,
  issueDate,
  eventTitle,
  eventDate,
  ticketCount,
  unitPrice,
  totalPrice,
}) => {
  const invoiceDate = issueDate ? new Date(issueDate) : new Date();
  const invoiceNumber = buildInvoiceNumber(bookingId, invoiceDate);

  const html = buildInvoiceEmailHtml({
    firstName,
    invoiceNumber,
    issueDate: invoiceDate.toLocaleString(),
    eventTitle,
    eventDate,
    ticketCount,
    unitPrice,
    totalPrice,
  });

  await sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} — ${eventTitle}`,
    html,
  });

  return { invoiceNumber, issuedAt: invoiceDate };
};

const buildRefundInvoiceEmailHtml = ({
  firstName,
  invoiceNumber,
  issueDate,
  eventTitle,
  refundAmount,
}) => {
  const safeName = escapeHtml(firstName || 'there');
  const safeInvoiceNo = escapeHtml(invoiceNumber);
  const safeIssueDate = escapeHtml(issueDate || '');
  const safeEventTitle = escapeHtml(eventTitle || 'Event');
  const safeRefundAmount = escapeHtml(refundAmount);

  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
    <h2 style="margin: 0 0 12px;">Eventro Refund Invoice</h2>
    <p style="margin: 0 0 12px;">Hi ${safeName},</p>
    <p style="margin: 0 0 12px;">Your refund has been approved and processed.</p>

    <div style="margin: 12px 0; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc;">
      <div><b>Refund Invoice No:</b> ${safeInvoiceNo}</div>
      <div><b>Issued:</b> ${safeIssueDate}</div>
      <div><b>Event:</b> ${safeEventTitle}</div>
      <div><b>Refund Amount:</b> Rs. ${safeRefundAmount}</div>
    </div>

    <p style="margin: 14px 0 0; font-size: 12px; color: #475569;">Powered by Eventro</p>
  </div>
  `;
};

const sendRefundInvoiceEmail = async ({
  to,
  firstName,
  bookingId,
  issueDate,
  eventTitle,
  refundAmount,
}) => {
  const invoiceDate = issueDate ? new Date(issueDate) : new Date();
  const invoiceNumber = `RFD-${invoiceDate.getFullYear()}-${String(bookingId || '').slice(-8).toUpperCase()}`;

  const html = buildRefundInvoiceEmailHtml({
    firstName,
    invoiceNumber,
    issueDate: invoiceDate.toLocaleString(),
    eventTitle,
    refundAmount,
  });

  await sendEmail({
    to,
    subject: `Refund Invoice ${invoiceNumber} — ${eventTitle}`,
    html,
  });

  return { invoiceNumber, issuedAt: invoiceDate };
};

module.exports = { sendInvoiceEmail, buildInvoiceNumber, sendRefundInvoiceEmail };