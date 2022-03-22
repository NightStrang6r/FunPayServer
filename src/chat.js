import fetch from 'node-fetch';
import { log } from './log.js';
import appData from '../data/appData.js';
import { parseDOM } from './DOMParser.js';
import config from '../config.js';
import autoRespData from '../data/autoResponse.js';

function autoResponse() {
    let result = false;

    result = getChats().then(chats => {
        return chats.forEach(chat => {
            for(let i = 0; i < chats.length; i++) {
                // Command logic here
                if(chats[i].message == autoRespData[i].command) {
                    log(`Command ${autoRespData[i].command}`);
                    return true;
                }
            }
        });
    });
    
    return result;
}

function getChats() {
    let result = false;
    try {
        const url = `${config.api}/chat/`;
        const headers = { 
            "cookie": `golden_key=${config.token}`
        };

        const options = {
            method: 'GET',
            headers: headers
        }

        result = fetch(url, options)
            .then(resp => {
                return resp.text()
                    .then(text => {
                        const doc = parseDOM(text);
                        const chats = doc.querySelector(".contact-list").children;
                        let res = [];

                        for(let i = 0; i < chats.length; i++) {
                            const chat = chats[i];

                            res[i] = {
                                userName: chat.querySelector(".media-user-name").innerHTML,
                                message: chat.querySelector(".contact-item-message").innerHTML,
                                time: chat.querySelector(".contact-item-time").innerHTML,
                                node: chat.dataset.id
                            };
                        }

                        return res;
                    });
            });
    } catch (err) {
        log(`Ошибка при получении чатов: ${err}`);
    }
    return result;
}

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

async function sendMessage(senderId, message, customNode = false) {
    if(!message || message == undefined || !senderId || senderId == undefined) return;

    let result = false;
    let node = "";

    try {
        const url = `${config.api}/runner/`;
        const headers = {
            "accept": "*/*",
            "cookie": `golden_key=${config.token}; PHPSESSID=${appData.sessid}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        };

        if(!customNode) {
            node = `users-${appData.id}-${senderId}`;
        } else {
            node = senderId;
        }

        const request = {
            "action": "chat_message",
            "data": {
                "node": node,
                "last_message": 767373447,
                "content": message
            }
        };

        const params = new URLSearchParams();
        params.append('objects', "");
        params.append('request', JSON.stringify(request));
        params.append('csrf_token', appData.csrfToken);

        const options = {
            method: 'POST',
            body: params,
            headers: headers
        };

        const resp = await fetch(url, options);
        result = await resp.json();

        if(result.response != false) {
            log(`Сообщение отправлено, node: "${node}", сообщение: "${message}"`);
        } else {
            log(`Не удалось отправить сообщение, node: "${node}", сообщение: "${message}"`);
            log(`Request:`);
            console.log(params.toString());
            log(`Response:`);
            console.log(result);
        }
    } catch (err) {
        log(`Ошибка при отправке сообщения: ${err}`);
    }
    return result;
}

export { getMessages, sendMessage, getChats };