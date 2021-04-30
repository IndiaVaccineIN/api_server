/**
 * Scrapes dashboard.cowin.gov.in via its API and produces local
 * data files in JSON & CSV, modeled around vaccination sites
 */
const { DateTime } = require('luxon');

const { program } = require('commander');
const pMap = require('p-map')
const CREDS = require('./key.json');

const { getAllStates } = require('./state')

// Puts data in this spreadsheet https://docs.google.com/spreadsheets/d/1NR36K5nBy4rI69qU6dc5MGt2QwwTXZugDnjlWnei3X8/edit#gid=19019745
const SHEET_ID = "1NR36K5nBy4rI69qU6dc5MGt2QwwTXZugDnjlWnei3X8"
const LOCATION_SHEET_ID = "1iC7Ai5mATnPTHuP9eSTEWJ8GLZKLWCh5fdyVRcqblsU"
const EIGHTEEN_SHEET = '1utlRNu58guwjK8sgN9woQClTnCS0O2J8OKD_eey2FTE'

function getDateRange(n) {
  let range = [];
  for (let i = 5; i < 5 + n; i++) {
    range.push(DateTime.now().plus({ day: i }));
  }
  return range;
}


async function updateCVCVaccinesData(states, days) {
  let dates = [];
  for (let i = 1; i < days; i++) {
    dates.push(DateTime.now().minus({ day: i }));
  }
  pMap(states, async state => {
    await state.publishData(SHEET_ID, CREDS, async state => state.getCVCData(dates))
  }, { concurrency: 1 })
}

async function updateCVCLocations(states) {
  pMap(states, async state => {
    await state.publishData(LOCATION_SHEET_ID, CREDS, async state => await state.getCVCLocations())
  }, { concurrency: 4 });
}

async function eighteen(states) {
  for (const state of states) {
    await state.publishData(EIGHTEEN_SHEET, CREDS, async state => await state.getEighteenData())

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

  const allStates = await getAllStates()
  let states = []

  if (opts.allStates) {
    states = allStates;
  } else {
    states = allStates.filter(s => opts.state.indexOf(s.name) !== -1)
  }


  if (opts.scraper === 'locations') {
    await updateCVCLocations(states)
  } else if (opts.scraper === 'vaccinations') {
    await updateCVCVaccinesData(states, 7)
  } else if (opts.scraper == 'eighteen') {
    await eighteen(states)
  }

}

module.exports = {
  getAllStates
}

if (require.main === module) {
  main()
}