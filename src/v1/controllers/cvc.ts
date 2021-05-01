import {Route, Tags, Post, Body} from 'tsoa';
import {CVCTypeEnum} from '../../common/schema/composite';
import {CVCRequest, PaginatedCVCData} from '../schema/cvc';

@Tags('CVC')
@Route('/api/v1/cvc')
export class CVCController {
  @Post('/')
  public async search(@Body() req: CVCRequest): Promise<PaginatedCVCData> {
    return {
      results: [
        {
          id: 'uuid',
          name: 'cvc name',
          cowin_center_id: 'cvc id',
          type: CVCTypeEnum.CENTRAL,
          address: {
            block: 'locality to which cvc belong',
            district: req.district || 'district to which cvc belong',
            state: 'state to which cvc belongs',
            city: 'city to which cvc belongs',
            pincode: 560078,
          },
          last_verified_at: new Date(), // default "null"
          operation_timings: {
            start_time: 'HH-MM',
            end_time: 'HH-MM',
          },
          slots: [
            {
              start_time: 'HH-MM',
              end_time: 'HH-MM',
            },
          ],
          //future scope
          geo: {
            latitude: 'latitude location',
            longitude: 'longitude location',
          },
          vaccine_count: 150,
          status: CVCStatusEnum.ACTIVE,
          next_stock_refresh_on: new Date(),
          google_maps_url: 'url for google location',
          vaccines: [
            {
              name: 'covaxin',
              type: VaccineTypeEnum.COVAXIN,
              count: 130,
              cost: 250,
            },
          ],
        },
      ],
      total: 130, // number of CVC matching the criteria,
      page_number: 1,
      page_size: 20,
    };
  }
}
