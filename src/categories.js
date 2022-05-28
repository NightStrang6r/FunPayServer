import fetch from 'node-fetch';
import { log } from './log.js';
import { updateFile } from './storage.js';
import { parseDOM } from './DOMParser.js';
import { headers } from './account.js';
import { load } from './storage.js';
import Delays from './delays.js';
const delays = new Delays();

const config = load('config.json');
const appData = load('data/appData.json');

async function updateCategoriesData() {
    log(`Обновляем список категорий...`);
    //log(`Получаем список категорий...`);
    const cat = await getAllCategories(appData.id);
    //log(`Получаем информацию о категориях...`);
    const data = await getCategoriesData(cat);

    updateFile(data, `data/categories.json`);
    log(`Список категорий обновлён.`);
}

async function getCategoriesData(categories) {
    let result = [];
    try {
        for(let i = 0; i < categories.length; i++) {
            result[i] = await getCategoryData(categories[i]);
            result[i].name = result[i].name.replace('&nbsp;', ' ');
        }
    } catch (err) {
        log(`Ошибка при получении данных категорий: ${err}`);
    }
    return result;
}

async function getCategoryData(category) {
    let result = {};
    try {
        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(category, options);
        await delays.sleep();
        const body = await resp.text();
        
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

async function getAllCategories() {
    let result = [];
    try {
        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(`${config.api}/users/${appData.id}/`, options);
        await delays.sleep();
        const body = await resp.text();

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