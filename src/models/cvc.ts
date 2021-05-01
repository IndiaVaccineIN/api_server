import mongoose, {Schema, Document} from 'mongoose';
import {CenterUpsertRequest, CVCStatusEnum} from '../common/schema/composite';
import {
  vaccineSchemaFileds,
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
  last_verified_by: Date,
  google_maps_url: String,
  createdAt: Date,
  updatedAt: Date,
};

export interface CenterDetails extends Center, Document {}

const cvcSchema: Schema<CenterDetails> = new Schema(cvcDataStoreSchemaFields);

cvcSchema.methods.toJSON = function () {
  const cvcDetailsObj = this.toObject();
  delete cvcDetailsObj._id;
  delete cvcDetailsObj.createdAt;
  delete cvcDetailsObj.updatedAt;
  return cvcDetailsObj;
};

const CVCdetails = mongoose.model<CenterDetails>('cvc_details', cvcSchema);
export default CVCdetails;
