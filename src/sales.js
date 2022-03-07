import fetch from 'node-fetch';
import { log } from './log.js';
import config from '../config.js';
import { parseDOM } from './DOMParser.js';

function checkNewSales(userId) {
    let result = false;
    try {
        const url = `${config.api}/orders/trade`;
        const headers = {
            "cookie": `golden_key=${config.token}`,
            "x-requested-with": "XMLHttpRequest"
        };

        const options = {
            method: 'POST',
            headers: headers
        }

        result = fetch(url, options)
            .then(async resp => {
                const data = await resp.text();
                const doc = parseDOM(data);
                const ordersEl = doc.querySelectorAll(".tc-item");
                const res = [];

                for(let i = 0; i < ordersEl.length; i++) {
                    const order = ordersEl[i];
                    const id = order.querySelector(".tc-order").innerHTML;
                    const description = order.querySelector(".order-desc").firstElementChild.innerHTML;
                    res[i] = {
                        id: id,
                        description: description
                    }
                }

                return res;
            });
    } catch (err) {
        log(`Ошибка при получении списка продаж: ${err}`);
    }
    return result;
}

export { checkNewSales };