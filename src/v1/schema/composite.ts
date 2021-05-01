import {
  CenterResponseSchema,
  Session,
  SessionCalendarEntrySchema,
  VaccineFeeSchema,
} from './cowin';
import {CVCStatusEnum, Vaccine} from './cvc';

interface CowinCenter extends CenterResponseSchema {
  today: number;
  total: number;
}

interface CenterUpsertRequest {
  status: CVCStatusEnum;
  cowin: CowinCenter;
  sessions: Session[];
  vaccines: Vaccine[];
  next_stock_refresh_on?: Date;
  last_verified_at: Date;
  last_verified_by: string;
  google_maps_url: string;
}

interface Center extends CenterUpsertRequest {
  id: string;
}

function upsertData(data: CenterUpsertRequest[]) {}
