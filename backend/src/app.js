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

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
