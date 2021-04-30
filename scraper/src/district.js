/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const axios = require('axios');

const axiosRetry = require('axios-retry');
// Exponential back-off retry delay between requests, to handle server issues
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

const { CVC } = require('./cvc')

class District {
  constructor(id, name, state) {
    this.id = id;
    this.name = name;
    this.state = state;
  }

  async getCVCs(date) {
    const url = 'https://api.cowin.gov.in/api/v1/reports/v2/getPublicReports';
    const params = {
      state_id: this.state.id,
      district_id: this.id,
      date: date.toFormat('yyyy-MM-dd')
    }
    const resp = await axios.get(url, { params: params });
    return resp.data.getBeneficiariesGroupBy.map(c => new CVC(c.session_site_id, c.session_site_name, c.today, this, c))
  }

  async getCenters(date) {
    const url = 'https://api.cowin.gov.in/api/v2/appointment/sessions/calendarByDistrict'
    const params = {
      district_id: this.id,
      date: date.toFormat('dd-MM-yyyy')
    }
    let resp;
    try {
      resp = await axios.get(url, { params: params })
    } catch (e) {
      if (e.response.status !== 200) {
        console.log(`Got response ${e.response.status} for ${this.state.name} -> ${this.name}`)
        return []
      }
      throw e;
    }
    const data = resp.data
    return data.centers;
  }
}

module.exports = {
  District
}