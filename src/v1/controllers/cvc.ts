import {Route, Tags, Post, Body} from 'tsoa';
import {
  CVCStatusEnum,
  CVCTypeEnum,
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
    const data = await cvcModel.find(query).skip(skip).limit(limit).exec();
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
    const query: FilterQuery<CenterDetails> = {};
    if (params.district_id) {
      query['district_id'] = params.district_id;
    } else if (params.district) {
      query['cowin.district_name'] = params.district;
    } else if (params.pincode) {
      query['cowin.pincode'] = params.pincode;
    }
    return query;
  }

  private formatData(data: CenterDetails[]): CVCResponseData[] {
    const result: CVCResponseData[] = [];
    data.forEach(doc => {
      if (!doc.cowin || !doc.cowin.name || !doc.cowin.center_id) {
        return;
      }
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
        vaccines: [
          {
            name: 'DUMMY',
            type: VaccineTypeEnum.UNKNOWN,
            count: 0,
            cost: 0,
          },
        ],
      };
      result.push(formattedDoc);
    });
    return result;
  }
}
