import fetch from 'node-fetch';
import { log } from './log.js';
import config from '../config.js';

function getMessages(userId, senderId) {
    let result = false;
    try {
        const url = `${config.api}/chat/history?node=users-${userId}-${senderId}&last_message=1000000000`;
        const headers = { 
            "cookie": `golden_key=${config.token}`,
            "x-requested-with": "XMLHttpRequest"
        };

        const options = {
            method: 'GET',
            headers: headers
        }

        result = fetch(url, options)
            .then(resp => {
                return resp.json();
            });
    } catch (err) {
        log(`Ошибка при получении сообщений: ${err}`);
    }
    return result;
}

function sendMessage(senderId, userId, csrf, sessid, message) {
    let result = false;
    try {
        const url = `${config.api}/runner/`;
        const headers = {
            "accept": "*/*",
            "cookie": `golden_key=${config.token}; PHPSESSID=${sessid}`,
            "x-requested-with": "XMLHttpRequest"
        };
        const request = `{"action":"chat_message","data":{"node":"users-${userId}-${senderId}","last_message":752530077,"content":"${message}","compact":1,"show_avatar":1}}`;
        const params = new URLSearchParams();
        params.append('objects', "");
        params.append('request', request);
        params.append('csrf_token', csrf);

        const options = {
            method: 'POST',
            body: params,
            headers: headers
        };

        result = fetch(url, options)
            .then(resp => {
                return resp.json();
            });
    } catch (err) {
        log(`Ошибка при отправке сообщения: ${err}`);
    }
    return result;
}

export { getMessages, sendMessage };