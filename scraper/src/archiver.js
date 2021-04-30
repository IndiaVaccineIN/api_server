const zlib = require("zlib")
const { getAllStates } = require('./state');
const { getIsroCSVLocations } = require('./isro')
const { DateTime } = require('luxon');
const pMap = require('p-map')
const fs = require('fs');
const path = require('path');
const CONCURRENT_STATES = 2;



async function getFullDump(locations) {
    const tomorrow = DateTime.now().setZone('Asia/Kolkata')
    const today = DateTime.now().setZone('Asia/Kolkata')

    const allStates = await getAllStates();

    let slotsData = {
        date: tomorrow,
        states: {}
    };

    let vaccinationsData = {
        date: today,
        states: {}
    }

    await pMap(allStates, async state => {
        slotsData.states[state.name] = {
            id: state.id,
            name: state.name,
            districts: {}
        }

        vaccinationsData.states[state.name] = { ...slotsData.states[state.name] }

        await pMap(state.districts, async district => {
            const centers = await district.getCenters(tomorrow)
            console.log(`Found ${centers.length} future slot centers in ${state.name} -> ${district.name}`)
            slotsData.states[state.name].districts[district.name] = {
                id: district.id,
                name: district.name,
                centers: centers
            }

            const cvcs = await district.getCVCs(today);
            console.log(`Found ${cvcs.length} current vaccination sites in ${state.name} -> ${district.name}`)
            const augmentedCVCs = await pMap(cvcs, async cvc => {
                const rawData = cvc.rawData;
                if (locations[cvc.name.toLowerCase()]) {
                    rawData.address = locations[cvc.name.toLowerCase()]
                    console.log(`Found local location for ${state.name} -> ${district.name} -> ${cvc.name}`)
                } else {
                    console.log(`Fetching remote location for ${state.name} -> ${district.name} -> ${cvc.name}`)
                    rawData.address = await cvc.getLocation()
                    if (rawData.address) {
                        console.log(`Found remote location for ${state.name} -> ${district.name} -> ${cvc.name}`)
                    } else {
                        console.log(`Did not find remote location for ${state.name} -> ${district.name} -> ${cvc.name}`)

                    }
                }
                return rawData
            }, { concurency: 4 })
            vaccinationsData.states[state.name].districts[district.name] = {
                id: district.id,
                name: district.name,
                cvcs: augmentedCVCs
            }
        }, { concurrency: 4 })
    }, { concurrency: CONCURRENT_STATES })

    return {
        slots: slotsData,
        vaccinations: vaccinationsData
    };
}
async function main() {
    const isroLocations = await getIsroCSVLocations(`${__dirname}/../data/isro.csv`)
    const dump = await getFullDump(isroLocations);
    for (const key of Object.keys(dump)) {
        const filename = path.join(key, DateTime.now().setZone('Asia/Kolkata').toISO() + '.json.gz');
        console.log(`Writing ${filename}`)
        fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(dump[key])));
        console.log(`Written ${filename}`)

    }
}

main()