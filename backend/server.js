const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { runEventReminderJob } = require('./src/scripts/eventReminderJob');

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler for Vercel
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown');
      process.exit(1);
    }, 30000);
  }
};

let server;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    logger.info('Server running on port ' + PORT);
  });

  // Automated event reminders (default ON). Set EVENT_REMINDERS_ENABLED=false to disable.
  const remindersEnabled = String(process.env.EVENT_REMINDERS_ENABLED || 'true').toLowerCase() !== 'false';
  if (remindersEnabled) {
    // Run once shortly after startup, then every 10 minutes.
    setTimeout(() => {
      runEventReminderJob().catch((err) => logger.error(`Event reminder job failed: ${err.message}`));
    }, 15 * 1000);

    setInterval(() => {
      runEventReminderJob().catch((err) => logger.error(`Event reminder job failed: ${err.message}`));
    }, 10 * 60 * 1000);
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Retrying in 2 seconds...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT);
      }, 2000);
    } else {
      throw err;
    }
  });

  // Graceful shutdown handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});

module.exports = app; // Export for Vercel
