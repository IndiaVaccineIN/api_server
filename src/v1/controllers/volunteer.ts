import {Body, Post, Route, Tags} from 'tsoa';
import {
  CVCStatusEnum,
  CVCTypeEnum,
  Vaccine,
} from '../../common/schema/composite';
import {CVCOperationTime, CVCSiteAddress} from '../schema/cvc';

export interface CallRequest {
  pincode?: number;
  cvc_site_id?: string;
  /**
   * if set tp true, will lock the cvc for 20 minutes
   */
  claim?: boolean;
}

export enum CallResponseEnum {
  RESPONDED = 'RESPONDED',
  NOT_RESPONDED = 'NOT_RESPONDED',
  WRONG_NUMBER = 'WRONG_NUMBER',
}

export interface ReportRequest {
  cvc_site_id?: string;
  call_response?: CallResponseEnum;
  status?: CVCStatusEnum;
  cvcType?: CVCTypeEnum;
  vaccines?: Vaccine[];
  address?: CVCSiteAddress;
  operation_timings?: CVCOperationTime[];
  next_stock_refresh_on?: Date;
  verification_time?: Date;
}

@Tags('Volunteer')
@Route('/api/v1/volunteer')
export class VolunteerController {
  @Post('/call_request')
  public async callRequest(@Body() req: CallRequest) {
    console.log(req);
  }
  @Post('/report')
  public async report(@Body() req: ReportRequest) {
    console.log(req);
  }
}
