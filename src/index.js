import { loadSettings } from './storage.js';
import { log } from './log.js';
import { enableLotsRaise } from './raise.js';
import { enableGoodsStateCheck } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, enableUserDataUpdate, countTradeProfit } from './account.js';
import { updateCategoriesData } from './categories.js';

import { getMessages, sendMessage, getChats, enableAutoResponse, getLastMessageId } from './chat.js';
import { getOrders, getNewOrders, issueGood, searchOrdersByUserName, enableAutoIssue } from './sales.js';

// Loading data
const settings = loadSettings();

log(`Получаем данные пользователя...`, 'c');
const userData = await getUserData();
if(!userData) process.exit();
log(`Привет, ${userData.userName}!`, 'm');

if(settings.lotsRaise == true)
    await updateCategoriesData();

if(settings.goodsStateCheck == true)
    await updateGoodsState();

// Starting threads
if(settings.lotsRaise == true) 
    enableLotsRaise(settings.intervals.lotsRaise * 1000);

if(settings.goodsStateCheck == true) 
    enableGoodsStateCheck(settings.intervals.goodsStateCheck * 1000);

if(settings.autoIssue == true) 
    enableAutoIssue(settings.intervals.autoIssue * 1000);

if(settings.autoResponse == true) 
    enableAutoResponse(settings.intervals.autoResponse * 1000);

if(settings.userDataUpdate == true) 
    enableUserDataUpdate(settings.intervals.userDataUpdate * 1000);