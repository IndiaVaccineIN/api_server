import {CenterUpsertRequest} from '../schema/composite';
import cvcModel from '../../models/cvc';
import logger from '../../logger';

export async function upsertCowinCenters(data: Partial<CenterUpsertRequest>[]) {
  console.log(data);
  try {
    const bulkOps = data
      .map(doc => {
        if (!doc.cowin || !doc.cowin.center_id) return null;
        return {
          updateOne: {
            filter: {'state_id': doc.state_id, 'district_id': doc.district_id, 'cowin.center_id': doc.cowin.center_id},
            update: {$set: makeUpsertReq(doc)},
            upsert: true,
          },
        };
      })
      .filter(x => !!x);
    await cvcModel.bulkWrite(bulkOps, {ordered: false});
  } catch (err) {
    logger.error({
      err_name: 'ERROR_UPDATING_COWIN_CENTER_DETAILS',
      err_stack: err.stack,
    });
    throw err;
  }
}

// Only update the fields that are supposed to come from cowin
// This is to ensure that we never end up updating
function makeUpsertReq(
  data: Partial<CenterUpsertRequest>
): Partial<CenterUpsertRequest> {
  const result: Partial<CenterUpsertRequest> = {};
  if (data.sessions) {
    result.sessions = data.sessions;
  }
  if (data.vaccines) {
    result.vaccines = data.vaccines;
  }
  result.state_id = data.state_id;
  result.district_id = data.district_id;
  result.cowin = data.cowin;

  return result;
}
