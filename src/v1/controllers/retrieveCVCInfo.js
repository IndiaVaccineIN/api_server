
const cvcModel = require('../models/cvcDetails');

let getStates = async function(params){
    let findObj = {};
    if(params["day"] !== undefined && params["day"] !== null){
        findObj["day"] = params["day"];
    }
    const statesList = await cvcModel.distinct("state", findObj);
    return statesList;
}

let getDistrictNames = async function(params){
    let findObj = {};
    if(params["state"] !== undefined && params["state"] !== null){
        findObj["state"] = params["state"];
    }
    const districtList = await cvcModel.distinct("district", findObj);
    return districtList;
}

let retrieveData = async function(params){
    let findObj = [];
    if(params["state"] !== undefined && params["state"] !== null){
        findObj.push({"state" : params["state"]});
    }
    if(params["district"] !== undefined && params["district"] !== null){
        findObj.push({"district" : params["district"]});
    }
    let data = [];
    const cursor = cvcModel.find({$and : findObj}).cursor();
    for await (const doc of cursor) {
        console.log(doc);
        data.push(doc);
    }
    return data;
}

exports.getCVCInformation = retrieveData;
exports.getStates = getStates;
exports.getDistrictNames = getDistrictNames;