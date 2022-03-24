import fetch from 'node-fetch';
import config from '../config.js';
import categories from '../data/categories.js';
import { log } from './log.js';

const raiseUrl = 'https://funpay.com/lots/raise';
config.headers.cookie = `${config.headers.cookie} golden_key=${config.token}`;
const headers = config.headers;

let raiseCounter = 0;

async function raiseLots(){
    let lotsCounter = 0;
    raiseCounter++;
    log(`===================== Поднятие лотов №${raiseCounter} =====================`);

    for(let i = 0; i < categories.lots.length; i++) {
        const lot = categories.lots[i];

        lotsCounter++;
        let res = await raiseLot(lot.game_id, lot.node_id);
        if(res.success) {
            log(`[${lotsCounter}] Лот ${lot.name}: ${res.msg}`);
        } else {
            log(`Ошибка при поднятии лота ${lot.name}`);
        }

        await sleep(0.5);
    }
}

async function raiseLot(game_id, node_id){
    try {
        const params = new URLSearchParams();
        params.append('game_id', game_id);
        params.append('node_id', node_id);

        const options = {
            method: 'POST',
            body: params,
            headers: headers
        };

        const resp = await fetch(raiseUrl, options);
        const res = await resp.json();

        if(res.modal) {
            let reg = new RegExp(`value="(.*?)"`, `g`);
            let regRes = [...res.modal.matchAll(reg)];
            let modalRaiseBody = raiseBody;

            regRes.forEach(id => {
                modalRaiseBody += `&${encodeURI('node_ids[]')}=${encodeURI(id[1])}`;
            });

            options = {
                method: 'POST',
                body: modalRaiseBody,
                headers: headers
            };

            resp = await fetch(raiseUrl, options);
            res = await resp.json();
        }

        return {success: true, msg: res.msg};
    } catch(err) {
        log(`Ошибка при отправке запроса. Подробности: ${err}`);
        return {success: false};
    }
}

function sleep(n) {
    n = n * 1000;
    return new Promise((resolve, reject) => {
        setTimeout(resolve, n);
    });
}

export { raiseLots };