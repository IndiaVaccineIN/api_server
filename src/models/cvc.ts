import mongoose, {Schema, Document} from 'mongoose';
import {CenterUpsertRequest} from '../common/schema/composite';

interface Center extends CenterUpsertRequest, Document {
  next_stock_refresh_on?: Date;
  last_verified_at: Date;
  last_verified_by: string;
  google_maps_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const cvcSchema: Schema<Center> = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    cvc: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      //format "YYYY-MM-DD"
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {timestamps: true}
);

cvcSchema.index({state: 1, district: 1, cvc: 1, day: 1}, {unique: true});

cvcSchema.methods.toJSON = function () {
  const cvcDetailsObj = this.toObject();
  delete cvcDetailsObj._id;
  delete cvcDetailsObj.createdAt;
  delete cvcDetailsObj.updatedAt;
  return cvcDetailsObj;
};

const CVCdetails = mongoose.model<Center>('cvc_details', cvcSchema);
export default CVCdetails;
