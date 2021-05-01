import {
  CVCStatusEnum,
  CVCTypeEnum,
  Vaccine,
  VaccineTypeEnum,
} from '../../common/schema/composite';

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
    distance?: SortOrderEnum;
    vaccine_count?: SortOrderEnum;
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
  block: string;
  district: string;
  state: string;
  city?: string;
  pincode: number;
}

export interface CVCOperationTime {
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
export interface CVCResponseData {
  id: string;
  name: string;
  cowin_center_id: string;
  type: CVCTypeEnum;
  address: CVCSiteAddress;
  last_verified_at: Date;
  slots: CVCOperationTime[];
  operation_timings: CVCOperationTime;
  geo?: GeoPoint;
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
  results: CVCResponseData[];
}
