const https = require('https');
const querystring = require('querystring');
const logger = require('./logger');

const hasWhatsAppConfig = () =>
  Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);

const sendWhatsAppMessage = async ({ to, body }) => {
  if (!to) return;
  if (!hasWhatsAppConfig()) {
    logger.info('WhatsApp not configured; skipping send');
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // format: whatsapp:+1415...

  const postData = querystring.stringify({
    From: from,
    To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    Body: body,
  });

  const options = {
    hostname: 'api.twilio.com',
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: 'POST',
    auth: `${accountSid}:${authToken}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve();
        logger.error(`Twilio WhatsApp send failed (${res.statusCode}): ${data}`);
        return reject(new Error('WhatsApp send failed'));
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

const sendTicketWhatsApp = async ({ to, eventTitle, eventDate, ticketCount, ticketUrl }) => {
  if (!to) return;
  const body = `Eventro Ticket Confirmed\n\nEvent: ${eventTitle}\nDate: ${eventDate}\nTickets: ${ticketCount}\n\nOpen your QR ticket: ${ticketUrl}`;
  return sendWhatsAppMessage({ to, body });
};

module.exports = { sendWhatsAppMessage, sendTicketWhatsApp, hasWhatsAppConfig };
