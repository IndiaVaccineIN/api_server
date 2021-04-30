import dotenv from 'dotenv';
import {createMongoConnections} from './db/mongoose';
import express, { Application }  from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

import devAPIs from './src/v1/routes';


dotenv.config();
(async ()=>{await createMongoConnections()})();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', devAPIs);

export default app;
