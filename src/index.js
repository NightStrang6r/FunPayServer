import { raiseLots } from './raise.js';
import { checkGoodsState } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, autoUserDataUpdate } from './account.js';
import { updateCategoriesData } from './categories.js';
import { log } from './log.js';

import { getMessages, sendMessage, getChats } from './chat.js';
import { getOrders, getNewOrders, issueGood, autoIssue } from './sales.js';
import { getEmails } from './email.js';

log(`Получаем данные пользователя...`);
const userData = getUserData();
log(`ID пользователя: ${userData.id}`);

getEmails();

//autoUserDataUpdate(3600000);
//autoIssue(10000);

/*updateCategoriesData();
updateGoodsState();

setInterval(() => {checkGoodsState(userId)}, 120000);
setInterval(raiseLots, 60000);
raiseLots();*/