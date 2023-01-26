await import('./modules.js');

// MODULES
const program = global.commander;
const ver = global.project_version;
const log = global.log;
const { loadSettings } = global.storage;
const { exit } = global.helpers;
const { enableLotsRaise } = global.raise;
const { updateGoodsState } = global.goods;
const { updateCategoriesData } = global.categories;
const { getUserData, enableUserDataUpdate, countTradeProfit } = global.account;

const Runner = global.runner;
const TelegramBot = global.telegram;

const { enableAutoResponse, autoResponse } = global.chat;
const { checkForNewOrders, enableAutoIssue } = global.sales;
const { checkGoodsState, enableGoodsStateCheck } = global.activity;

global.startTime = Date.now();

// UncaughtException Handler
process.on('uncaughtException', (e) => {
    log('Ошибка: необработанное исключение. Сообщите об этом разработчику.', 'r');
    log(e.stack);
});

// Checking arguments
program
  .version(ver, '-v, --version')
  .usage('[OPTIONS]...')
  .option('-c, --countProfit', 'count your trade profit and exit')
  .parse(process.argv);

const options = program.opts();
if(options && options.countProfit) {
    log('Считаем заработок по продажам...', 'g');
    await countTradeProfit();
    log('Подсчёт окончен.', 'g');
    await exit();
}

// Loading data
const settings = global.settings;

log(`Получаем данные пользователя...`, 'c');
const userData = await getUserData();
if(!userData) await exit();
log(`Привет, ${userData.userName}!`, 'm');

if(settings.lotsRaise == true)
    await updateCategoriesData();

if(settings.goodsStateCheck == true)
    await updateGoodsState();

const runner = new Runner();

// Starting threads
if(settings.lotsRaise == true) 
    enableLotsRaise();

if(settings.goodsStateCheck == true || settings.autoIssue == true) {
    runner.registerNewOrderCallback(onNewOrder);
}

if(settings.goodsStateCheck == true) {
    enableGoodsStateCheck();
}

if(settings.autoIssue == true) {
    enableAutoIssue();
}

if(settings.autoResponse == true) {
    runner.registerNewMessageCallback(onNewMessage);
    enableAutoResponse();
}

enableUserDataUpdate(300 * 1000);

// Start runner loop
if(settings.alwaysOnline == true || settings.autoIssue == true || settings.autoResponse == true || settings.goodsStateCheck == true) {
    await runner.start();
}

// Start telegram bot
if(settings.telegramBot == true) {
    const bot = new TelegramBot(settings.telegramToken);
    bot.run();
}

// Callbacks
function onNewMessage() {
    autoResponse();
}

function onNewOrder() {
    if(settings.autoIssue == true) {
        checkForNewOrders();
    }

    if(settings.goodsStateCheck == true) {
        checkGoodsState();
    }
}