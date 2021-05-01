// You can update the GeoRSS used with:
// curl https://bhuvan-vec3.nrsc.gov.in/bhuvan/vaccine/wms\?service\=WMS\&version\=1.1.0\&request\=GetMap\&layers\=vaccine%3Avaccine_india\&bbox\=68.4078750610352%2C7.84162569046021%2C94.9691390991211%2C35.1548805236816\&width\=746\&height\=768\&srs\=EPSG%3A4326\&format\=rss > data/isro.rss
import RSSParser from 'rss-parser';
import fs from 'fs';
import cheerio from 'cheerio';
import parseCSV from 'csv-parse/lib/sync';

export interface IsroLocationInterface {
  nin_pmjay?: string;
  type?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  contact?: string;
  mobile?: string;
  categoryno?: string;
  name?: string;
  pincode?: string;
  district?: string;
  state?: string;
  categoryname?: string;
  block?: string;
  city?: string;
}

export async function getIsroCSVLocations(
  csvFilePath: fs.PathLike
): Promise<Record<string, IsroLocationInterface>> {
  const records = parseCSV(fs.readFileSync(csvFilePath), {columns: true});
  return records.reduce(
    (map: Record<string, IsroLocationInterface>, r: IsroLocationInterface) => {
      if (r.name) {
        map[r.name.toLowerCase()] = r;
      }
      return map;
    },
    {}
  );
}

// sample xml being parsed for extracting geo locations
// keyed by name
/*
<item>
  <title>vaccine_india.1931</title>
  <link><![CDATA[https://bhuvan-vec3.nrsc.gov.in:443/bhuvan/vaccine/wms/reflect?format=application%2Fatom%2Bxml&layers=vaccine%3Avaccine_india&featureid=vaccine_india.1931]]></link>
  <guid><![CDATA[https://bhuvan-vec3.nrsc.gov.in:443/bhuvan/vaccine/wms/reflect?format=application%2Fatom%2Bxml&layers=vaccine%3Avaccine_india&featureid=vaccine_india.1931]]></guid>
  <description><![CDATA[<h4>vaccine_india</h4>

<ul class="textattributes">
  <li><strong><span class="atr-name">nin_pmjay</span>:</strong> <span class="atr-value">HOSP32P98837</span></li>
  <li><strong><span class="atr-name">type</span>:</strong> <span class="atr-value">Paid</span></li>
  <li><strong><span class="atr-name">address</span>:</strong> <span class="atr-value">Indira Gandhi Road</span></li>
  <li><strong><span class="atr-name">latitude</span>:</strong> <span class="atr-value">11.2597400000</span></li>
  <li><strong><span class="atr-name">longitude</span>:</strong> <span class="atr-value">75.7812900000</span></li>

  <li><strong><span class="atr-name">mobile</span>:</strong> <span class="atr-value">9446005089</span></li>
  <li><strong><span class="atr-name">categoryno</span>:</strong> <span class="atr-value">2</span></li>

  <li><strong><span class="atr-name">name</span>:</strong> <span class="atr-value">National Hospital</span></li>

  <li><strong><span class="atr-name">pincode</span>:</strong> <span class="atr-value">673001</span></li>
  <li><strong><span class="atr-name">district</span>:</strong> <span class="atr-value">KOZIKOD</span></li>
  <li><strong><span class="atr-name">state</span>:</strong> <span class="atr-value">KERALA</span></li>
  <li><strong><span class="atr-name">categoryname</span>:</strong> <span class="atr-value">Private PMJAY</span></li>

</ul>
]]>
  </description>
  <georss:point>11.259739999601322 75.78129000023335</georss:point>
</item>

*/

export async function getIsroRSSLocations(
  rssFilePath: fs.PathLike
): Promise<Record<string, IsroLocationInterface>> {
  const rssParser = new RSSParser();
  const feed = await rssParser.parseString(
    fs.readFileSync(rssFilePath, 'utf-8')
  );
  const locations: Record<string, IsroLocationInterface> = {};

  for (const item of Object.values(feed.items)) {
    if (item.content) {
      const data: IsroLocationInterface = {};
      const $ = cheerio.load(item.content);

      const georss = $('georss:point').text().split(' ');
      data.latitude = georss[0];
      data.longitude = georss[1];

      const $lis = $('ul.textattributes li');
      $lis.each((_, li) => {
        const key = $(
          'span.atr-name',
          li
        ).text() as keyof IsroLocationInterface;
        const value = $('span.atr-value', li).text();
        data[key] = value;
      });
      //data.title_id = item.title?.split('.')[1];
      if (data.name) {
        locations[data.name.toLowerCase()] = data;
      }
    }
  }

  return locations;
}
