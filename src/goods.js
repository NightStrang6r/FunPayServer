// MODULES
const fetch = global.fetch;
const { headers } = global.account;
const parseDOM = global.DOMParser;
const { updateCategoriesData } = global.categories;
const { load, updateFile, getConst } = global.storage;
const log = global.log;

// FUNCTIONS
async function updateGoodsState() {
    log(`Обновляем список состояния товаров...`, 'c');
    const data = await getActiveProducts(global.appData.id);

    await updateFile(data, `data/other/goodsState.json`);
    log(`Список состояния товаров обновлён.`, 'g');
}

/*function backupGoods(userId) {
    log(`Бэкапим товары...`);
    const goods = getAllGoods(userId, true);
    const data = { goods: goods };

    await updateFile(data, `data/goodsBackup.js`);
    log(`Бэкап создан.`);
}*/

async function getAllGoods(userId, full = false) {
    let result = [];
    try {
        let cat = await load('data/other/categories.json');

        if(!cat || cat.length == 0) {
            cat = await updateCategoriesData();
        }
        
        for(let i = 0; i < cat.length; i++) {
            let link = '';

            if(typeof cat[i] == 'object') {
                link = `${getConst('api')}/lots/${cat[i].node_id}/trade`;
            } else {
                link = cat[i];
            }
            
            const goods = await getGoodsFromCategory(link, full);
            goods.forEach(good => {
                result[result.length] = good;
            });
        }
    } catch(err) {
        log(`Ошибка при получении товаров: ${err}`, 'r');
    }
    return result;
}

async function getGoodsFromCategory(category, full = false) {
    let result = [];
    try {
        const options = {
            method: 'GET',
            headers: headers
        };

        const resp = await fetch(category, options);
        const body = await resp.text();

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
                    node_id: goodEl.getAttribute('data-node'),
                    offer_id: goodEl.getAttribute('data-offer'),
                    server: goodEl.querySelector(".tc-server").innerHTML,
                    description: goodEl.querySelector(".tc-desc .tc-desc-text").innerHTML,
                    price: goodEl.querySelector(".tc-price").getAttribute('data-s'),
                    unit: goodEl.querySelector(".tc-price .unit").innerHTML,
                    active: active
                };
            } else {
                good = {
                    node_id: goodEl.getAttribute('data-node'),
                    offer_id: goodEl.getAttribute('data-offer'),
                    active: active
                };
            }
            result[i] = good;
        }
    } catch(err) {
        log(`Ошибка при получении товаров из категории: ${err}`, 'r');
    }
    return result;
}

async function getActiveProducts(id) {
    let result = [];

    try {
        const link = `${getConst('api')}/users/${id}/`;

        const resp = await fetch(link);
        const body = await resp.text();
        const doc = parseDOM(body);

        const mb20 = doc.querySelector('.mb20');
        if(!mb20) return [];
        const offers = mb20.querySelectorAll('.offer');

        for(let i = 0; i < offers.length; i++) {
            const offer = offers[i];
            const title = offer.querySelector('.offer-list-title a');
            const link = title.getAttribute('href');
            if(link.includes('chips')) continue;
            const node = link.split('/')[4];

            const lots = offer.querySelectorAll('div[data-section-type="lot"] a');
            for(let j = 0; j < lots.length; j++) {
                const lot = lots[j];
                const offerId = lot.getAttribute('href').split('id=')[1];

                result.push({
                    node_id: node,
                    offer_id: offerId
                });
            }
        }
    } catch(err) {
        log(`Ошибка при получении товаров: ${err}`, 'r');
    }

    return result;
}

export { getGoodsFromCategory, getAllGoods, getActiveProducts, updateGoodsState };