import {createLogger, format, transports} from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.Console({
      level: 'info',
    }),
  ],
});

export default logger;
