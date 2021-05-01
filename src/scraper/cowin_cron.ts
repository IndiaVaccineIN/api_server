// This file gets run with npm run cowin_cron

import {District} from './cowin/district';

import {Districts} from '../common/data/districts';
import {States} from '../common/data/states';
import {State} from '../common/schema/cowin';
import {DateTime} from 'luxon';
import {
  CenterUpsertRequest,
  CowinCenter,
  CVCStatusEnum,
  Vaccine,
  VaccineTypeEnum,
} from '../common/schema/composite';
import {upsertCowinCenters} from '../common/utils/cvc';

const states: {[id: string]: State} = {};
States.map(s => {
  states[s.state_id] = s;
});
(async () => {
  for (const d of Districts) {
    const batch: CenterUpsertRequest[] = [];
    const dist = new District(
      d.district_id,
      d.district_name,
      states[d.district_id]
    );
    const resp = await dist.getCenters(DateTime.now().setZone('Asia/Kolkata'));
    for (const s of resp) {
      const cowin: CowinCenter = {
        center_id: s.center_id,
        name: s.name,
        state_name: s.state_name,
        district_name: s.district_name,
        block_name: s.block_name,
        pincode: s.pincode,
        from: s.from,
        to: s.to,
        fee_type: s.fee_type,
        // Todo: pull fromother db
        today: 0,
        total: 0,
      };
      const vaccines: Vaccine[] = [];
      if (s.vaccine_fees) {
        for (const v_fees of s.vaccine_fees) {
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
          const v: Vaccine = {
            name: v_fees.vaccine.toLowerCase(),
            type: v_type,
            //Todo: add sum
            count: 0,
            cost: fee,
          };

          vaccines.push(v);
        }
      }

      const center: CenterUpsertRequest = {
        status: CVCStatusEnum.UNKNOWN,
        cowin: cowin,
        sessions: s.sessions,
        vaccines: vaccines,
      };
      batch.push(center);
    }
    await upsertCowinCenters(batch);
  }
})();
