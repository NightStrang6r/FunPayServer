import fetch from './fetch.js';
import { log } from './log.js';
import { updateFile } from './storage.js';
import { parseDOM } from './DOMParser.js';
import { headers } from './account.js';
import { load, loadSettings, getConst } from './storage.js';

const appData = load('data/appData.json');

async function updateCategoriesData() {
    log(`Обновляем список категорий...`, 'c');
    const cat = await getAllCategories(appData.id);
    const data = await getCategoriesData(cat);

    updateFile(data, `data/categories.json`);
    log(`Список категорий обновлён.`, 'g');
}

async function getCategoriesData(categories) {
    let result = [];
    try {
        for(let i = 0; i < categories.length; i++) {
            result[i] = await getCategoryData(categories[i]);
            result[i].name = result[i].name.replace('&nbsp;', ' ');
        }
    } catch (err) {
        log(`Ошибка при получении данных категорий: ${err}`, 'r');
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
        log(`Ошибка при получении данных категории: ${err}`, 'r');
    }
    return result;
}

async function getAllCategories(id) {
    let result = [];
    try {
        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(`${getConst('api')}/users/${id}/`, options);
        const body = await resp.text();

        const doc = parseDOM(body);
        const categories = doc.querySelectorAll(".offer-list-title-button");

        for(let i = 0; i < categories.length; i++) {
            result[i] = categories[i].firstElementChild.href;
        }
    } catch (err) {
        log(`Ошибка при получении категорий: ${err}`, 'r');
    }
    return result;
}

export { getAllCategories, getCategoryData, getCategoriesData, updateCategoriesData };