const axios = require("axios").default;
const _ = require("lodash");
const moment = require("moment");
const jsonWriter = require("jsonfile");
const path = require("path");
const CsvWriter = require("./lib/csv-writer");
const makeDir = require("./lib/make-dir");
const jsonDataDir = path.resolve(__dirname, "data-raw", "json");
const csvDataDir = path.resolve(__dirname, "data-raw", "csv");
const zipDataDir = path.resolve(__dirname, "data-zip");

(async () => {
  try {
    await makeDir(jsonDataDir);
    await makeDir(csvDataDir);
    await makeDir(zipDataDir);
  } catch (error) {
    console.error(error);
    console.error("Could not create data directories. Exiting ....");
    process.exit(1);
  }
})();

// State information scraped from cowin dashboard
/// TODO: dynamically get the state list from the api
var states = [
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

// hashing the ids to quickly map through them when we get
// district info from the api later
var stateMap = states.reduce((acc, cur) => {
  acc[cur.id] = cur.name;
  return acc;
}, {});

const cowinApi = {
  district: {
    uri: "https://dashboard.cowin.gov.in/assets/json/csvjson.json",
  },
  report: {
    uri: "https://api.cowin.gov.in/api/v1/reports/v2/getPublicReports",
    params: { state: "state_id", district: "district_id", date: "date" },
  },
};

/// TODO
async function extractStates(data) {}

/**
 * Get top level state data from cowin api.
 * @param {object} api - an object with uri and param details of cowin api.
 * @param {date} date - date for data retrieval.
 * @return {object} response JSON from the api.
 */
async function getAllStates(api, date) {
  let allStateReportParams = {};
  // build the query string for report uri
  allStateReportParams[_.get(api, "report.params.state")] = "";
  allStateReportParams[_.get(api, "report.params.district")] = "";
  allStateReportParams[_.get(api, "report.params.date")] = date;

  try {
    return await getReportData(
      api.report.uri,
      allStateReportParams,
      path.resolve(
        jsonDataDir,
        `allStatesReport_${date}_${new Date().getTime()}.json`
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Wrapper function to call the cowin report api.
 * @param {string} uri - cowin report api uri.
 * @param {string} params - parameters needed to build api url.
 * @param {string} jsonFilePath - optional file path where the raw json response will be stored.
 * @return {object} response JSON from the api.
 */
async function getReportData(uri, params, jsonFilePath) {
  let apiResponse = await axios.get(uri, {
    params: params,
  });

  // write raw response back to file
  if (jsonFilePath && apiResponse.data) {
    await jsonWriter.writeFile(jsonFilePath, apiResponse.data);
  }
  return apiResponse.data;
}

/**
 * Get district level data from cowin api.
 * @param {object} api - an object with uri and param details of cowin api.
 * @param {string} stateId - id of state to be queried.
 * @param {string} districtId - id of district to be queried.
 * @param {date} date - date for data retrieval.
 * @return {object} response JSON from the api.
 */
async function getDistrictReport(api, stateId, districtId, date) {
  let districtReportParams = {};
  districtReportParams[_.get(api, "report.params.state")] = stateId;
  districtReportParams[_.get(api, "report.params.district")] = districtId;
  districtReportParams[_.get(api, "report.params.date")] = date;

  try {
    return await getReportData(
      api.report.uri,
      districtReportParams,
      path.resolve(
        jsonDataDir,
        `districtReport_sid-${stateId}_did-${districtId}_${date}_${new Date().getTime()}.json`
      )
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

async function writeToCsv(data, filePath) {
  let csvWriter = new CsvWriter(filePath);

  await csvWriter.writeRows(data);
  csvWriter.close();
}

// Main
(async () => {
  // get state and district mappings
  const districtResponse = await axios.get(cowinApi.district.uri);

  // extract
  /// TODO: add validation for response data
  let districts = districtResponse.data.map((d) => {
    d.state_name = stateMap[d.state_id];
    return d;
  });

  // sort districts by state for better data output order
  districts = _.sortBy(districts, ["state_id"]);

  // uses current date for now
  // can be made a configuration value later
  const today = moment().format("YYYY-M-DD");

  // get state level data
  const allStatesData = await getAllStates(cowinApi, today);

  // extract cvc information from the response and save as a csv
  await writeToCsv(
    allStatesData.getBeneficiariesGroupBy,
    path.resolve(
      csvDataDir,
      `allStatesReport_${today}_${new Date().getTime()}.csv`
    )
  );

  // initialize a csv writer for adding a aggregated version of district data
  let allDistrictsCsvWriter = new CsvWriter(
    path.resolve(
      csvDataDir,
      `allDistrictsReport_${today}_${new Date().getTime()}.csv`
    )
  );

  // iterate through the list of districts
  for (let index = 0; index < districts.length; index++) {
    const district = districts[index];
    console.log(
      `[${new Date().toDateString()}] Getting report for ${
        district.district_name
      }, ${district.state_name}`
    );

    try {
      // for each district get data from the api
      const districtReport = await getDistrictReport(
        cowinApi,
        district.state_id,
        district.district_id,
        today
      );
      // init a csv writer to save district wise csv
      let districtCsvWriter = new CsvWriter(
        path.resolve(
          csvDataDir,
          `districtReport_sid-${district.state_id}_did-${
            district.district_id
          }_${today}_${new Date().getTime()}.csv`
        )
      );

      // extract cvc data
      let cvcs = districtReport.getBeneficiariesGroupBy;

      // augment cvc data with state and district names
      // write data back to aggregated as well as specific csv
      for (let i = 0; i < cvcs.length; i++) {
        const cvc = cvcs[i];
        cvc["state_id"] = district.state_id;
        cvc["state_name"] = district.state_name;
        cvc["district_id"] = district.district_id;
        cvc["district_name"] = district.district_name;
        await districtCsvWriter.write(cvc);
        await allDistrictsCsvWriter.write(cvc);
      }

      districtCsvWriter.close();
    } catch (error) {
      console.error(
        `[${new Date().toDateString()}]  Could not get report for ${
          district.district_name
        }, ${district.state_name}`,
        error
      );
    }
  }
})();
