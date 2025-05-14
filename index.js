const TelegramBot = require('node-telegram-bot-api');

const token = '7828091519:AAF87CbqLkjS8OQLhcn8GQVOlKx-YFon22I';

const bot = new TelegramBot(token, { polling: true });

const users = {};
let orderCounter = 600;

function formatKyrgyzPhoneNumber(input) {
  const digits = input.replace(/\D/g, '');
  let localPart = digits;

  if (digits.startsWith('996')) {
    localPart = digits.slice(3);
  } else if (digits.startsWith('0')) {
    localPart = digits.slice(1);
  }

  if (localPart.length !== 9) return localPart;

  return localPart.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'awaitingName' };
  bot.sendMessage(chatId, 'Пожалуйста, введите ваш номер:');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Новый заказ') {
    const chatId = msg.chat.id;
    users[chatId] = { step: 'awaitingName' };
    bot.sendMessage(chatId, 'Пожалуйста, введите ваш номер:');
    return;
  }})

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start' || text === 'Новый заказ') return;

  const user = users[chatId];

  if (user && user.step === 'awaitingName') {
    user.name = text;
    user.step = 'awaitingPhone';
    orderCounter++;
    bot.sendMessage(chatId, `
1：ENSAR - ${orderCounter}
2：18160860859
3：浙江省 金华市 义乌市 
4：北苑街道春华路588号和意电商园A6栋
103 ENSAR-${orderCounter} +996 ${formatKyrgyzPhoneNumber(text)}
    `, {
      reply_markup: {
        keyboard: [['Новый заказ']],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
    return;
  }else {
    bot.sendMessage(chatId, `Выберите дейтвие
          `, {
            reply_markup: {
              keyboard: [['Новый заказ']],
              resize_keyboard: true,
              one_time_keyboard: false
            }
          });
  }
});

function generateOrderCode() {
  return `#${String(orderCounter++).padStart(4, '0')}`;
}

function buildOrderText(orderCode, user) {
  return `1：ENSAR - ${orderCode}
2：18160860859
3：浙江省 金华市 义乌市 
4：北苑街道春华路588号和意电商园A6栋
103 ENSAR-${orderCode} +996 ${user.phone}`;
}