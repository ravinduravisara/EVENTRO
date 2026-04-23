require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

require('./config/passport')(passport);

const app = express();

const corsOptions = {
	origin: (origin, callback) => {
		// Allow non-browser and same-origin server calls.
		if (!origin) return callback(null, true);

		const allowlist = [
			process.env.CLIENT_URL,
			process.env.FRONTEND_URL,
			'http://localhost:3000',
			'http://localhost:5173',
			'https://eventro-pi.vercel.app',
			'https://eventro-yl3p.vercel.app',
		].filter(Boolean);

		const isAllowed = allowlist.includes(origin) || /\.vercel\.app$/i.test(new URL(origin).hostname);
		return callback(null, isAllowed);
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: false,
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

app.get('/', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'EVENTRO backend is running',
		apiBase: '/api',
	});
});

app.get('/api', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'EVENTRO API is running',
	});
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
