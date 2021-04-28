/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const axios = require('axios');

const axiosRetry = require('axios-retry');
// Exponential back-off retry delay between requests, to handle server issues
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

const { DateTime } = require('luxon');

const { program } = require('commander');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const pMap = require('p-map')
const CREDS = require('./key.json');

// Puts data in this spreadsheet https://docs.google.com/spreadsheets/d/1NR36K5nBy4rI69qU6dc5MGt2QwwTXZugDnjlWnei3X8/edit#gid=19019745
const SHEET_ID = "1NR36K5nBy4rI69qU6dc5MGt2QwwTXZugDnjlWnei3X8"

const STATE_IDS = [
  { name: "Andaman and Nicobar Islands", id: "1" },
  { name: "Andhra Pradesh", id: "2" },
  { name: "Arunachal Pradesh", id: "3" },
  { name: "Assam", id: "4" },
  { name: "Bihar", id: "5" },
  { name: "Chandigarh", id: "6" },
  { name: "Chhattisgarh", id: "7" },
  { name: "Dadra and Nagar Haveli", id: "8" },
  { name: "Daman and Diu", id: "37" },
  { name: "Delhi", id: "9" },
  { name: "Goa", id: "10" },
  { name: "Gujarat", id: "11" },
  { name: "Haryana", id: "12" },
  { name: "Himachal Pradesh", id: "13" },
  { name: "Jammu and Kashmir", id: "14" },
  { name: "Jharkhand", id: "15" },
  { name: "Karnataka", id: "16" },
  { name: "Kerala", id: "17" },
  { name: "Ladakh", id: "18" },
  { name: "Lakshadweep", id: "19" },
  { name: "Madhya Pradesh", id: "20" },
  { name: "Maharashtra", id: "21" },
  { name: "Manipur", id: "22" },
  { name: "Meghalaya", id: "23" },
  { name: "Mizoram", id: "24" },
  { name: "Nagaland", id: "25" },
  { name: "Odisha", id: "26" },
  { name: "Puducherry", id: "27" },
  { name: "Punjab", id: "28" },
  { name: "Rajasthan", id: "29" },
  { name: "Sikkim", id: "30" },
  { name: "Tamil Nadu", id: "31" },
  { name: "Telangana", id: "32" },
  { name: "Tripura", id: "33" },
  { name: "Uttar Pradesh", id: "34" },
  { name: "Uttarakhand", id: "35" },
  { name: "West Bengal", id: "36" },
];


class State {
  constructor(id, name, districts) {
    this.id = id;
    this.name = name;
    this.districts = districts.map(d => new District(d.district_id, d.district_name, this));
  }

  async getCVCData(dates) {

    const rows = {}
    const header = [
      'District',
      'CVC',
      ...dates
    ]
    await pMap(this.districts, async district => {
      // Make requests for all the dates for each district in parallel
      // FIXME: Throttle this when necessary
      await pMap(dates, async date => {
        console.log(`Processing ${this.name} -> ${district.name} for ${date}`)
        const cvcs = await district.getCVCs(date);
        if (!cvcs) {
          console.log(`No data for ${this.name} -> ${district.name} for ${date}`)
          return
        }
        for (const cvc of cvcs) {
          if (rows[cvc.title] === undefined) {
            rows[cvc.title] = {
              "CVC": cvc.title,
              "District": cvc.district.name
            }
          }
          rows[cvc.title][date] = cvc.today
        }

      }, { concurrency: 7 });
    }, { concurrency: 2 });


    return {
      // Stable sort by District, then CVC to keep the rows consistent and not move around during refreshes
      rows: Object.values(rows).sort((a, b) => `${a.District}-${a.CVC}`.localeCompare(`${b.District}-${b.CVC}`)),
      header: header
    };
  }

  async publishCVCData(sheetId, dates) {
    const response = await this.getCVCData(dates);

    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(CREDS);
    await doc.loadInfo()

    if (doc.sheetsByTitle[this.name] === undefined) {
      await doc.addSheet({ title: this.name })
    }
    let sheet = doc.sheetsByTitle[this.name];
    console.log(`Writing sheet ${this.name}`)
    await sheet.clear()
    await sheet.setHeaderRow(response.header);
    await sheet.addRows(response.rows);
  }

}


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
      date: date
    }
    const resp = await axios.get(url, { params: params });
    return resp.data.getBeneficiariesGroupBy.map(c => new CVC(c.session_id, c.name, c.today, this))
  }
}

class CVC {
  constructor(id, name, today, district) {
    this.id = id;
    this.name = name;
    this.today = today;
    this.district = district;
  }

}

function getDateRange(n) {
  const today = DateTime.now().setZone('Asia/Kolkata');
  let range = [];
  for (let i = 0; i < n; i++) {
    range.push(today.minus({ day: i }).toISODate())
  }
  return range;
}

async function getRawDistricts() {
  const url = 'https://dashboard.cowin.gov.in/assets/json/csvjson.json';
  return (await axios.get(url)).data;
}

async function main() {
  program.option(
    '--state <states...>', 'States to scrape',
  ).option(
    '--all-states', 'Scrape all states'
  ).parse()

  const opts = program.opts();

  const districts = await getRawDistricts()
  const dates = getDateRange(7);

  const allStates = STATE_IDS.map(({ id, name }) => new State(id, name, districts.filter(d => d.state_id == id)))
  let states = []

  if (opts.allStates) {
    states = allStates;
  } else {
    states = allStates.filter(s => opts.state.indexOf(s.name) !== -1)
  }

  pMap(states, async state => {
    await state.publishCVCData(SHEET_ID, dates)
  }, { concurrency: 4 })
}

main()