import { raiseLots } from './raise.js';
import { getUserId, getAllCategories } from './getLots.js';

let userId = getUserId();
console.log(getAllCategories(userId));

//setInterval(raiseLots, 60000);
//raiseLots();