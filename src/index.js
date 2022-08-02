import { log } from './log.js';
import { enableLotsRaise } from './raise.js';
import { enableGoodsStateCheck } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, enableUserDataUpdate, countTradeProfit } from './account.js';
import { updateCategoriesData } from './categories.js';

import { getMessages, sendMessage, getChats, enableAutoResponse } from './chat.js';
import { getOrders, getNewOrders, issueGood, searchOrdersByUserName, enableAutoIssue } from './sales.js';
import { getAllEmails, getSteamCode } from './email.js';

log(`Получаем данные пользователя...`);
const userData = await getUserData();
if(!userData) process.exit();
log(`Привет, ${userData.userName}!`);

await updateCategoriesData();
await updateGoodsState();

enableLotsRaise(120000);
enableGoodsStateCheck(120000);
enableAutoIssue(20000);
//enableAutoResponse(5000);
enableUserDataUpdate(100000);