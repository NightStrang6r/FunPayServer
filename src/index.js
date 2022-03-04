import { raiseLots } from './raise.js';
import { updateCategoriesData } from './categories.js';
import { getUserId } from './account.js';
import { updateGoodsState } from './goods.js';
import { checkGoodsState, setState } from './activity.js';
import { log } from './log.js';

log(`Получаем ID пользователя...`);
const userId = getUserId();
log(`ID пользователя: ${userId}`);

//updateGoodsState(userId);
//checkGoodsState(userId);
setState(true, 6505606, 327);

/*setInterval(raiseLots, 60000);
raiseLots();*/