const puppeteer = require('puppeteer-extra')
const { JSDOM } = require('jsdom')

const TARGET_URL = 'https://ru.aruodas.lt/butu-nuoma/vilniuje/?FRoomNumMin=2&FRoomNumMax=3&FOrder=AddDate';
const TARGET_SELECTOR = 'table.list-search tr.list-row:not([style="display: none"])';

// Required for successful selection of elements in headless mode
// Can be commented out if launching browser with headless: false option
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());

async function preEval(page) {
    // hit the consent button first to see the actual page contents
    const acceptButton = await page.waitForSelector('#onetrust-accept-btn-handler');
    await acceptButton.click();
}

(async () => {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.goto(TARGET_URL);

        await preEval(page);

        const doc = await page.$eval('html', htmlElement => htmlElement.outerHTML)
            .then(html => new JSDOM(html).window.document);

        const nodeList = doc.querySelectorAll(TARGET_SELECTOR);

        console.log(nodeList);
        // TODO: Manipulate over NodeList to extract required data
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
})()
