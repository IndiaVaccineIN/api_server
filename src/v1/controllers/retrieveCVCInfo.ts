
const cvcModel = require('../models/cvcDetails');

export const getStates = async function(params:any){
    let findObj: any = {};
    if(params["day"] !== undefined && params["day"] !== null){
        findObj["day"] = params["day"];
    }
    const statesList = await cvcModel.distinct("state", findObj);
    return statesList;
}

export const getDistrictNames = async function(params:any){
    let findObj:any = {};
    if(params["state"] !== undefined && params["state"] !== null){
        findObj["state"] = params["state"];
    }
    const districtList = await cvcModel.distinct("district", findObj);
    return districtList;
}

export const getCVCInformation = async function(params:any){
    let findObj:any = [];
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