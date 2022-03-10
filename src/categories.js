import request from 'sync-request';
import config from '../config.js';
import { log } from './log.js';
import { updateFile } from './storage.js';
import { parseDOM } from './DOMParser.js';
import { headers } from './account.js';
import appData from '../data/appData.js';

function updateCategoriesData() {
    log(`Обновляем спикок категорий...`);
    log(`Получаем список категорий...`);
    const cat = getAllCategories(appData.id);
    log(`Получаем информацию о категориях...`);
    const data = { lots: getCategoriesData(cat) };

    updateFile(data, `../data/categories.js`);
    log(`Список категорий обновлён.`);
}

function getCategoriesData(categories) {
    let result = [];
    try {
        for(let i = 0; i < categories.length; i++) {
            result[i] = getCategoryData(categories[i]);
        }
    } catch (err) {
        log(`Ошибка при получении данных категорий: ${err}`);
    }
    return result;
}

function getCategoryData(category) {
    let result = {};
    try {
        const res = request('GET', category, {
            headers: headers,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });
        
        const body = res.getBody('utf8');
        const doc = parseDOM(body);
        const buttonEl = doc.querySelector(".col-sm-6").firstElementChild;
        const textEl = doc.querySelector(".inside");
        result = {
            name: textEl.innerHTML,
            node_id: buttonEl.dataset.node,
            game_id: buttonEl.dataset.game
        }
    } catch (err) {
        log(`Ошибка при получении данных категории: ${err}`);
    }
    return result;
}

function getAllCategories() {
    let result = [];
    try {
        const res = request('GET', `${config.api}/users/${appData.id}/`, {
            headers: headers,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });
        const body = res.getBody('utf8');
        const doc = parseDOM(body);
        const categories = doc.querySelectorAll(".offer-list-title-button");


        for(let i = 0; i < categories.length; i++) {
            result[i] = categories[i].firstElementChild.href;
        }
    } catch (err) {
        log(`Ошибка при получении категорий: ${err}`);
    }
    return result;
}

export { getAllCategories, getCategoryData, getCategoriesData, updateCategoriesData };