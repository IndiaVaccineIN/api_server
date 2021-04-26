# Covid Vaccination Center (CVC) Scraper
A quick script to scrape  https://dashboard.cowin.gov.in/ and extract state wise Covid Vaccination Center info

## Project setup
Requirements:

- Node.js 14+

```
npm install
```

## Usage

```
npm start
```

This should run the script and save output to the data folder. 

```
npm full-cycle
```

This does a bunch of things
- cleans the raw data folder
- runs the script and scrapping
- zips up the current run to the data-zip folder

```
npm clean-csv
npm clean-json
```

Cleans the data directory deleting all data files that the script creates

## Data files

- ./data-raw/json : raw responses from the api 
- ./data-raw/csv : cvc information extracted and formatted as csv files 
- ./data-zip : stores compressed copies of a scrapping run (zips the ./data-raw folder after a full run)

### File name structure 

Json files 
- State level report : allStatesReport_{date provided for scraping}_{time stamp of scrape}.json
- District level report : districtReport_sid-{state id}_did-{distirct id}_{date provided for scraping}_{time stamp of scrape}.json

CSV files
- State level report : allStatesReport_{date provided for scraping}_{time stamp of scrape}.csv
- District level report : districtReport_sid-{state id}_did-{distirct id}_{date provided for scraping}_{time stamp of scrape}.csv
- District level aggregated report : allDistrictsReport_{date provided for scraping}_{time stamp of scrape}.csv