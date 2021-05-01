import {Route, Tags, Post, Body} from 'tsoa';
import {
  CVCStatusEnum,
  CVCTypeEnum,
  VaccineTypeEnum,
} from '../../common/schema/composite';
import {CVCRequest, CVCResponseData, PaginatedCVCData} from '../schema/cvc';
import cvcModel, {CenterDetails} from '../../models/cvc';

@Tags('CVC')
@Route('/api/v1/cvc')
export class CVCController {
  @Post('/')
  public async search(@Body() req: CVCRequest): Promise<PaginatedCVCData> {
    const query = this.getQuery(req);
    const limit = req.page_size || 25;
    const skip = ((req.page_number || 1) - 1) * limit;
    const data = await cvcModel.find(query).skip(skip).limit(limit).exec();
    const count = await cvcModel.find(query).count();
    const total = count % limit === 0 ? count / limit : 1 + count / limit;
    return {
      results: this.formatData(data),
      total: total,
      page_number: req.page_number || 1,
      page_size: limit,
    };
  }

  private getQuery(params: CVCRequest) {
    const query = [];
    if (params.district) {
      query.push({'cowin.district_name': params.district});
    } else if (params.pincode) {
      query.push({'cowin.pincode': params.pincode});
    }
    return {$and: query};
  }

  private formatData(data: CenterDetails[]): CVCResponseData[] {
    const result: CVCResponseData[] = [];
    data.forEach(doc => {
      const formattedDoc: CVCResponseData = {
        id: 'test',
        name: doc.cowin.name,
        cowin_center_id: doc.cowin.center_id,
        type: CVCTypeEnum.UNKNOWN,
        address: {
          block: doc.cowin.block_name,
          district: doc.cowin.district_name,
          state: doc.cowin.state_name,
          pincode: doc.cowin.pincode,
        },
        last_verified_at: doc.last_verified_at,
        slots: [
          {
            start_time: doc.cowin.from,
            end_time: doc.cowin.to,
          },
        ],
        operation_timings: {
          start_time: doc.cowin.from,
          end_time: doc.cowin.to,
        },
        vaccine_count: 100,
        status: CVCStatusEnum.UNKNOWN,
        google_maps_url: 'test_url',
        vaccines: [
          {
            name: '',
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
