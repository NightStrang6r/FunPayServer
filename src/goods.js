import request from 'sync-request';
import { headers } from './account.js';
import { parseDOM } from './DOMParser.js';
import { getAllCategories } from './categories.js';
import { updateFile } from './storage.js';
import { log } from './log.js';

function updateGoodsState(userId) {
    log(`Обновляем спикок активности товаров...`);
    const data = { goods: getAllGoods(userId) };

    updateFile(data, `../data/goodsState.js`);
    log(`Список активности товаров обновлён.`);
}

/*function backupGoods(userId) {
    log(`Бэкапим товары...`);
    const goods = getAllGoods(userId, true);
    const data = { goods: goods };

    updateFile(data, `../data/goodsBackup.js`);
    log(`Бэкап создан.`);
}*/

function getAllGoods(userId, full = false) {
    let result = [];
    try {
        const cat = getAllCategories(userId);
        for(let i = 0; i < cat.length; i++) {
            const goods = getGoodsFromCategory(cat[i], full);
            goods.forEach(good => {
                result[result.length] = good;
            });
        }
    } catch(err) {
        log(`Ошибка при получении товаров: ${err}`);
    }
    return result;
}

function getGoodsFromCategory(category, full = false) {
    let result = [];
    try {
        const res = request('GET', category, {
            headers: headers,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });

        const body = res.getBody('utf8');
        const doc = parseDOM(body);
        const goodsEl = doc.querySelectorAll(".tc-item");
        for(let i = 0; i < goodsEl.length; i++) {
            let goodEl = goodsEl[i];
            let good = {};
            let active = false;

            if(!goodEl.classList.contains("warning")) {
                active = true;
            }

            if(full) {
                good = {
                    node_id: goodEl.dataset.node,
                    offer_id: goodEl.dataset.offer,
                    server: goodEl.querySelector(".tc-server").innerHTML,
                    description: goodEl.querySelector(".tc-desc .tc-desc-text").innerHTML,
                    price: goodEl.querySelector(".tc-price").dataset.s,
                    unit: goodEl.querySelector(".tc-price .unit").innerHTML,
                    active: active
                };
            } else {
                good = {
                    node_id: goodEl.dataset.node,
                    offer_id: goodEl.dataset.offer,
                    active: active
                };
            }
            result[i] = good;
        }
    } catch(err) {
        log(`Ошибка при получении товаров из категории: ${err}`);
    }
    return result;
}

export { getGoodsFromCategory, getAllGoods, updateGoodsState };