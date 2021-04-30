import reader from 'xlsx';
import moment from 'moment';
import cvcModel from '../models/cvcDetails';
import logger from '../../logger';
import clone from 'clone';
const BULK_SIZE = 2000;
const dayFormat = 'YYYY-MM-DD';

interface MongoWriteReq {
  data: any[];
  keyList?: string[];
  dayList?: string[];
  state?: string;
}

export const writeDataToMongo = async function ({
  data,
  keyList,
  dayList,
  state,
}: MongoWriteReq) {
  try {
    let dayKeys = clone(dayList);
    keyList = keyList || ['District', 'CVC'];
    let bulkOps: unknown[] = [],
      count = 0;
    for (const row of data) {
      dayKeys =
        dayList ||
        Object.keys(row).filter(key => moment(key, dayFormat, true).isValid());
      const baseDoc: any = {state};
      keyList.forEach(key => (baseDoc[key.toLowerCase()] = row[key] || 'NA'));
      dayKeys.forEach((day: string) =>
        bulkOps.push({
          updateOne: {
            filter: Object.assign({day}, baseDoc),
            update: {$set: {value: row[day] || 0}},
            upsert: true,
          },
        })
      );
      if (bulkOps.length >= BULK_SIZE) {
        await cvcModel.bulkWrite(bulkOps);
        count += bulkOps.length;
        bulkOps = [];
      }
    }
    if (bulkOps.length > 0) {
      await cvcModel.bulkWrite(bulkOps);
      count += bulkOps.length;
    }
    logger.info(count + ' docs updated/inserted into DB for ' + state);
  } catch (err) {
    logger.error({
      err_name: 'FAILED_TO_STORE for ' + state,
      err_stk: err.stack,
    });
  }
};

export const dumpExcelDataToMongo = async function () {
  try {
    const file = reader.readFile(__dirname + '/../../../data/CVCdata.xlsx');
    const sheets: string[] = file.SheetNames;
    for (const state of sheets) {
      logger.info({state});
      const data: any = reader.utils.sheet_to_json(file.Sheets[state]);
      await writeDataToMongo({data, state});
    }
    logger.info('Data dump finished');
  } catch (err) {
    logger.error({err_name: 'FAILED_TO_STORE', err_stk: err.stack});
  }
};
