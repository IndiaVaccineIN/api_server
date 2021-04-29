const reader = require('xlsx');
const moment = require('moment');
const cvcModel = require('../models/cvcDetails');
const logger = require('../../../logger');
const clone = require('clone');
const BULK_SIZE = 2000;
const dayFormat = "YYYY-MM-DD";

interface MongoWriteReq {
    data: any
    keyList?: string[]
    dayList?: string[]
    state?: string
}


export const writeDataToMongo = async function({data, keyList , dayList, state}: MongoWriteReq){
    try {
        let dayKeys = clone(dayList);
        keyList = keyList || ["District", "CVC"];
        let bulkOps: any[] = [], count = 0;
        for (let row of data) {
            dayKeys = dayList || Object.keys(row).filter(key => moment(key, dayFormat, true).isValid());
            let baseDoc:any = {state};
            keyList.forEach(key => baseDoc[key.toLowerCase()] = row[key] || "NA");
            dayKeys.forEach((day: string) => bulkOps.push({
                updateOne: {
                    filter: Object.assign({day}, baseDoc),
                    update: {$set: {value: row[day] || 0}}, upsert: true
                }
            }));
            if(bulkOps.length >= BULK_SIZE) {
                await cvcModel.bulkWrite(bulkOps);
                count += bulkOps.length; bulkOps = [];
            }
        }
        if(bulkOps.length > 0) {
            await cvcModel.bulkWrite(bulkOps);
            count += bulkOps.length;
        }
        logger.info(count + " docs updated/inserted into DB for "+ state);
    } catch (err){
        logger.error({"err_name": "FAILED_TO_STORE for " + state, "err_stk": err.stack});
    }
}

export const dumpExcelDataToMongo = async function(){
    try {
        const file = reader.readFile(__dirname + '../../../data/CVCdata.xlsx');
        const sheets: string[] = file.SheetNames;
        for (let state of sheets) {
            const data: any = reader.utils.sheet_to_json(file.Sheets[state]);
            await writeDataToMongo({data, state});
        }
        logger.info("Data dump finished");
    } catch (err) {
        logger.error({"err_name": "FAILED_TO_STORE", "err_stk": err.stack});
    }
}

exports.writeDataToMongo = writeDataToMongo;
