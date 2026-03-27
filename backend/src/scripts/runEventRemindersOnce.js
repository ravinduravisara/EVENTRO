require('dotenv').config();

const connectDB = require('../config/db');
const logger = require('../utils/logger');
const { runEventReminderJob } = require('./eventReminderJob');

const main = async () => {
  await connectDB();
  await runEventReminderJob();
  logger.info('Event reminder job completed');
  process.exit(0);
};

main().catch((err) => {
  logger.error(`Event reminder run-once failed: ${err.message}`);
  process.exit(1);
});
