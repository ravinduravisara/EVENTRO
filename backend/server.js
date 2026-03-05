const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info('Server running on port ' + PORT);
  });

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
});
