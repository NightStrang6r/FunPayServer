import request from 'sync-request';
import config from '../config.js';
import { JSDOM } from 'jsdom';
import { log } from './log.js';
import { updateFile } from './storage.js';

const headers = { "cookie": `golden_key=${config.token}`};

function updateCategoriesData() {
    log(`Обновляем спикок категорий...`);
    log(`Получаем ID пользователя...`)
    const userId = getUserId();
    log(`ID пользователя: ${userId}`);
    log(`Получаем список категорий...`);
    const cat = getAllCategories(userId);
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

function getAllCategories(userId) {
    let result = [];
    try {
        const res = request('GET', `${config.api}/users/${userId}/`, {
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
        log(`Ошибка при получении UserId: ${err}`);
    }
    return result;
}

function getUserId() {
    let result = false;
    try {
        const res = request('GET', config.api, {
            headers: headers,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });
        const body = res.getBody('utf8');
        const doc = parseDOM(body);
        const accoutLink = doc.querySelector(".user-link-dropdown").href;
        const split = accoutLink.split('/');

        result = split[split.length - 2];
    } catch (err) {
        log(`Ошибка при получении UserId: ${err}`);
    }
    return result;
}

function parseDOM(text) {
    const { document } = (new JSDOM(text)).window;
    return document;
}

export { getUserId, getAllCategories, getCategoryData, getCategoriesData, updateCategoriesData };