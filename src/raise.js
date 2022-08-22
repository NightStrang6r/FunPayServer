import c from 'chalk';
import fetch from './fetch.js';
import { log } from './log.js';
import { sleep } from './event.js';
import { load, loadSettings, getConst } from './storage.js';

const config = global.settings;
let raiseCounter = 0;

async function enableLotsRaise(timeout) {
    const categories = await load('data/categories.json');
    log(`Автоподнятие запущено, загружено ${c.yellowBright(categories.length)} категория(ий).`);

    raiseLots(categories);
    setInterval(() => {
        raiseLots(categories);
    },
    timeout);
}

async function raiseLots(categories){
    try {
        let error = false;
        let raised = 0;
        let waiting = 0;
        raiseCounter++;
    
        for(let i = 0; i < categories.length; i++) {
            const lot = categories[i];
    
            let res = await raiseLot(lot.game_id, lot.node_id);

            if(!res.success) {
                error = true;
                log(`Не удалось поднять предложение ${lot.name}: ${res.msg}`);
                continue;
            }

            if(res.msg.includes("Подождите")) {
                waiting++;
            }

            if(res.msg.includes("подняты")) {
                raised++;
            }
    
            await sleep(500);
        }

        if(!error) {
            log(`Предложения подняты (${c.yellowBright(waiting)} в ожидании, ${c.yellowBright(raised)} поднято).`, 'g');
        }
    } catch (err) {
        log(`Ошибка при поднятии предложений: ${err}`, 'r');
    }
}

async function raiseLot(game_id, node_id) {
    try {
        const raiseUrl = `${getConst('api')}/lots/raise`;

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
            res = await resp.json();
        }

        return {success: true, msg: res.msg};
    } catch(err) {
        log(`Ошибка при поднятии предложений: ${err}`, 'r');
        return {success: false};
    }
}

export { raiseLots, enableLotsRaise };