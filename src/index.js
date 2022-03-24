import { raiseLots } from './raise.js';
import { checkGoodsState } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, autoUserDataUpdate } from './account.js';
import { updateCategoriesData } from './categories.js';
import { log } from './log.js';

import { getMessages, sendMessage, getChats, enableAutoResponse } from './chat.js';
import { getOrders, getNewOrders, issueGood, autoIssue } from './sales.js';
import { getAllEmails, getSteamCode } from './email.js';

log(`Получаем данные пользователя...`);
const userData = getUserData();
if(!userData) process.exit();
log(`ID пользователя: ${userData.id}`);

//enableAutoResponse(2000);

//autoUserDataUpdate(3600000);
//autoIssue(10000);

//updateCategoriesData();
//updateGoodsState();

setInterval(() => {checkGoodsState(userData.id)}, 120000);
setInterval(raiseLots, 60000);
raiseLots();