// Replace with your own search query if necessary.
// Please, make sure that you've selected sorting by added date.
const TARGET_URL = 'https://ru.aruodas.lt/butu-nuoma/vilniuje/?FRoomNumMin=2&FRoomNumMax=3&FOrder=AddDate';
// Generate your own bot key with @BotFather here: https://telegram.me/botfather
// it looks like 5293019911:AAHIMqI-hWkVNnNW8zZPHnz9MZbhCPc6zas
const TELEGRAM_BOT_KEY = 'TELEGRAM_BOT_KEY';

const TARGET_SELECTOR = '.list-search-v2 .list-row-v2:not(.sort-row) .list-adress-v2';
const REGEX_COORD = /(\d+\.\d+)%2C(\d+\.\d+)$/;
const VILNIUS_COORD = [54.692536, 25.267392];

module.exports = {
  TARGET_URL,
  TARGET_SELECTOR,
  REGEX_COORD,
  TELEGRAM_BOT_KEY,
  VILNIUS_COORD,
};
