const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { runEventReminderJob } = require('./src/scripts/eventReminderJob');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('Server running on port ' + PORT);
  });
<<<<<<< HEAD

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
=======
>>>>>>> parent of a197612 (Event management)
});
