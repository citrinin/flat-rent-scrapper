const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { JSDOM } = require('jsdom');

const { TARGET_URL } = require('./const');
const { getApartmentInfo, getApartmentFullInfo } = require('./pageParsers');

puppeteer.use(StealthPlugin());

function checkApartments(bot, store) {
  return async function () {
    const browser = await puppeteer.launch();
    try {
      const searchResultsPage = await fetchRentPage(browser, TARGET_URL);
      const latestApartmentInfo = getApartmentInfo(searchResultsPage);
      const latestApartmentInfoStr = JSON.stringify(latestApartmentInfo);
      console.info(latestApartmentInfoStr);

      if (latestApartmentInfoStr !== store.lastApartment?.shortInfo) {
        const apartmentDetailsPage = await fetchRentPage(browser, latestApartmentInfo.link);
        const fullInfo = `Новая квартира!\n\n${getApartmentFullInfo(apartmentDetailsPage)}\n\nПодробнее:\n ${
          latestApartmentInfo.link
        }`;

        store.chats.forEach((chatId) => bot.telegram.sendMessage(chatId, fullInfo));
        store.lastApartment = {
          shortInfo: latestApartmentInfoStr,
          fullInfo,
        };
      }
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
    }
  };
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

module.exports = { checkApartments };
