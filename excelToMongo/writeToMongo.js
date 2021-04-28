const reader = require('xlsx');
const moment = require('moment');
const cvcModel = require('../src/v1/models/cvcDetails');
const logger = require('../logger');
const BULK_SIZE = 500;


let readDataAndWriteToMongo = async function(params){
    try {
        const file = reader.readFile(__dirname + '/CVCdata.xlsx');
        const sheets = file.SheetNames;
        let data = [];
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
                    console.log(keyList);
                }
                let baseDoc = {};
                for(let key of keyList) baseDoc[key.toLowerCase()] = res[key] || "NA";
                for(let key of dayList){
                    data.push(Object.assign({day: key, value: res[key] || 0}, baseDoc));
                }
                if(data.length >= BULK_SIZE){
                    //write bulk to mongo
                    await cvcModel.insertMany(data);
                    data = [];
                }
            }
        }
        logger.info("Data dump finished");
    } catch (err) {
        logger.error({"err_name": "FAILED_TO_STORE", "err_stk": err.stack});
    }
}

exports.writeToMongo = readDataAndWriteToMongo;
