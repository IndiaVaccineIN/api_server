/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const axios = require('axios');

const { GoogleSpreadsheet } = require('google-spreadsheet')
const axiosRetry = require('axios-retry');
// Exponential back-off retry delay between requests, to handle server issues
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

const { DateTime } = require('luxon');

const pMap = require('p-map')

const { District } = require('./district')


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
      await pMap(cvcs, async cvc => {
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
      ...dates.map(d => d.toFormat('dd-MM-yyyy'))
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
        const readableDate = date.toFormat('dd-MM-yyyy')
        for (const cvc of cvcs) {
          if (rows[cvc.name] === undefined) {
            rows[cvc.name] = {
              "CVC": cvc.name,
              "District": cvc.district.name
            }
          }
          rows[cvc.name][readableDate] = cvc.today
        }

      }, { concurrency: 7 });
    }, { concurrency: 2 });


    console.log(header)
    return {
      // Stable sort by District, then CVC to keep the rows consistent and not move around during refreshes
      rows: Object.values(rows).sort((a, b) => `${a.District}-${a.CVC}`.localeCompare(`${b.District}-${b.CVC}`)),
      header: header
    };
  }

  async getEighteenData() {
    const startDate = DateTime.now().setZone('Asia/Kolkata').plus({ days: 1 })
    console.log(`Starting at ${startDate}`)

    const header = [
      'District',
      'Block Name',
      'Center',
      'PIN'
    ];
    const dates = new Set()

    const rows = {}

    await pMap(this.districts, async district => {
      const centers = await district.getCenters(startDate);
      for (const center of centers) {
        for (const session of center.sessions) {
          if (session.min_age_limit < 45) {
            console.log(`Found ${JSON.stringify(center)} with session ${JSON.stringify(session)}`)
            if (rows[center.center_id] === undefined) {
              rows[center.center_id] = {
                'District': district.name,
                'Block Name': center.block_name,
                'Center': center.name,
                'PIN': center.pincode
              }
            }
            rows[center.center_id][session.date] = session.available_capacity
            dates.add(session.date)
          }
        }
      }
    }, { concurrency: 7 });
    return {
      header: header.concat(Array.from(dates)),
      rows: Object.values(rows).sort((a, b) => `${a.District}-${a['Block Name']}-${a.Center}`.localeCompare(`${b.District}-${b['Block Name']} - ${b.Center}}`)),
    }
  }

  async publishData(sheetId, creds, func) {
    const response = await func(this);

    console.log(`Writing sheet for ${this.name}`)
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo()

    if (doc.sheetsByTitle[this.name] === undefined) {
      await doc.addSheet({ title: this.name })
    }
    let sheet = doc.sheetsByTitle[this.name];
    console.log(`Writing sheet ${this.name} `)
    await sheet.clear()
    await sheet.setHeaderRow(response.header);
    await sheet.addRows(response.rows);
  }

}

async function getAllStates() {
  const url = 'https://api.cowin.gov.in/api/v2/admin/location/states';
  const states = (await axios.get(url)).data.states

  return await pMap(states, async ({ state_id, state_name }) => {
    // FIXME: Ensure id is an int
    const distUrl = `https://api.cowin.gov.in/api/v2/admin/location/districts/${state_id}`;
    return new State(state_id, state_name, (await axios.get(distUrl)).data.districts)
  })
}


module.exports = {
  State,
  getAllStates
}
