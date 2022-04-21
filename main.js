const cron = require('node-cron');

const { checkApartments } = require('./apartmentsScrapper');
const { TELEGRAM_BOT_KEY } = require('./const');
const { RentBot } = require('./rentBot');

(() => {
  const store = {
    lastApartment: null,
    chats: [],
  };
  console.clear();

  const bot = new RentBot(TELEGRAM_BOT_KEY, store);
  bot.init();

  cron.schedule('* * * * *', checkApartments(bot, store));
})();
