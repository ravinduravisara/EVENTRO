const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Prefer IPv4 results first (helps when IPv6/DNS causes intermittent Atlas connectivity on some networks).
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (_) {
  // ignore
}

// DNS servers used for SRV/TXT lookups (mongodb+srv).
// Default to Google DNS (matches previous behavior), but allow overriding or disabling.
// - MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4 (custom)
// - MONGO_DNS_SERVERS=system (do not override)
try {
  const raw = process.env.MONGO_DNS_SERVERS;
  const override = raw == null ? '8.8.8.8,8.8.4.4' : String(raw).trim();
  const disabled = ['system', 'false', '0', 'off', ''].includes(override.toLowerCase());
  if (!disabled) {
    dns.setServers(
      override
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
} catch (_) {
  // ignore
}

let isConnecting = false;

const formatMongoErrorHint = (error) => {
  const message = String(error?.message || 'Unknown error');
  const code = error?.code;

  if (code === 'ENOTFOUND') {
    return 'Hint: DNS lookup failed. If this keeps happening, try switching networks/DNS or use an Atlas “Standard connection string” (non +srv) to avoid SRV DNS lookups.';
  }

  if (/whitelist|ip.*(allowed|access)|Atlas cluster's IP whitelist/i.test(message)) {
    return "Hint: Your current public IP likely changed. In Atlas go to Network Access and add your current IP (or temporarily allow 0.0.0.0/0 for dev).";
  }

  if (/Authentication failed|bad auth|auth/i.test(message)) {
    return 'Hint: Check username/password in MONGO_URI and ensure the DB user has access to the target database.';
  }

  return null;
};

const connectOnce = async (mongoUri) => {
  // These defaults avoid long hangs and help reconnect quickly.
  const options = {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
    family: 4,
    // MongoDB driver ultimately opens TCP sockets; by default it relies on OS DNS (dns.lookup).
    // On some Windows networks this can intermittently fail (ENOTFOUND). Using resolve4 here
    // routes through Node's c-ares resolver which honors dns.setServers() above.
    lookup: (hostname, lookupOptions, callback) => {
      const cb = typeof lookupOptions === 'function' ? lookupOptions : callback;
      const opts = typeof lookupOptions === 'object' && lookupOptions !== null ? lookupOptions : {};

      dns.resolve4(hostname, (err, addresses) => {
        if (!err && Array.isArray(addresses) && addresses.length > 0) {
          return cb(null, addresses[0], 4);
        }
        return dns.lookup(hostname, { ...opts, family: 4 }, cb);
      });
    },
  };

  await mongoose.connect(mongoUri, options);
};

const connectDB = async () => {
  const mongoUri = String(process.env.MONGO_URI || '').trim();
  if (!mongoUri) {
    logger.error('Database connection error: MONGO_URI is not set');
    process.exit(1);
  }

  // Default behavior:
  // - dev/test: retry indefinitely (prevents nodemon crash loops on flaky networks)
  // - production: fail fast unless explicitly enabled
  // On Vercel, always enable retries (serverless environment)
  const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
  const retryEnabled =
    String(process.env.MONGO_CONNECT_RETRY || (process.env.NODE_ENV !== 'production') || isVercel).toLowerCase() === 'true';
  const maxRetries = Number(process.env.MONGO_CONNECT_MAX_RETRIES || 0); // 0 = infinite
  const baseDelayMs = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS || 1000);
  const maxDelayMs = Number(process.env.MONGO_CONNECT_RETRY_MAX_DELAY_MS || 30000);

  if (isConnecting) return;
  isConnecting = true;

  let attempt = 0;
  try {
    while (true) {
      attempt += 1;
      try {
        await connectOnce(mongoUri);
        logger.info('MongoDB Connected');
        return;
      } catch (error) {
        const hint = formatMongoErrorHint(error);
        const hintText = hint ? `\n${hint}` : '';
        logger.error(`Database connection error: ${error.message}${hintText}`);

        if (!retryEnabled) {
          // On Vercel serverless, don't exit - let the function handle it
          if (!isVercel) {
            process.exit(1);
          }
          throw error;
        }

        if (maxRetries > 0 && attempt >= maxRetries) {
          logger.error(`Database connection error: exceeded max retries (${maxRetries}). Exiting.`);
          if (!isVercel) {
            process.exit(1);
          }
          throw error;
        }

        // Exponential backoff with a sane cap.
        const exp = Math.min(attempt - 1, 6);
        const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** exp);
        logger.info(`Retrying MongoDB connection in ${Math.round(delay / 1000)}s (attempt ${attempt + 1})...`);
        await sleep(delay);
      }
    }
  } finally {
    isConnecting = false;
  }
};

// Log lifecycle events; useful when connectivity drops after a successful start.
mongoose.connection.on('disconnected', () => {
  logger.error('MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;
