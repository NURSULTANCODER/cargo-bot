const TelegramBot = require('node-telegram-bot-api');

const token = '7828091519:AAF87CbqLkjS8OQLhcn8GQVOlKx-YFon22I';

const bot = new TelegramBot(token, { polling: true });

const users = {};

// Функция форматирования номера телефона
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

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'awaitingName' };
  bot.sendMessage(chatId, 'Пожалуйста, введите ваше ФИО:');
});

// сообщения
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем /start
  if (text === '/start') return;

  const user = users[chatId];

  // Шаг 1: получаем ФИО
  if (user && user.step === 'awaitingName') {
    user.name = text;
    user.step = 'awaitingPhone';
    bot.sendMessage(chatId, 'Теперь введите ваш номер телефона:');
    return;
  }

  // Шаг 2: получаем телефон
  if (user && user.step === 'awaitingPhone') {
    user.phone = formatKyrgyzPhoneNumber(text);
    user.step = 'ready';
    user.orders = [];

    const orderCode = generateOrderCode();
    user.orders.push(orderCode);

    bot.sendMessage(chatId, "1：ENSAR -", {
      reply_markup: {
        keyboard: [['🆕 Новый заказ']],
        resize_keyboard: true
      }
    });
    return;
  }

  // Новый заказ
  if (user && user.step === 'ready' && text === '🆕 Новый заказ') {
    const orderCode = generateOrderCode();
    user.orders.push(orderCode);
    bot.sendMessage(chatId, buildOrderText(orderCode, user));
    return;
  }
});

// Генерация кода заказа
function generateOrderCode() {
  return `#${String(orderCounter++).padStart(4, '0')}`;
}

// Шаблон текста
function buildOrderText(orderCode, user) {
  return `1：ENSAR - ${orderCode}
2：18160860859
3：浙江省 金华市 义乌市 
4：北苑街道春华路588号和意电商园A6栋
103 ENSAR-${orderCode} +996 ${user.phone}`;
}