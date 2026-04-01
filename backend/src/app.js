require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

require('./config/passport')(passport);

const app = express();

app.use(cors());
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
