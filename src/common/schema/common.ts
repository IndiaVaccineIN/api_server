import {Schema, Document} from 'mongoose';
import {CenterResponseSchema, Session} from '../../common/schema/cowin';
import {
  CenterUpsertRequest,
  Vaccine,
  CVCStatusEnum,
  CowinCenter,
  VaccineTypeEnum,
} from '../../common/schema/composite';

const sessionSchemaFields: Record<keyof Session, any> = {
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

const vaccineSchemaFileds: Record<keyof Vaccine, any> = {
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

const CowinCenterSchemaFields: Record<keyof CowinCenter, any> = {
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
    default: 'Unkown',
  },
  today: Number,
  total: Number,
};

const cvcDataStoreSchemaFields: Record<keyof CenterUpsertRequest, any> = {
  status: {
    type: CVCStatusEnum,
    default: CVCStatusEnum.UNKNOWN,
  },
  cowin: {
    type: CowinCenterSchemaFields,
    required: true,
  },
  sessions: {
    type: [sessionSchemaFields],
  },
  vaccines: {
    type: [vaccineSchemaFileds],
  },
  next_stock_refresh_on: Date,
  last_verified_at: Date,
  last_verified_by: String,
  google_maps_url: String,
};
