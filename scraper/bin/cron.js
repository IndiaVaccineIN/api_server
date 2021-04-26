const CronJob = require("cron").CronJob;
const pm2 = require("pm2");

console.log("Before job instantiation");
const job = new CronJob("0 */30 6-23 * * *", function () {
  const d = new Date();
  console.log("Running script:", d);
  pm2.start(
    {
      script: "npm -- run full-cycle",
      autorestart: false,
    },
    (err, apps) => {
      pm2.disconnect();
      if (err) {
        throw err;
      }
    }
  );
});
console.log("After job instantiation");
job.start();
console.log("is job running? ", job.running);
console.log("System TZ next 5: ", job.nextDates(5));
