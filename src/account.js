import request from 'sync-request';
import config from '../config.js';
import { log } from './log.js';
import { parseDOM } from './DOMParser.js';

const headers = { "cookie": `golden_key=${config.token}`};

function countTradeProfit() {
    let result = 0;
    let ordersCount = 0;
    try {
        let first = true;
        let continueId;
        while(1) {
            let method, data;
            if(!first) {
                method = 'POST';
                data = `${encodeURI('continue')}=${encodeURI(continueId)}`;
                headers["content-type"] = 'application/x-www-form-urlencoded';
                headers["x-requested-with"] = 'XMLHttpRequest';
            } else {
                first = false;
                method = 'GET';
            }
            const res = request(method, `${config.api}/orders/trade`, {
                headers: headers,
                body: data,
                retry: true,
                retryDelay: 500,
                maxRetries: Infinity
            });
            const body = res.getBody('utf8');
            const doc = parseDOM(body);
            const items = doc.querySelectorAll(".tc-item");
            const order = items[0].querySelector(".tc-order").innerHTML;
            const continueEl = doc.querySelector(".dyn-table-form");

            if(continueEl == null) {
                break;
            }

            continueId = continueEl.firstElementChild.value;

            items.forEach(item => {
                const status = item.querySelector(".tc-status").innerHTML;
                if(status == `Закрыт`) {
                    ordersCount++;
                    let price = item.querySelector(".tc-price").childNodes[0].data;
                    price = Number(price);
                    result += price;
                }
            });
            log(`${ordersCount} ${result}`);
        }
    } catch (err) {
        log(`Ошибка при подсчёте профита: ${err}`);
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

export { getUserId, headers, countTradeProfit };