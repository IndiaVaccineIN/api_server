const csv = require("fast-csv");
const fs = require("fs");
const { isArray } = require("lodash");

module.exports = class CsvWriter {
  constructor(outPath) {
    let self = this;
    self.outPath = outPath;
    self.csvStream = csv.format({ headers: true });
    self.writableStream = fs.createWriteStream(outPath);
    self.hasFinished = new Promise((resolve) => {
      self.writableStream.on("finish", function () {
        console.log("Done writing to " + outPath);
        resolve();
      });
    });
    self.csvStream.pipe(this.writableStream);
  }

  // get csvStream() {
  //   return this.csvStream;
  // }

  async write(data) {
    return this.csvStream.write(data);
  }

  async writeRows(rows) {
    if (isArray(rows)) {
      for (let index = 0; index < rows.length; index++) {
        await this.csvStream.write(rows[index]);
      }
      return;
    }
    return this.csvStream.write(data);
  }

  async close() {
    return this.csvStream.end();
  }
};
