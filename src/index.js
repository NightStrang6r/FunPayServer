import { raiseLots } from './raise.js';
import { checkGoodsState } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData } from './account.js';
import { updateCategoriesData } from './categories.js';
import { log } from './log.js';

import { getMessages, sendMessage } from './chat.js';
import { getOrders, getNewOrders, issueGood, autoIssue } from './sales.js';

log(`Получаем данные пользователя...`);
const userData = getUserData();
log(`ID пользователя: ${userData.id}`);

autoIssue();



/*updateCategoriesData(userId);
updateGoodsState(userId);

setInterval(() => {checkGoodsState(userId)}, 120000);
setInterval(raiseLots, 60000);
raiseLots();*/