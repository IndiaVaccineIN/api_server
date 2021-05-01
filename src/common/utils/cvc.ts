import {CenterUpsertRequest} from '../schema/composite';
import cvcModel from '../../models/cvc';
import logger from '../../logger';

export async function upsertCowinCenters(data: CenterUpsertRequest[]) {
  try {
    const bulkOps = data.map(doc => {
      return {
        updateOne: {
          filter: {'cowin.center_id': doc.cowin.center_id},
          update: {$set: doc},
          upsert: true,
        },
      };
    });
    await cvcModel.bulkWrite(bulkOps, {ordered: false});
  } catch (err) {
    logger.error({
      err_name: 'ERROR_UPDATING_COWIN_CENTER_DETAILS',
      err_stack: err.stack,
    });
    throw err;
  }
}
