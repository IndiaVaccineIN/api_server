import mongoose, {Document, Schema} from 'mongoose';

export type VaccinationForm = Document;

const vaccinationFormSchema: Schema<VaccinationForm> = new Schema<VaccinationForm>(
  {},
  {strict: false}
);

const VaccinationFormDetails = mongoose.model<VaccinationForm>(
  'vaccination_experience',
  vaccinationFormSchema
);
export default VaccinationFormDetails;
