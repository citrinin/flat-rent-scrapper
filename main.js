const puppeteer = require('puppeteer-extra');
const { JSDOM } = require('jsdom');
const cron = require('node-cron');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const TARGET_URL = 'https://ru.aruodas.lt/butu-nuoma/vilniuje/?FRoomNumMin=2&FRoomNumMax=3&FOrder=AddDate';
const TARGET_SELECTOR = 'table.list-search tr.list-row:not([style*=display]) .list-adress';
const regexCoord = /(\d+\.\d+)%2C(\d+\.\d+)$/;
const TELEGRAM_BOT_KEY = '5293013442:AAHIMqI-hWkVNnNW8zZPHnz9MZbhCPc6uvk';
const { Telegraf } = require('telegraf');

puppeteer.use(StealthPlugin());

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
    const coordinates = googleLink.match(regexCoord).slice(1, 3);
    finalInfo.push(`Расстояние до центра: ${calcCrow(...coordinates, 54.692536, 25.267392).toFixed(1)} км (ищем < 3)`);
  }
  return finalInfo.join('\n');
}

async function fetchRentPage(browser, url) {
  const page = await browser.newPage();

  await page.goto(url);

  const doc = await page
    .$eval('html', (htmlElement) => htmlElement.outerHTML)
    .then((html) => new JSDOM(html).window.document);

  return doc;
}

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

(async () => {
  const bot = new Telegraf(TELEGRAM_BOT_KEY);

  const store = {
    lastApartment: null,
  };
  console.clear();

  bot.on('text', (ctx) => {
    // Explicit usage
    ctx.telegram.sendMessage(ctx.message.chat.id, `Приветик! Я тебе покажу новые квартиры, когда они появятся`);

    cron.schedule('*/1 * * * *', async function () {
      try {
        const browser = await puppeteer.launch();
        const doc = await fetchRentPage(browser, TARGET_URL);
        const apartmentInfo = getApartmentInfo(doc);
        const apartmentInfoStr = JSON.stringify(apartmentInfo);
        console.log(apartmentInfoStr);

        if (apartmentInfoStr !== store.lastApartment) {
          const apartDoc = await fetchRentPage(browser, apartmentInfo.link);
          const fullInfo = getApartmentFullInfo(apartDoc);
          ctx.reply(
            `Ёу, зацени вот эту:
ссылка => ${apartmentInfo.link}
улица: =>${apartmentInfo.address}
${fullInfo}`
          );
          store.lastApartment = apartmentInfoStr;
        }
      } catch (error) {
        console.error(error);
      } finally {
        browser.close();
      }
    });
  });

  bot.launch();
})();
