const reader = require('xlsx');
const moment = require('moment');
const cvcModel = require('../src/v1/models/cvcDetails');
const logger = require('../logger');
const BULK_SIZE = 2000;

let readDataAndWriteToMongo = async function(params){
    try {
        const file = reader.readFile(__dirname + '/CVCdata.xlsx');
        const sheets = file.SheetNames;
        let bulkOps = [];
        let count = 0;
        for (let i = 0; i < sheets.length; i++) {
            const stream = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
            let keyList = ["state", "District", "CVC"];
            let dayList = [];
            for(let res of stream) {
                res["state"] = sheets[i];
                if(dayList.length === 0){
                    for(let key in res){
                        if(moment(key, 'YYYY-MM-DD', true).isValid()) dayList.push(key);
                        //else keyList.push(key);
                    }
                }
                let baseDoc = {};
                for(let key of keyList) baseDoc[key.toLowerCase()] = res[key] || "NA";
                for(let key of dayList){
                    bulkOps.push({
                        updateOne:{
                            filter: Object.assign({day: key}, baseDoc),
                            update: {$set: {value: res[key] || 0}},
                            upsert: true
                        }
                    });
                }
                if(bulkOps.length >= BULK_SIZE){
                    count += bulkOps.length;
                    //write bulk to mongo
                    await cvcModel.bulkWrite(bulkOps);
                    bulkOps = [];
                }
            }
        }
        if(bulkOps.length > 0){
            count += bulkOps.length;
            //write the remaining bulk to mongo
            await cvcModel.bulkWrite(bulkOps);
        }
        logger.info("Data dump finished " + count);
    } catch (err) {
        logger.error({"err_name": "FAILED_TO_STORE", "err_stk": err.stack});
    }
}

exports.writeToMongo = readDataAndWriteToMongo;
