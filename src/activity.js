// MODULES
const c = global.chalk;
const fetch = global.fetch;
const { getActiveProducts } = global.goods;
const parseDOM = global.DOMParser;
const log = global.log;
const { load, getConst } = global.storage;

// CONSTANTS
const config = global.settings;
let goodsState;

async function enableGoodsStateCheck() {
    goodsState = await load('data/other/goodsState.json');
    log(`Автовосстановление предложений запущено, загружено ${c.yellowBright(goodsState.length)} активных предложение(ий).`, 'g');
}

async function checkGoodsState() {
    try {
        //log(`Проверяем состояние товаров на наличие изменений...`, 'c');
        const goodsNow = await getActiveProducts(global.appData.id);
        const goodsBackup = goodsState;

        for(let i = 0; i < goodsBackup.length; i++) {
            let exists = false;
            for(let j = 0; j < goodsNow.length; j++) {
                if(goodsBackup[i].offer_id == goodsNow[j].offer_id) {
                    exists = true;
                }
            }

            if(!exists) {
                await setState(true, goodsBackup[i].offer_id, goodsBackup[i].node_id);
            }
        }

        //log(`Проверка состояния товаров завершена.`);
    } catch (err) {
        log(`Ошибка при проверке активности предложений: ${err}`, 'r');
    }
}

async function setState(state, offer_id, node_id) {
    log(`Обновляем состояние товара ${c.yellowBright(offer_id)}...`, 'c');
    let result = [];
    try {
        const query = `?tag=${getRandomTag()}&offer=${offer_id}&node=${node_id}`;
        const url = `${getConst('api')}/lots/offerEdit${query}`;
        const headers = {
            "accept": "*/*",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "cookie": `golden_key=${config.golden_key}`
        };

        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(url, options);
        const json = await resp.json();

        const doc = parseDOM(json.html);

        let setCookie = "";
        resp.headers.forEach((val, key) => {
            if(key == "set-cookie") {
                setCookie = val;
                return;
            }
        });

        const PHPSESSID = setCookie.split(';')[0].split('=')[1];
        const inputsEl = doc.querySelectorAll("input");
        const textAreaEl = doc.querySelectorAll("textarea");
        const selectEl = doc.querySelectorAll("select");

        let inputData = [];
        inputsEl.forEach(input => {
            if(input.getAttribute('name') == 'active') {
                if(state) {
                    input.setAttribute('value', 'on');
                } else {
                    return;
                }
            }
            if(input.getAttribute('value') == undefined) {
                input.setAttribute('value', '');
            }
            inputData[inputData.length] = {
                name: input.getAttribute('name'),
                value: input.getAttribute('value')
            };
        });
        textAreaEl.forEach(text => {
            if(text.innerHTML == undefined) {
                text.innerHTML = '';
            }
            inputData[inputData.length] = {
                name: text.getAttribute('name'),
                value: text.innerHTML
            };
        });
        selectEl.forEach(select => {
            const options = select.querySelectorAll("option");
            let value = "";

            options.forEach(option => {
                if(option.getAttribute('selected') != null) {
                    value = option.getAttribute('value');
                    return;
                }
            });

            inputData[inputData.length] = {
                name: select.getAttribute('name'),
                value: value
            };
        });

        inputData[inputData.length] = {
            name: "location",
            value: "trade"
        };
        
        await saveOffer(inputData, PHPSESSID);
    } catch(err) {
        log(`Ошибка при обновлении состояния товара: ${err}`, 'r');
    }

    log(`Состояние товара ${c.yellowBright(offer_id)} обновлено.`, 'g');
    return result;
}

async function saveOffer(inputs, PHPSESSID) {
    let result = [];
    try {
        const url = `${getConst('api')}/lots/offerSave`;
        const headers = {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
            "cookie": `golden_key=${config.golden_key}; PHPSESSID=${PHPSESSID}`,
        };
        let body = ``;

        inputs.forEach(input => {
            body += `${encodeURIComponent(input.name)}=${encodeURIComponent(input.value)}&`;
        });

        const options = {
            method: 'POST',
            body: body,
            headers: headers
        };

        const resp = await fetch(url, options);
        const json = await resp.json();

        if(json.error) {
            log(`Ошибка при сохранении товара: ${errors}`, 'r');
        }
    } catch(err) {
        log(`Ошибка при сохранении товара: ${err}`, 'r');
    }
    return result;
}

function getRandomTag() {
    var a = "";
    var c = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var b = 0; b < 10; b++) {
        a += c.charAt(Math.floor(Math.random() * c.length));
    }
    return a;
}

export { checkGoodsState, setState, enableGoodsStateCheck, getRandomTag };