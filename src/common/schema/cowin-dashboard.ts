/**
 * Taken from the responses of the cowin dashboard website:
 * - Current: https://api.cowin.gov.in/api/v1/reports/v2/getPublicReports?state_id={cowin_state_id}&district_id={cowin_district_id}&date={yyyy-MM-dd} */

export interface SitesSchema {
  total: number;
  govt: number;
  pvt: number;
  today?: any;
}

export interface SessionsSchema {
  total: number;
  govt: number;
  pvt: number;
  today?: any;
}

export interface RegistrationSchema {
  total?: any;
  male?: any;
  female?: any;
  others?: any;
  today?: any;
}

export interface VaccinationSchema {
  total: number;
  male: number;
  female: number;
  others: number;
  covishield: number;
  covaxin: number;
  today: number;
  tot_dose_1: number;
  tot_dose_2: number;
  total_doses: number;
  aefi: number;
  today_dose_one: number;
  today_dose_two: number;
  today_male: number;
  today_female: number;
  today_others: number;
  today_aefi: number;
}

export interface TopBlockSchema {
  sites: SitesSchema;
  sessions: SessionsSchema;
  registration: RegistrationSchema;
  vaccination: VaccinationSchema;
}

export interface VaccinationDoneByTimeSchema {
  ts: string;
  timestamps: Date;
  label: string;
  count: number;
  dose_one: number;
  dose_two: number;
}

export interface Last7DaysVaccinationSchema {
  vaccine_date: string;
  count: number;
  dose_one: number;
  dose_two: number;
  covishield: number;
  covaxin: number;
  aefi: number;
}

export interface Last5daySessionStatusSchema {
  session_date: string;
  total: string;
  planned: string;
  ongoing: string;
  completed: string;
}

export interface BeneficiariesSchema {
  session_site_id: number;
  title: string;
  session_site_name: string;
  total: number;
  partial_vaccinated: number;
  totally_vaccinated: number;
  today: number;
}

export interface VaccinationByAgeSchema {
  total: number;
  vac_18_30: number;
  vac_30_45: number;
  vac_45_60: number;
  above_60: number;
}

export interface CowinPublicReportsSchema {
  topBlock: TopBlockSchema;
  vaccinationDoneByTime: VaccinationDoneByTimeSchema[];
  last7DaysRegistration: any[];
  last7DaysVaccination: Last7DaysVaccinationSchema[];
  last5daySessionStatus: Last5daySessionStatusSchema[];
  getBeneficiariesGroupBy: BeneficiariesSchema[];
  reportFor: string;
  aefiPercentage: number;
  vaccinationByAge: VaccinationByAgeSchema;
  timestamp: string;
}
