import {Route, Tags, Post, Body} from 'tsoa';

export enum VaccineTypeEnum {
  COVAXIN = 'COVAXIN',
  COVISHIELD = 'COVISHIELD',
}

export enum CVCStatusEnum {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface CVCRequest {
  /**
   * Name of the district.
   * Either this or pincode is required
   */
  district?: string;
  /**
   * Pincode to search with.
   * Either this or district is required
   */
  pincode?: number;
  /**
   * @default 1
   */
  page_number?: number;
  /**
   * @default 25
   */
  page_size?: number;
  sort?: {
    distance: SortOrderEnum;
  };
  filter?: {
    vaccines?: VaccineTypeEnum[];
    /**
     * @default 30
     */
    radius?: number;
    status?: CVCStatusEnum[];
    /**
     * @default true
     */
    availability?: boolean;
  };
}

export interface CVCSiteAddress {
  locality: string;
  district: string;
  state: string;
  city: string;
  pincode: number;
}

export interface CVCOperationShift {
  shift: number;
  /**
   * Format: HH:MM
   */
  start_time: string;
  /**
   * Format: HH:MM
   */
  end_time: string;
}

export interface GeoPoint {
  latitude: string;
  longitude: string;
}
export interface Vaccine {
  name: string;
  type: VaccineTypeEnum;
  count: number;
  cost: number;
}
export enum CVCTypeEnum {
  CENTRAL = 'CENTRAL',
  STATE = 'STATE',
  PRIVATE = 'PRIVATE',
}
export interface CVCData {
  name: string;
  cvc_site_id: string;
  type: CVCTypeEnum;
  address: CVCSiteAddress;
  last_verified_at: Date;
  operation_timings: CVCOperationShift[];
  geo: GeoPoint;
  vaccine_count: number;
  status: CVCStatusEnum;
  next_stock_refresh_on?: Date;
  google_maps_url: string;
  vaccines: Vaccine[];
}
export interface PaginatedCVCData {
  total: number;
  page_number: number;
  page_size: number;
  results: CVCData[];
}

@Tags('CVC')
@Route('/api/v1/cvc')
export class CVCController {
  @Post('/')
  public async search(@Body() req: CVCRequest): Promise<PaginatedCVCData> {
    return {
      results: [
        {
          name: 'cvc name',
          cvc_site_id: 'cvc id',
          type: CVCTypeEnum.CENTRAL,
          address: {
            locality: 'locality to which cvc belong',
            district: req.district || 'district to which cvc belong',
            state: 'state to which cvc belongs',
            city: 'city to which cvc belongs',
            pincode: 560078,
          },
          last_verified_at: new Date(), // default "null"
          operation_timings: [
            {
              shift: 1,
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
