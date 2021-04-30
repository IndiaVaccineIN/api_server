const zlib = require("zlib");
const { getAllStates } = require("./state");
const { getIsroCSVLocations } = require("./isro");
const { DateTime } = require("luxon");
const { transform } = require("../lib/transformer");
const pMap = require("p-map");
const fs = require("fs");
const path = require("path");
const CONCURRENT_STATES = 2;
const AWS = require("aws-sdk");

async function publishS3(bucketName, key, body) {
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
  };
  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getFullDump(locations) {
  const tomorrow = DateTime.now().setZone("Asia/Kolkata");
  const today = DateTime.now().setZone("Asia/Kolkata");

  const allStates = await getAllStates();

  let slotsData = {
    date: tomorrow,
    states: {},
  };

  let vaccinationsData = {
    date: today,
    states: {},
  };

  await pMap(
    allStates,
    async (state) => {
      slotsData.states[state.name] = {
        id: state.id,
        name: state.name,
        districts: {},
      };

      vaccinationsData.states[state.name] = { ...slotsData.states[state.name] };

      await pMap(
        state.districts,
        async (district) => {
          const centers = await district.getCenters(tomorrow);
          console.log(
            `Found ${centers.length} future slot centers in ${state.name} -> ${district.name}`
          );
          slotsData.states[state.name].districts[district.name] = {
            id: district.id,
            name: district.name,
            centers: centers,
          };

          const cvcs = await district.getCVCs(today);
          console.log(
            `Found ${cvcs.length} current vaccination sites in ${state.name} -> ${district.name}`
          );
          const augmentedCVCs = await pMap(
            cvcs,
            async (cvc) => {
              const rawData = cvc.rawData;
              if (locations[cvc.name.toLowerCase()]) {
                rawData.address = locations[cvc.name.toLowerCase()];
                console.log(
                  `Found local location for ${state.name} -> ${district.name} -> ${cvc.name}`
                );
              } else {
                console.log(
                  `Did not find location for ${state.name} -> ${district.name} -> ${cvc.name}`
                );
              }
              return rawData;
            },
            { concurency: 4 }
          );
          vaccinationsData.states[state.name].districts[district.name] = {
            id: district.id,
            name: district.name,
            cvcs: augmentedCVCs,
          };
        },
        { concurrency: 4 }
      );
    },
    { concurrency: CONCURRENT_STATES }
  );

  return {
    slots: slotsData,
    vaccinations: vaccinationsData,
  };
}
async function main() {
  const isroLocations = await getIsroCSVLocations(
    `${__dirname}/../data/isro.csv`
  );
  const dump = await getFullDump(isroLocations);
  for (const key of Object.keys(dump)) {
    const filename = path.join(
      "raw",
      "v1",
      key,
      DateTime.now().setZone("Asia/Kolkata").toISO() + ".json.gz"
    );
    if (key === "vaccinationsData") {
      const mappedFilename = path.join(
        "processed",
        "v1",
        key,
        "mapped_cvc_data.json.gz"
      );
      console.log(`Writing ${filename}`);
      // Publish transformed file to s3
      await publishS3(
        "indiavaccine-cvc",
        mappedFilename,
        zlib.gzipSync(JSON.stringify(transform(dump[key])))
      );
    }
    console.log(`Writing ${filename}`);
    // Publish to s3
    await publishS3(
      "indiavaccine-cvc",
      filename,
      zlib.gzipSync(JSON.stringify(dump[key]))
    );
    // Publish to Git
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(dump[key])));
    console.log(`Written ${filename}`);
  }
}

main();
