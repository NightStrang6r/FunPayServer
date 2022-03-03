import { raiseLots } from './raise.js';
import { updateCategoriesData } from './categories.js';
import { getUserId } from './account.js';
import { updateGoodsState } from './goods.js';
import { checkActivity } from './activity.js';
import { log } from './log.js';

log(`Получаем ID пользователя...`);
const userId = getUserId();
log(`ID пользователя: ${userId}`);

//updateGoodsState(userId);
checkActivity(userId);

/*setInterval(raiseLots, 60000);
raiseLots();*/