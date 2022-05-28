import fetch from 'node-fetch';
import { log } from './log.js';
import { load } from './storage.js';
import Delays from './delays.js';
const delays = new Delays();

const config = load('config.json');
let raiseCounter = 0;

async function enableLotsRaise(timeout) {
    const categories = load('data/categories.json');
    log(`Автоподнятие запущено, загружено ${categories.length} категория(ий).`);

    raiseLots(categories);
    setInterval(() => {
        raiseLots(categories);
    },
    timeout);
}

async function raiseLots(categories){
    try {
        let error = false;
        let lotsCounter = 0;
        raiseCounter++;
        //log(`===================== Поднятие лотов №${raiseCounter} =====================`);
    
        for(let i = 0; i < categories.length; i++) {
            const lot = categories[i];
    
            lotsCounter++;
            let res = await raiseLot(lot.game_id, lot.node_id);
            if(res.success && (res.msg.includes("Подождите") || res.msg.includes("подняты"))) {
                //log(`[${lotsCounter}] Лот ${lot.name}: ${res.msg}`);
            } else {
                error = true;
                log(`Не удалось поднять лот ${lot.name}: ${res.msg}`);
            }
    
            await sleep(0.5);
        }

        if(!error) {
            log(`Лоты подняты.`);
        }
    } catch (err) {
        log(`Ошибка при поднятии лотов: ${err}`);
    }
}

async function raiseLot(game_id, node_id) {
    try {
        const raiseUrl = `${config.api}/lots/raise`;

        const params = new URLSearchParams();
        params.append('game_id', game_id);
        params.append('node_id', node_id);

        const headers = {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "cookie": `locale=ru; golden_key=${config.token}`,
            "x-requested-with": "XMLHttpRequest"
        }

        let options = {
            method: 'POST',
            body: params,
            headers: headers
        };

        let resp = await fetch(raiseUrl, options);
        await delays.sleep();
        let res = await resp.json();

        if(res.modal) {
            let reg = new RegExp(`value="(.*?)"`, `g`);
            let regRes = [...res.modal.matchAll(reg)];

            regRes.forEach(id => {
                params.append('node_ids[]', id[1]);
            });

            options = {
                method: 'POST',
                body: params,
                headers: headers
            };

            resp = await fetch(raiseUrl, options);
            await delays.sleep();
            res = await resp.json();
        }

        return {success: true, msg: res.msg};
    } catch(err) {
        log(`Ошибка при поднятии лота: ${err}`);
        return {success: false};
    }
}

function sleep(n) {
    n = n * 1000;
    return new Promise((resolve, reject) => {
        setTimeout(resolve, n);
    });
}

export { raiseLots, enableLotsRaise };