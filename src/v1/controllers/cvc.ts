import {Body, Post, Route, Tags} from 'tsoa';
import {
  CVCTypeEnum,
  Vaccine,
  VaccineTypeEnum,
} from '../../common/schema/composite';
import {
  CVCRequest,
  CVCResponseData,
  CVCSiteAddress,
  PaginatedCVCData,
} from '../schema/cvc';
import cvcModel, {CenterDetails} from '../../models/cvc';
import {FilterQuery} from 'mongoose';
import {CowinSession} from '../../common/schema/cowin';

@Tags('CVC')
@Route('/api/v1/cvc')
export class CVCController {
  @Post('/')
  public async search(@Body() req: CVCRequest): Promise<PaginatedCVCData> {
    console.log(req);
    const query = this.getQuery(req);
    const limit = req.page_size || 25;
    const skip = ((req.page_number || 1) - 1) * limit;
    console.log(query);
    const data = await cvcModel
      .find(query)
      .sort([['updatedAt', -1]])
      .skip(skip)
      .limit(limit)
      .exec();
    const count = await cvcModel.find(query).count();
    const total =
      count % limit === 0
        ? Math.floor(count / limit)
        : 1 + Math.floor(count / limit);
    return {
      results: this.formatData(data),
      total: total,
      page_number: req.page_number || 1,
      page_size: limit,
    };
  }

  private getQuery(params: CVCRequest) {
    const query: FilterQuery<Object> = {};
    if (params.district_id) {
      query['district_id'] = params.district_id;
    } else if (params.district) {
      query['cowin.district_name'] = params.district;
    } else if (params.pincode) {
      query['cowin.pincode'] = params.pincode;
    }

    //TODO see if multiple calls to get midnight time can be reduced
    //TODO read cron frequency and first cron run time of day from somewhere
    //instead of using static values
    //Currently setting this frequency as 30mins and first run time of day
    //as midnight
    const lastCronUpdateTime = this.getLastCronUpdateTime(1800000, 0);

    query['updatedAt'] = {$gt: lastCronUpdateTime};
    return query;
  }

  private getLastCronUpdateTime(
    cronFrequencyInMs: number,
    firstTimeOfDayInMsWhenCronRuns: number
  ) {
    const currentTimeOfDayInMs = this.getCurrentTimeOfDayInMs();

    const timeDurationInMsSinceFirstCronRun =
      currentTimeOfDayInMs - firstTimeOfDayInMsWhenCronRuns;

    if (timeDurationInMsSinceFirstCronRun >= 0) {
      const remainder = timeDurationInMsSinceFirstCronRun % cronFrequencyInMs;

      return this.getLastMidnight() + currentTimeOfDayInMs - remainder;
    }

    const midnightTime = this.getLastMidnight();
    const firstCronRunTime = midnightTime + firstTimeOfDayInMsWhenCronRuns;

    return firstCronRunTime - cronFrequencyInMs;
  }

  private getCurrentTimeOfDayInMs() {
    const midnightTime = this.getLastMidnight();
    const currentTime = new Date().getTime();

    return currentTime - midnightTime;
  }

  private getLastMidnight() {
    const currentTime = new Date();

    currentTime.setHours(0, 0, 0, 0);

    console.log('currentTime: ' + currentTime);

    return currentTime.getTime();
  }

  private formatData(data: CenterDetails[]): CVCResponseData[] {
    const result: CVCResponseData[] = [];
    data.forEach(doc => {
      if (!doc.cowin || !doc.cowin.name || !doc.cowin.center_id) {
        return;
      }

      const vaccines: Vaccine[] = doc.vaccines.map(x => ({
        name: x.name || '',
        type: x.type || VaccineTypeEnum.UNKNOWN,
        count: x.count || 0,
        cost: x.cost || 0,
      }));

      const sessions: CowinSession[] = doc.sessions.map(x => ({
        session_id: x.session_id || '',
        date: x.date || '',
        available_capacity: x.available_capacity || 0,
        min_age_limit: x.min_age_limit || 0,
        vaccine: x.vaccine || '',
        slots: x.slots || [''],
      }));

      const address: CVCSiteAddress = {
        block: doc.cowin.block_name || '',
        district: doc.cowin.district_name || '',
        state: doc.cowin.state_name || '',
        pincode: doc.cowin.pincode || '',
      };
      const formattedDoc: CVCResponseData = {
        id: doc._id,
        name: doc.cowin.name,
        cowin_center_id: doc.cowin.center_id,
        type: CVCTypeEnum.UNKNOWN,
        address: address,
        last_verified_at: doc.last_verified_at,
        slots: [
          {
            start_time: doc.cowin.from || '',
            end_time: doc.cowin.to || '',
          },
        ],
        operation_timings: {
          start_time: doc.cowin.from || '',
          end_time: doc.cowin.to || '',
        },
        vaccine_count: -1,
        status: doc.status,
        google_maps_url: '',
        vaccines: vaccines,
        sessions: sessions,
      };
      result.push(formattedDoc);
    });
    return result;
  }
}
