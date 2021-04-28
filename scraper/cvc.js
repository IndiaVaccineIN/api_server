/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const axios = require('axios');

const cheerio = require('cheerio');
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
const LOCATION_SHEET_ID = "1iC7Ai5mATnPTHuP9eSTEWJ8GLZKLWCh5fdyVRcqblsU"

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

  async getCVCLocations() {
    const rows = []
    const header = [
      'District',
      'CVC ID',
      'CVC',
      'Address',
      'Pin Code',
      'Lattitude',
      'Longitude'
    ]
    await pMap(this.districts, async district => {
      console.log(`Processing ${this.name} -> ${district.name}`)
      const cvcs = await district.getCVCs(DateTime.now().minus({ day: 1 }));
      pMap(cvcs, async cvc => {
        const location = await cvc.getLocation();
        console.log(`Processing ${this.name} -> ${district.name} -> ${cvc.name}`)
        let row = {
          'District': district.name,
          'CVC': cvc.name,
          'CVC ID': cvc.id
        }
        if (location) {
          rows.push({
            'Address': location.address,
            'Pin Code': location.pinCode,
            'Lattitude': location.lat,
            'Longitude': location.lon,
            ...row
          })
        } else {
          rows.push(row)
        }
      }, { concurrency: 8 });
    }, { concurrency: 2 });


    return {
      // Stable sort by District, then CVC to keep the rows consistent and not move around during refreshes
      rows: Object.values(rows).sort((a, b) => `${a.District}-${a.CVC}`.localeCompare(`${b.District}-${b.CVC}`)),
      header: header
    };
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
        console.log(`Processing ${this.name} -> ${district.name}`)
        const cvcs = await district.getCVCs(date);
        if (!cvcs) {
          console.log(`No data for ${this.name} -> ${district.name}`)
          return
        }
        for (const cvc of cvcs) {
          if (rows[cvc.name] === undefined) {
            rows[cvc.name] = {
              "CVC": cvc.name,
              "District": cvc.district.name
            }
          }
          rows[cvc.name][date] = cvc.today
        }

      }, { concurrency: 7 });
    }, { concurrency: 2 });


    return {
      // Stable sort by District, then CVC to keep the rows consistent and not move around during refreshes
      rows: Object.values(rows).sort((a, b) => `${a.District}-${a.CVC}`.localeCompare(`${b.District}-${b.CVC}`)),
      header: header
    };
  }

  async publishCVCData(sheetId, func) {
    const response = await func(this);

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
    return resp.data.getBeneficiariesGroupBy.map(c => new CVC(c.session_site_id, c.session_site_name, c.today, this))
  }
}

class CVC {
  constructor(id, name, today, district) {
    this.id = id;
    this.name = name;
    this.today = today;
    this.district = district;
  }

  async getGeoCoords() {
    const url = 'https://bhuvan-app3.nrsc.gov.in/vaccine/usrtask/app_specific/get/getnameDetails.php'
    const params = {
      q: this.name
    }

    // We extract out the onclick JS, which looks like this:
    // remove_find_center();addpostpopup("Goa Medical College Bambolim",403202),zoom_to_centre(73.8584024998755,15.4643262998189,7),addmarker(15.4643262998189,73.8584024998755)
    // This regex then extracts pin, lon and lat (in order) from it 
    // Caveats - sometimes PIN is set to 0
    const EXTRACTOR_REGEX = /addpostpopup\(".*",(\d+)\).*zoom_to_centre\(([0-9.]+),([0-9.]+),\d\)/;
    const resp = await axios.get(url, { params: params })

    const $ = cheerio.load(resp.data);
    const nameJS = $('tr > td').first().attr('onclick')

    if (nameJS) {
      const match = nameJS.match(EXTRACTOR_REGEX);
      if (match) {
        return {
          pinCode: match[1],
          lon: match[2],
          lat: match[3]
        }
      } else {
        console.log("could not match!");
        console.log(nameJS)
      }
    }

    return null;

  }
  async getLocation() {
    const url = 'https://bhuvan-app3.nrsc.gov.in/vaccine/usrtask/app_specific/get/getPublicDetails.php'
    const geo = await this.getGeoCoords();
    if (geo === null) {
      return null;
    }
    const params = {
      sno: this.name,
      pincode: geo.pinCode
    }
    const resp = await axios.get(url, { params: params })
    const $ = cheerio.load(resp.data)

    const $trs = $('table tr');
    let data = {};
    $trs.each((_, tr) => {
      const $tr = $(tr);
      const key = $tr.children('td').first().text()
      const value = $tr.children('td').last().text()
      data[key] = value;
    })

    if (data['Address']) {
      return { 'address': data['Address'], ...geo }
    } else {
      return geo
    }
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

async function updateCVCVaccinesData(states, dates) {
  pMap(states, async state => {
    await state.publishCVCData(SHEET_ID, async state => state.getCVCData(dates))
  }, { concurrency: 1 })
}

async function updateCVCLocations(states) {
  for (const state of states) {
    await state.publishCVCData(LOCATION_SHEET_ID, async state => await state.getCVCLocations())
  }
}

async function main() {
  program.option(
    '--state <states...>', 'States to scrape',
  ).option(
    '--all-states', 'Scrape all states'
  ).option(
    // One of 'locations' or 'vaccinations'
    // FIXME: THIS SHOULD BE a .command() instead
    '--scraper <scraper>', 'Action to perform'
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


  if (opts.scraper === 'locations') {
    await updateCVCLocations(states)
  } else if (opts.scraper === 'vaccinations') {
    await updateCVCVaccinesData(states, dates)
  }

  // return;
}

main()