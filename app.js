require('dotenv').config()
require('./db/mongoose')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const devAPIs = require('./src/v1/routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', devAPIs);

module.exports = app;
