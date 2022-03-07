import { raiseLots } from './raise.js';
import { checkGoodsState } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData } from './account.js';
import { updateCategoriesData } from './categories.js';
import { log } from './log.js';

import { getMessages, sendMessage } from './chat.js';
import { checkNewSales } from './sales.js';

log(`Получаем данные пользователя...`);
const userData = getUserData();
log(`Данные пользователя: ${userData.id}`);

const res = await checkNewSales(userData.id);
log(res);

//const res = await sendMessage(0, userData.id, userData.csrfToken, userData.sessid, ".");
//log(res);

//const msg = await getMessages(userData.id, 1258279);
//log(msg.chat);

/*updateCategoriesData(userId);
updateGoodsState(userId);

setInterval(() => {checkGoodsState(userId)}, 120000);
setInterval(raiseLots, 60000);
raiseLots();*/