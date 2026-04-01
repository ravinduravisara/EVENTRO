const winston = require('winston');
const fs = require('fs');
const path = require('path');

const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const logDir = path.join(__dirname, '../../logs');

const transports = [new winston.transports.Console()];

if (!isServerless) {
  // File-based logging is only enabled where the filesystem is writable.
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.printf(({ message }) => {
      return message;
    })
  ),
  transports,
});

module.exports = logger;
