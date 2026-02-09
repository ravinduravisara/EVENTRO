require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

require('./config/passport')(passport);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
