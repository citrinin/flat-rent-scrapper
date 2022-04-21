const { TARGET_SELECTOR, REGEX_COORD, VILNIUS_COORD } = require('./const');
const { JSDOM } = require('jsdom');

function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

async function fetchRentPage(browser, url) {
  const page = await browser.newPage();

  await page.goto(url);

  const doc = await page
    .$eval('html', (htmlElement) => htmlElement.outerHTML)
    .then((html) => new JSDOM(html).window.document);

  await page.close();

  return doc;
}

function getApartmentInfo(doc) {
  const adItem = doc.querySelector(TARGET_SELECTOR);

  const link = adItem.querySelector('a').getAttribute('href');
  const address = adItem.querySelector('h3').textContent.trim();
  const price = adItem.querySelector('.list-item-price').textContent;

  return {
    link,
    address,
    price,
  };
}

function getApartmentFullInfo(doc) {
  const infoDt = doc.querySelectorAll('.obj-details dt');
  const infoDd = doc.querySelectorAll('.obj-details dd');
  const finalInfo = Array.from(infoDt)
    .slice(1, 7)
    .map((node, index) => node.innerHTML.trim() + ' ' + infoDd.item(index + 1).innerHTML.trim());
  const googleLink = doc.querySelector('.vector-thumb-map')?.getAttribute('href');
  if (googleLink) {
    const coordinates = googleLink.match(REGEX_COORD).slice(1, 3);
    finalInfo.push(`Расстояние до центра: ${calcCrow(...coordinates, ...VILNIUS_COORD).toFixed(1)} км (ищем < 3)`);
  }
  return finalInfo.join('\n');
}

module.exports = { fetchRentPage, getApartmentInfo, getApartmentFullInfo };
