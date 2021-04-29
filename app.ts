require('dotenv').config()
require('./db/mongoose')
import express, { Application }  from 'express';
const path = require('path');
const cookieParser = require('cookie-parser');


import devAPIs from './src/v1/routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', devAPIs);

export default app;
