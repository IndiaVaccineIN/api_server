/**
 * If you've taken up the task to update this schema, follow these steps:
 * - Get the link to the latest swagger/openapi definition file
 * - Current: https://apisetu.gov.in/public/api/cowin
 * - Yaml: https://apisetu.gov.in/api_specification_v10/cowin-public-v2.yaml
 * - Then run  npx openapi-typescript https://apisetu.gov.in/api_specification_v10/cowin-public-v2.yaml --output temp.ts
 * - You'll probably need to make minor edits in code of that package to make it work (content-type header was missing)
 * - Copy paste relevant schema from temp.ts and make edits
 *
 * It's not completely automated way to do things, but it beats copy pasta the schema by hand
 * Note: There's a good chance that data in mongo looks a lot like this schema.
 * Make sure you migrate old data over to this format.
 */

export interface State {
  state_id: number;
  state_name: string;
}

export interface District {
  state_id: number;
  district_id: number;
  district_name: string;
}

export interface Districts {
  districts: District[];
}

export interface CenterResponseSchema {
  center_id: number;
  name: string;
  /** Name in preferred language as specified in Accept-Language header parameter. */
  name_l?: string;
  address?: string;
  /** Address line in preferred language as specified in Accept-Language header parameter. */
  address_l?: string;
  state_name: string;
  /** State name in preferred language as specified in Accept-Language header parameter. */
  state_name_l?: string;
  district_name: string;
  /** District name in preferred language as specified in Accept-Language header parameter. */
  district_name_l?: string;
  block_name: string;
  /** Block name in preferred language as specified in Accept-Language header parameter. */
  block_name_l?: string;
  pincode: string;
  lat?: number;
  long?: number;
  from: string;
  to: string;
  /** Fee charged for vaccination */
  fee_type: 'Free' | 'Paid';
}

export interface SessionResponseSchema extends CenterResponseSchema {
  fee: string;
  session_id: string;
  date: string;
  /** Total available capacity of the session. */
  available_capacity: number;
  /** Available capacity for dose 1. */
  available_capacity_dose1?: number;
  /** Available capacity for dose 2. */
  available_capacity_dose2?: number;
  min_age_limit: number;
  vaccine: string;
  /** Array of slot names */
  slots: string[];
}

export interface SessionCalendarEntrySchema {
  center_id: number;
  name: string;
  /** Name in preferred language as specified in Accept-Language header parameter. */
  name_l?: string;
  address?: string;
  /** Address line in preferred language as specified in Accept-Language header parameter. */
  address_l?: string;
  state_name: string;
  /** State name in preferred language as specified in Accept-Language header parameter. */
  state_name_l?: string;
  district_name: string;
  /** District name in preferred language as specified in Accept-Language header parameter. */
  district_name_l?: string;
  block_name: string;
  /** Block name in preferred language as specified in Accept-Language header parameter. */
  block_name_l?: string;
  pincode: string;
  lat?: number;
  long?: number;
  from: string;
  to: string;
  /** Fee charged for vaccination */
  fee_type: 'Free' | 'Paid';
  vaccine_fees?: VaccineFeeSchema[];
  sessions: CowinSession[];
}

export interface CowinSession {
  session_id: string;
  date: string;
  /** Total available capacity of the session. */
  available_capacity: number;
  /** Available capacity for dose 1. */
  available_capacity_dose1?: number;
  /** Available capacity for dose 2. */
  available_capacity_dose2?: number;
  min_age_limit: number;
  vaccine: string;
  /** Array of slot names */
  slots: string[];
}

export interface VaccineFeeSchema {
  vaccine: string;
  fee: string;
}
