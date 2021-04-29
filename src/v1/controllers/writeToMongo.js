const reader = require('xlsx');
const moment = require('moment');
const cvcModel = require('../models/cvcDetails');
const logger = require('../../../logger');
const clone = require('clone');
const BULK_SIZE = 2000;
const dayFormat = "YYYY-MM-DD";

let writeDataToMongo = async function({data, keyList, dayList, state}){
    try {
        let dayKeys = clone(dayList);
        keyList = keyList || ["District", "CVC"];
        let bulkOps = [], count = 0;
        for (let row of data) {
            dayKeys = dayList || Object.keys(row).filter(key => moment(key, dayFormat, true).isValid());
            let baseDoc = {state};
            keyList.forEach(key => baseDoc[key.toLowerCase()] = row[key] || "NA");
            dayKeys.forEach(day => bulkOps.push({
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

let dumpExcelDataToMongo = async function(){
    try {
        const file = reader.readFile(__dirname + '../../../data/CVCdata.xlsx');
        const sheets = file.SheetNames;
        for (let state of sheets) {
            const data = reader.utils.sheet_to_json(file.Sheets[state]);
            await writeDataToMongo({data, state});
        }
        logger.info("Data dump finished");
    } catch (err) {
        logger.error({"err_name": "FAILED_TO_STORE", "err_stk": err.stack});
    }
}

exports.writeDataToMongo = writeDataToMongo;
exports.dumpExcelDataToMongo = dumpExcelDataToMongo;
