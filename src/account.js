// MODULES
const fetch = global.fetch;
const log = global.log;
const { exit } = global.helpers;
const parseDOM = global.DOMParser;
const { getConst } = global.storage;

// CONSTANTS
const config = global.settings;
const headers = { "cookie": `golden_key=${config.golden_key};`};

if(!global.appData || !global.appData.id) {
    global.appData = await getUserData();
    if(!global.appData) await exit();
}

async function countTradeProfit() {
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

            const options = {
                method: method,
                body: data,
                headers: headers
            };
    
            const resp = await fetch(`${getConst('api')}/orders/trade`, options);
            const body = await resp.text();

            const doc = parseDOM(body);
            const items = doc.querySelectorAll(".tc-item");
            const order = items[0].querySelector(".tc-order").innerHTML;

            items.forEach(item => {
                const status = item.querySelector(".tc-status").innerHTML;
                if(status == `Закрыт`) {
                    let price = item.querySelector(".tc-price").childNodes[0].data;
                    price = Number(price);
                    if(isNaN(price)) return;
                    result += price;
                    ordersCount++;
                }
            });
            log(`Продажи: ${ordersCount}. Заработок: ${result.toFixed(2)} ₽. Средний чек: ${(result / ordersCount).toFixed(2)} ₽.`);

            const continueEl = doc.querySelector(".dyn-table-form");
            if (continueEl == null) {
                break;
            }

            continueId = continueEl.querySelector('input').getAttribute('value');
        }
    } catch (err) {
        log(`Ошибка при подсчёте профита: ${err}`, 'r');
    }
    return result;
}

function enableUserDataUpdate(timeout) {
    setInterval(getUserData, timeout);
    //log(`Автоматический апдейт данных запущен.`);
}

async function getUserData() {
    let result = false;
    try {
        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(getConst('api'), options);
        const body = await resp.text();

        const doc = parseDOM(body);
        const appData = JSON.parse(doc.querySelector("body").getAttribute('data-app-data'));

        if(!doc.querySelector(".user-link-name")) {
            log(`Неверный golden_key.`, 'r');
            return false;
        }

        const userName = doc.querySelector(".user-link-name").innerHTML;
        const balanceEl = doc.querySelector(".badge-balance");
        const salesEl = doc.querySelector(".badge-trade");
        const timestamp = Date.now();

        let balance = 0;
        let sales = 0;

        if(balanceEl && balanceEl != null) balance = balanceEl.innerHTML;
        if(salesEl && salesEl != null) sales = salesEl.innerHTML;

        let setCookie = "";
        resp.headers.forEach((val, key) => {
            if(key == "set-cookie") {
                setCookie = val;
                return;
            }
        });

        const PHPSESSID = setCookie.split(';')[0].split('=')[1];

        if(appData.userId && appData.userId != 0) {
            result = {
                id: appData.userId,
                csrfToken: appData["csrf-token"],
                sessid: PHPSESSID,
                userName: userName,
                balance: balance,
                sales: sales,
                lastUpdate: timestamp
            };
            
            global.appData = result;
        } else {
            log(`Необходимо авторизоваться.`);
        }
    } catch (err) {
        log(`Ошибка при получении данных аккаунта: ${err}`, 'r');
    }
    return result;
}

export { headers, getUserData, countTradeProfit, enableUserDataUpdate };