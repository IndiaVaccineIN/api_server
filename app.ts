import dotenv from 'dotenv';
import {createMongoConnections} from './db/mongoose';
import express, { Application }  from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

import swaggerUi from "swagger-ui-express";

import devAPIs from './src/v1/routes';


dotenv.config();
(async ()=>{await createMongoConnections()})();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/swagger.json",
      },
    })
);


app.use('/api/v1', devAPIs);

export default app;
