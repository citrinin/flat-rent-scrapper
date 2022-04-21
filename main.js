const puppeteer = require('puppeteer-extra');
const cron = require('node-cron');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Telegraf } = require('telegraf');

const { TELEGRAM_BOT_KEY, TARGET_URL } = require('./const');
const { fetchRentPage, getApartmentFullInfo, getApartmentInfo } = require('./utils');

puppeteer.use(StealthPlugin());

(async () => {
  const bot = new Telegraf(TELEGRAM_BOT_KEY);

  const store = {
    lastApartment: null,
    chats: [],
  };
  console.clear();

  bot.command('start', (ctx) => {
    ctx.reply('Подписка оформлена');
    if (store.lastApartment?.fullInfo) {
      ctx.reply(store.lastApartment?.fullInfo);
    }
    store.chats.push(ctx.message.chat.id);
  });

  bot.command('stop', (ctx) => {
    ctx.reply('Подписка отменена');
    store.chats = store.chats.filter((id) => id !== ctx.message.chat.id);
  });

  bot.on('text', (ctx) => {
    ctx.reply(
      `Приветик! Я покажу тебе новые объявления, когда они появятся.\nДля получения обновлений напиши /start.\nДля отписки напиши /stop.`
    );
  });

  bot.launch();

  cron.schedule('* * * * *', async function () {
    const browser = await puppeteer.launch();
    try {
      const doc = await fetchRentPage(browser, TARGET_URL);
      const apartmentInfo = getApartmentInfo(doc);
      const apartmentInfoStr = JSON.stringify(apartmentInfo);
      console.info(apartmentInfoStr);

      if (apartmentInfoStr !== store.lastApartment?.shortInfo) {
        const apartDoc = await fetchRentPage(browser, apartmentInfo.link);
        const fullInfo = `Новая квартира!\n\n${getApartmentFullInfo(apartDoc)}\n\nПодробнее:\n ${apartmentInfo.link}`;

        store.chats.forEach((chatId) => bot.telegram.sendMessage(chatId, fullInfo));
        store.lastApartment = {
          shortInfo: apartmentInfoStr,
          fullInfo,
        };
      }
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
    }
  });
})();
