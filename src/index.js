import { raiseLots } from './raise.js';
import { getUserId } from './account.js';
import { updateGoodsState } from './goods.js';
import { checkGoodsState } from './activity.js';
import { log } from './log.js';

log(`Получаем ID пользователя...`);
const userId = getUserId();
log(`ID пользователя: ${userId}`);

updateGoodsState(userId);

setInterval(() => {checkGoodsState(userId)}, 60000);
setInterval(raiseLots, 60000);
raiseLots();