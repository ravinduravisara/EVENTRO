const app = require('../src/app');
const connectDB = require('../src/config/db');

// Ensure database is connected for Vercel serverless
if (!globalThis.dbConnected && !globalThis.dbConnecting) {
	globalThis.dbConnecting = true;
	connectDB().then(() => {
		globalThis.dbConnected = true;
		globalThis.dbConnecting = false;
	}).catch((err) => {
		console.error('Database connection failed:', err);
		globalThis.dbConnectError = err;
		globalThis.dbConnecting = false;
	});
}

// Add middleware to check database connection status
app.use((req, res, next) => {
	if (globalThis.dbConnectError) {
		return res.status(503).json({
			error: 'Database connection unavailable',
			message: 'The service is temporarily unavailable. Please try again later.',
		});
	}
	next();
});

module.exports = app;
