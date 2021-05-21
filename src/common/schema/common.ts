import {Schema, Document} from 'mongoose';
import {CenterResponseSchema, CowinSession} from '../../common/schema/cowin';
//import uuid from 'node-uuid';

import {
  Vaccine,
  CowinCenter,
  VaccineTypeEnum,
} from '../../common/schema/composite';
//import {DateTime} from 'luxon';

export const sessionSchemaFields: Record<keyof CowinSession, any> = {
  session_id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  available_capacity: Number,
  min_age_limit: Number,
  vaccine: String,
  /** Array of slot names */
  slots: [String],
};

export const vaccineSchemaFields: Record<keyof Vaccine, any> = {
  name: {
    type: String,
    required: true,
  },
  type: {
    type: VaccineTypeEnum,
    required: true,
    default: VaccineTypeEnum.UNKNOWN,
  },
  count: {
    type: Number,
  },
  cost: {
    type: Number,
  },
};

export const CowinCenterSchemaFields: Record<keyof CowinCenter, any> = {
  center_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  name_l: String,
  state_name: {
    type: String,
    required: true,
  },
  state_name_l: String,
  district_name: {
    type: String,
  },
  district_name_l: String,
  block_name: {
    type: String,
    default: '',
  },
  block_name_l: String,
  pincode: {
    type: String,
    default: '',
  },
  lat: Float32Array,
  long: Float32Array,
  from: String,
  to: String,
  fee_type: {
    type: String,
    default: 'Unknown',
  },
  today: Number,
  total: Number,
  // scraped_at: DateTime,
};

// _id: { type: String, default: function genUUID() {
//     uuid.v4()
// }},
