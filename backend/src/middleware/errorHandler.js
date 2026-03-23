const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Avoid noisy stack traces for expected client errors (e.g. 404s).
  // Keep stack traces for server errors where they help debugging.
  if (statusCode >= 500) {
    logger.error(err.stack || String(err));
  } else {
    logger.info(`${req.method} ${req.originalUrl} -> ${statusCode} ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
