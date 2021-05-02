import {DateTime} from 'luxon';
import {SessionCalendarEntrySchema, State} from '../../common/schema/cowin';
import {
  CowinPublicReportsSchema,
  BeneficiariesSchema,
} from '../../common/schema/cowin-dashboard';
import axios from 'axios';
import axiosRetry from 'axios-retry';

/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */

// Exponential back-off retry delay between requests, to handle server issues
axiosRetry(axios, {retryDelay: axiosRetry.exponentialDelay});

//const {CVC} = require('./cvc');

export class District {
  id: number;
  name: string;
  state: State;
  constructor(id: number, name: string, state: State) {
    this.id = id;
    this.name = name;
    this.state = state;
  }

  // Uncomment when importing dashboard data as well
  async getCVCs(date: DateTime): Promise<BeneficiariesSchema[]> {
    const url = 'https://api.cowin.gov.in/api/v1/reports/v2/getPublicReports';
    const params = {
      state_id: this.state.state_id,
      district_id: this.id,
      date: date.toFormat('yyyy-MM-dd'),
    };
    let resp;
    try {
      resp = await axios.get(url, {params: params});
    } catch (e) {
      if (e.response.status !== 200) {
        console.log(
          `Got response $ {e.response.status}for ${this.state.state_name} -> ${this.name}`
        );
        return [];
      }
      throw e;
    }

    const data = (resp.data as unknown) as CowinPublicReportsSchema;
    return data.getBeneficiariesGroupBy;
  }

  async getCenters(date: DateTime): Promise<SessionCalendarEntrySchema[]> {
    const url =
      'https://api.cowin.gov.in/api/v2/appointment/sessions/public/calendarByDistrict';
    const params = {
      district_id: this.id,
      date: date.toFormat('dd-MM-yyyy'),
    };
    let resp;
    try {
      resp = await axios.get(url, {params: params});
    } catch (e) {
      if (e.response.status !== 200) {
        console.log(
          `Got response ${e.response.status} for ${this.state.state_name} -> ${this.name}`
        );
        return [];
      }
      throw e;
    }
    const data = resp.data;
    console.log(data.centers);
    return data.centers;
  }
}
