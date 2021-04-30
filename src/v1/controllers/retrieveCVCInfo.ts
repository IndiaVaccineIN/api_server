import {FilterQuery} from 'mongoose';
import cvcModel, {CVC} from '../models/cvcDetails';

export const getStates = async function (params: FilterQuery<CVC>) {
  const findObj: FilterQuery<CVC> = {};
  if (params['day'] !== undefined && params['day'] !== null) {
    findObj['day'] = params['day'];
  }
  const statesList = await cvcModel.distinct('state', findObj);
  return statesList;
};

export const getDistrictNames = async function (params: FilterQuery<CVC>) {
  const findObj: FilterQuery<CVC> = {};
  if (params['state'] !== undefined && params['state'] !== null) {
    findObj['state'] = params['state'];
  }
  const districtList = await cvcModel.distinct('district', findObj);
  return districtList;
};

export const getCVCInformation = async function (params: FilterQuery<CVC>) {
  const findObj: FilterQuery<CVC> = [];
  if (params['state'] !== undefined && params['state'] !== null) {
    findObj.push({state: params['state']});
  }
  if (params['district'] !== undefined && params['district'] !== null) {
    findObj.push({district: params['district']});
  }
  const data = [];
  // Todo: ask Jatin why the $and was necessary
  const cursor = cvcModel.find(findObj).cursor();
  for await (const doc of cursor) {
    console.log(doc);
    data.push(doc);
  }
  return data;
};
