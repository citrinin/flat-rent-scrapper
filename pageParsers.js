const { TARGET_SELECTOR, REGEX_COORD, VILNIUS_COORD } = require('./const');
const { calcCrow } = require('./utils');

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

module.exports = {
  getApartmentInfo,
  getApartmentFullInfo,
};
