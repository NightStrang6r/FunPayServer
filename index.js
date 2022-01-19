const request = require('sync-request');
const config = require('./config.json');

const raiseUrl = 'https://funpay.com/lots/raise';
config.headers.cookie = `${config.headers.cookie} golden_key=${config.token}`;
const headers = config.headers;

let raiseCounter = 0;

function raiseLots(){
    let lotsCounter = 0;
    raiseCounter++;
    console.log(`===================== Поднятие лотов №${raiseCounter} =====================`);
    config.lots.forEach(lot => {
        lotsCounter++;
        let res = raiseLot(lot.game_id, lot.node_id);
        if(res.success) {
            console.log(`[${lotsCounter}] Лот ${lot.name}: ${res.msg}`);
        } else {
            console.log(`Ошибка при поднятии лота ${lot.name}: ${res.msg}`);
        }
        sleep(0.5);
    });
}

function raiseLot(game_id, node_id){
    let raiseBody = `${encodeURI('game_id')}=${encodeURI(game_id)}&${encodeURI('node_id')}=${encodeURI(node_id)}`;
    let res = request('POST', raiseUrl, {
        headers: headers,
        body: raiseBody,
        retry: true,
        retryDelay: 500,
        maxRetries: Infinity
    });
    res = JSON.parse(res.getBody('utf8'));
    if(res.modal) {
        let reg = new RegExp(`value="(.*?)"`, `g`);
        let regRes = [...res.modal.matchAll(reg)];
        let modalRaiseBody = raiseBody;
        regRes.forEach(id => {
            modalRaiseBody += `&${encodeURI('node_ids[]')}=${encodeURI(id[1])}`;
        });
        res = request('POST', raiseUrl, {
            headers: headers,
            body: modalRaiseBody,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });
        res = JSON.parse(res.getBody('utf8'));
    }
    return {success: true, msg: res.msg};
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n*1000);
}

setInterval(raiseLots, 60000);
raiseLots();