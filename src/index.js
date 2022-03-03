import { raiseLots } from './raise.js';
import { updateCategoriesData } from './getCategories.js';

updateCategoriesData();

setInterval(raiseLots, 60000);
raiseLots();