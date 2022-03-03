import request from 'sync-request';
import config from '../config.js';
import { log } from './log.js';
import { parseDOM } from './DOMParser.js';

const headers = { "cookie": `golden_key=${config.token}`};

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

export { getUserId, headers };