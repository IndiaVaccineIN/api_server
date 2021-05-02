// This file gets run with npm run cowin_cron
import _ from 'lodash';
import {District} from './cowin/district';

import {Districts} from '../common/data/districts';
import {States} from '../common/data/states';
import {SessionCalendarEntrySchema, State} from '../common/schema/cowin';
import {DateTime} from 'luxon';
import {
  CenterUpsertRequest,
  CowinCenter,
  CVCStatusEnum,
  Vaccine,
  VaccineTypeEnum,
} from '../common/schema/composite';
import {upsertCowinCenters} from '../common/utils/cvc';
import {createMongoConnections} from '../db/mongoose';
import dotenv from 'dotenv';
import {exit} from 'node:process';
import logger from '../logger';
import {BeneficiariesSchema} from '../common/schema/cowin-dashboard';

dotenv.config();
// build a map of states
const states: {[id: string]: State} = {};
States.map(s => {
  states[s.state_id] = s;
});

function buildVaccine(_centre: SessionCalendarEntrySchema) {
  const vaccines: Partial<Vaccine>[] = [];
  if (_centre.vaccine_fees) {
    for (const v_fees of _centre.vaccine_fees) {
      let v_type: VaccineTypeEnum = VaccineTypeEnum.UNKNOWN;
      switch (v_fees.vaccine) {
        case VaccineTypeEnum.COVISHIELD:
          v_type = VaccineTypeEnum.COVISHIELD;
          break;
        case VaccineTypeEnum.COVAXIN:
          v_type = VaccineTypeEnum.COVAXIN;
          break;
      }
      let fee = -1;
      try {
        fee = parseFloat(v_fees.fee);
      } catch (e) {
        console.error(e);
      }
      const v: Partial<Vaccine> = {
        name: v_fees.vaccine.toLowerCase(),
        type: v_type,
        //Todo: add sum
        //count: 0,
        cost: fee,
      };

      vaccines.push(v);
    }
  }
  return vaccines;
}

function buildCowinCenter(
  _centre: SessionCalendarEntrySchema,
  _cvc: BeneficiariesSchema
): CowinCenter {
  return {
    center_id: _centre.center_id.toString(), // FIXME: Joel should probably be kept as number instead of string
    name: _centre.name,
    state_name: _centre.state_name,
    district_name: _centre.district_name,
    block_name: _centre.block_name,
    pincode: _centre.pincode,
    from: _centre.from,
    to: _centre.to,
    fee_type: _centre.fee_type,
    today: _cvc ? _cvc.today : 0,
    // FIXME: Joel : this can have problems that it will overwrite a previous total
    // with 0 if a CVC match was not found from the dashboard data set
    total: _cvc ? _cvc.total : 0,
  };
}

// main function
(async () => {
  for (const d of Districts) {
    const batch: Partial<CenterUpsertRequest>[] = [];
    const dist = new District(
      d.district_id,
      d.district_name,
      states[d.state_id]
    );
    const centerResp = await dist.getCenters(
      DateTime.now().setZone('Asia/Kolkata')
    );
    const cvcResp = await dist.getCVCs(DateTime.now().setZone('Asia/Kolkata'));

    // build a map of cvcs keys by id to quickly lookup cvcs
    // use it to enrich today and total counts of vaccinations at center
    const cvcMap = _.keyBy(cvcResp, cvc => {
      return cvc.session_site_id.toString();
    });
    for (const _centre of centerResp) {
      const _cvc = cvcMap[_centre.center_id];
      logger.debug(
        `Could not map center ${_centre.center_id}: ${_centre.name}, ${_centre.district_name}, ${_centre.state_name}`
      );

      const cowin: Partial<CowinCenter> = buildCowinCenter(_centre, _cvc);
      const vaccines: Partial<Vaccine>[] = buildVaccine(_centre);

      const center: Partial<CenterUpsertRequest> = {
        state_id: d.state_id,
        district_id: d.district_id,
        status: CVCStatusEnum.UNKNOWN,
        cowin: cowin,
        sessions: _centre.sessions,
        vaccines: vaccines,
      };
      logger.debug(`Built ${cowin.center_id} : ${cowin.state_name} : ${
        cowin.district_name
      } :
      ${cowin.name} ${JSON.stringify(center)}`);

      batch.push(center);
    }
    await upsertCowinCenters(batch);
  }
})();
