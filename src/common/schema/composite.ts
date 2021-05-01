import {CenterResponseSchema, Session} from './cowin';

export interface Vaccine {
  name: string;
  type: VaccineTypeEnum;
  count: number;
  cost: number;
}

export enum VaccineTypeEnum {
  UNKNOWN = 'UNKNOWN',
  COVAXIN = 'COVAXIN',
  COVISHIELD = 'COVISHIELD',
}

export enum CVCStatusEnum {
  UNKNOWN = 'UNKNOWN',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface CowinCenter extends CenterResponseSchema {
  today: number;
  total: number;
}

export enum CVCTypeEnum {
  UNKNOWN = 'UNKNOWN',
  CENTRAL = 'CENTRAL',
  STATE = 'STATE',
  PRIVATE = 'PRIVATE',
}

export interface CenterUpsertRequest {
  status: CVCStatusEnum;
  cowin: CowinCenter;
  sessions: Session[];
  vaccines: Vaccine[];
}
