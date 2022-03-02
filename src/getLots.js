import request from 'sync-request';
import config from '../config.js';
import { JSDOM } from 'jsdom';
import { log } from './log.js';

const headers = { "cookie": `golden_key=${config.token}`};

function getAllCategories(userId) {
    let result = [];
    try {
        const res = request('GET', `${config.api}/users/${userId}/`, {
            headers: headers,
            retry: true,
            retryDelay: 500,
            maxRetries: Infinity
        });
        const body = res.getBody('utf8');
        const doc = parseDOM(body);
        const categories = doc.querySelectorAll(".offer-list-title-button");


        for(let i = 0; i < categories.length; i++) {
            result[i] = categories[i].firstElementChild.href;
        }
    } catch (err) {
        log(`Ошибка при получении UserId: ${err}`);
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

function parseDOM(text) {
    const { document } = (new JSDOM(text)).window;
    return document;
}

export { getUserId, getAllCategories };