// You can update the GeoRSS used with:
// curl https://bhuvan-vec3.nrsc.gov.in/bhuvan/vaccine/wms\?service\=WMS\&version\=1.1.0\&request\=GetMap\&layers\=vaccine%3Avaccine_india\&bbox\=68.4078750610352%2C7.84162569046021%2C94.9691390991211%2C35.1548805236816\&width\=746\&height\=768\&srs\=EPSG%3A4326\&format\=rss > data/isro.rss
const RSSParser = require('rss-parser');
const fs = require('fs')
const cheerio = require('cheerio')


async function getIsroLocations(rssFilePath) {
    const rssParser = new RSSParser()
    const feed = await rssParser.parseString(fs.readFileSync(rssFilePath))
    let locations = {}

    for (const item of Object.values(feed.items)) {
        const $ = cheerio.load(item.content)

        const $lis = $('ul.textattributes li');
        let data = {}
        $lis.each((_, li) => {
            const key = $('span.atr-name', li).text()
            const value = $('span.atr-value', li).text()
            data[key] = value
        })
        data.title_id = item.title.split('.')[1];
        locations[data.name.toLowerCase()] = data;
    }

    return locations;
}

module.exports = {
    getIsroLocations
}