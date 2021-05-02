import dotenv from 'dotenv';
import {createMongoConnections} from './db/mongoose';
import express, {Application} from 'express';
import cookieParser from 'cookie-parser';

import swaggerUi from 'swagger-ui-express';

import devAPIs from './v1/routes';

import cors from 'cors';

dotenv.config();
(async () => {
  await createMongoConnections();
})();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(
  cors({
    origin: '*',
  })
);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/swagger.json',
    },
  })
);
const healthRouter = express.Router();
const groot = (req: any, res: any) => {
  res.send('I am groot');
};
healthRouter.get('/healthz', groot);
healthRouter.get('/', groot);
healthRouter.get('/health', groot);

app.use('/api/v1', devAPIs);
app.use('/', healthRouter);
export default app;
