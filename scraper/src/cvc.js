/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const axios = require('axios');

const cheerio = require('cheerio');
const axiosRetry = require('axios-retry');
// Exponential back-off retry delay between requests, to handle server issues
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });


class CVC {
  constructor(id, name, today, district, rawData) {
    this.id = id;
    this.name = name;
    this.today = today;
    this.district = district;
    this.rawData = rawData;
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

module.exports = {
  CVC
}