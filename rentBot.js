const { Telegraf } = require('telegraf');

class RentBot extends Telegraf {
  constructor(botKey, store) {
    super(botKey);
    this.store = store;
  }

  init() {
    this.command('start', (ctx) => {
      ctx.reply('Подписка оформлена');
      if (this.store.lastApartment?.fullInfo) {
        ctx.reply(this.store.lastApartment?.fullInfo);
      }
      this.store.chats.push(ctx.message.chat.id);
    });

    this.command('stop', (ctx) => {
      ctx.reply('Подписка отменена');
      this.store.chats = this.store.chats.filter((id) => id !== ctx.message.chat.id);
    });

    this.on('text', (ctx) => {
      ctx.reply(
        `Приветик! Я покажу тебе новые объявления, когда они появятся.\nДля получения обновлений напиши /start.\nДля отписки напиши /stop.`
      );
    });

    this.launch();
  }
}

module.exports = {
  RentBot,
};
