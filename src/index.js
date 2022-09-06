import { program } from 'commander';
import ver from 'project-version';
import { loadSettings } from './storage.js';
import { log } from './log.js';
import { exit } from './event.js';
import { enableLotsRaise } from './raise.js';
import { updateGoodsState } from './goods.js';
import { updateCategoriesData } from './categories.js';
import { getUserData, enableUserDataUpdate, countTradeProfit } from './account.js';

import Runner from './runner.js';

import { enableAutoResponse, autoResponse } from './chat.js';
import { checkForNewOrders, enableAutoIssue } from './sales.js';
import { checkGoodsState, enableGoodsStateCheck } from './activity.js';

// UncaughtException Handler
process.on('uncaughtException', (e) => {
    console.error('Ошибка: необработанное исключение... Программа будет закрыта.');
    console.error(e.stack);
    setTimeout(() => {process.exit(1)}, 120000);
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