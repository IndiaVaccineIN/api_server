const zlib = require("zlib")
const { getAllStates } = require('./cvc');
const { DateTime } = require('luxon');
const pMap = require('p-map')
const fs = require('fs');
const path = require('path');

const CONCURRENT_STATES = 2;

async function getFullDump() {
    const tomorrow = DateTime.now().setZone('Asia/Kolkata').plus({ days: 1 })
    const today = DateTime.now().setZone('Asia/Kolkata')

    const allStates = [(await getAllStates())[3]]

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

        vaccinationsData[state.name] = slotsData.states[state.name]

        await pMap(state.districts, async district => {
            const centers = await district.getCenters(tomorrow.toFormat('dd-MM-yyyy'))
            console.log(`Found ${centers.length} future slot centers in ${state.name} -> ${district.name}`)
            slotsData.states[state.name].districts[district.name] = {
                id: district.id,
                name: district.name,
                centers: centers
            }

            const cvcs = await district.getCVCs(today.toFormat('yyyy-MM-dd'));
            console.log(`Found ${cvcs.length} current vaccination sites in ${state.name} -> ${district.name}`)
            vaccinationsData[state.name].districts[district.name] = {
                id: district.id,
                name: district.name,
                cvcs: cvcs.map(c => c.rawData)
            }
        }, { concurrency: 4 })
    }, { concurrency: CONCURRENT_STATES })

    return {
        slots: slotsData,
        vaccinations: vaccinationsData
    };
}
async function main() {
    const dump = await getFullDump();
    for (const key of Object.keys(dump)) {
        const filename = path.join(key, DateTime.now().setZone('Asia/Kolkata').toISO() + '.json.gz');
        console.log(`Writing ${filename}`)
        fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(dump[key])));
        console.log(`Written ${filename}`)

    }
}

main()