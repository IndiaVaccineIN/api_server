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
