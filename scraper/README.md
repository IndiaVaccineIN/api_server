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
npm run
```

This should run the script and save outputs to the data folder. 

```
npm clean-csv
npm clean-json
```

Cleans the data directory deleting all data files that the script creates

## Data files

- ./data/json : raw responses from the api 
- ./data/csv : cvc information extracted and formatted as csv files 

### File name structure 

Json files 
- State level report : allStatesReport_{date provided for scraping}_{time stamp of scrape}.json
- District level report : districtReport_sid-{state id}_did-{distirct id}_{date provided for scraping}_{time stamp of scrape}.json

CSV files
- State level report : allStatesReport_{date provided for scraping}_{time stamp of scrape}.csv
- District level report : districtReport_sid-{state id}_did-{distirct id}_{date provided for scraping}_{time stamp of scrape}.csv
- District level aggregated report : allDistrictsReport_{date provided for scraping}_{time stamp of scrape}.csv