const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getTicketSecret = () => process.env.TICKET_JWT_SECRET || process.env.JWT_SECRET;

const createTicketToken = ({ bookingId, eventId, expiresAt }) => {
  const secret = getTicketSecret();
  if (!secret) {
    const error = new Error('Ticket token secret not configured');
    error.statusCode = 500;
    throw error;
  }

  const jti = crypto.randomBytes(16).toString('hex');

  const payload = {
    typ: 'eventro_ticket',
    bid: String(bookingId),
    eid: String(eventId),
    jti,
  };

  const options = {};
  if (expiresAt instanceof Date) {
    options.expiresIn = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  } else if (process.env.TICKET_JWT_EXPIRES_IN) {
    options.expiresIn = process.env.TICKET_JWT_EXPIRES_IN;
  }

  const token = jwt.sign(payload, secret, options);
  return { token, jti };
};

const verifyTicketToken = (token) => {
  const secret = getTicketSecret();
  if (!secret) {
    const error = new Error('Ticket token secret not configured');
    error.statusCode = 500;
    throw error;
  }

  return jwt.verify(token, secret);
};

module.exports = { createTicketToken, verifyTicketToken };
