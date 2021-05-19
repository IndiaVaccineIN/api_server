import mongoose, {Schema, Document} from 'mongoose';
import {CenterUpsertRequest, CVCStatusEnum} from '../common/schema/composite';
import {
  vaccineSchemaFields,
  sessionSchemaFields,
  CowinCenterSchemaFields,
} from '../common/schema/common';

interface Center extends CenterUpsertRequest {
  next_stock_refresh_on?: Date;
  last_verified_at: Date;
  last_verified_by: string;
  google_maps_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const cvcDataStoreSchemaFields: Record<keyof Center, any> = {
  state_id: {
    type: Number,
    required: true,
  },
  district_id: {
    type: Number,
    required: true,
  },
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
    type: [vaccineSchemaFields],
  },
  next_stock_refresh_on: Date,
  last_verified_at: Date,
  last_verified_by: Date,
  google_maps_url: String,
  createdAt: Date,
  updatedAt: Date,
};

export interface CenterDetails extends Center, Document {}

const cvcSchema: Schema<CenterDetails> = new Schema(cvcDataStoreSchemaFields, {
  timestamps: true,
});
cvcSchema.index(
  {state_id: 1, district_id: 1, 'cowin.center_id': 1},
  {unique: true}
);
cvcSchema.index({district_id: 1}, {background: true});
cvcSchema.index({'cowin.district_name': 1}, {background: true});
cvcSchema.index({'cowin.pincode': 1}, {background: true});
cvcSchema.index({updatedAt: -1}, {background: true});
// Todo: Add more indexes for search

cvcSchema.methods.toJSON = function () {
  const cvcDetailsObj = this.toObject();
  delete cvcDetailsObj._id;
  delete cvcDetailsObj.createdAt;
  delete cvcDetailsObj.updatedAt;
  return cvcDetailsObj;
};

const CVCdetails = mongoose.model<CenterDetails>('cvc', cvcSchema);
export default CVCdetails;
