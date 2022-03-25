import graphics from './graphics.js';
import { enableLotsRaise } from './raise.js';
import { enableGoodsStateCheck } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, autoUserDataUpdate, countTradeProfit } from './account.js';
import { updateCategoriesData } from './categories.js';
import { log } from './log.js';
import { load } from './storage.js';

import { getMessages, sendMessage, getChats, enableAutoResponse } from './chat.js';
import { getOrders, getNewOrders, issueGood, autoIssue } from './sales.js';
import { getAllEmails, getSteamCode } from './email.js';

log(`Получаем данные пользователя...`);
const userData = await getUserData();
if(!userData) process.exit();
log(`ID пользователя: ${userData.id}`);

//enableAutoResponse(2000);

//autoUserDataUpdate(3600000);
//autoIssue(10000);

await updateGoodsState();
//await updateCategoriesData();

enableGoodsStateCheck(120000);
//enableLotsRaise(60000);