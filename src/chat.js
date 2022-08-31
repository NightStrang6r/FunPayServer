import fetch from './fetch.js';
import c from 'chalk';
import { log } from './log.js';
import { parseDOM } from './DOMParser.js';
import { load, getConst } from './storage.js';
import { issueGood, getGood, addDeliveredName, searchOrdersByUserName } from './sales.js'
import { getRandomTag } from './activity.js';

const config = global.settings;
const autoRespData = await load('data/autoResponse.json');

let isAutoRespBusy = false;

function enableAutoResponse() {
    log(`Автоответ запущен.`);
}

async function autoResponse() {
    if(isAutoRespBusy) return;
    isAutoRespBusy = true;
    let result = false;

    try {
        const chats = await getChatBookmarks();
        for(let j = 0; j < chats.length; j++) {
            const chat = chats[j];
    
            // Command logic here
    
            // Commands in file
            for(let i = 0; i < autoRespData.length; i++) {
                if(chat.message == autoRespData[i].command) {
                    log(`Команда: ${c.yellowBright(autoRespData[i].command)} для пользователя ${c.yellowBright(chat.userName)}.`);
                    await sendMessage(chat.node, autoRespData[i].response);
                    break;
                }
            }
    
            // Custom commands

            if(config.autoIssueTestCommand == true && chat.message.includes("!автовыдача")) {
                const goodName = chat.message.split(`"`)[1];
                if(!goodName) {
                    log(`Команда: ${c.yellowBright('!автовыдача')} для пользователя ${c.yellowBright(chat.userName)}: товар не указан.`, `c`);
                    await sendMessage(chat.node, `Товар не указан. Укажите название предложения в кавычках (").`);
                    break;
                }

                log(`Команда: ${c.yellowBright('!автовыдача')} для пользователя ${c.yellowBright(chat.userName)}:`);
                let issueResult = await issueGood('', goodName, chat.node);

                if(!issueResult) {
                    await sendMessage(chat.node, `Товара "${goodName}" нет в списке автовыдачи`);
                    break;
                }

                if(issueResult == 'notInStock') {
                    await sendMessage(chat.node, `Товар закончился`);
                    break;
                }
            }
        }
    } catch (err) {
        log(`Ошибка при автоответе: ${err}`, 'r');
        isAutoRespBusy = false;
    }

    isAutoRespBusy = false;
    return result;
}

async function getMessages(senderId) {
    let result = false;
    try {
        const url = `${getConst('api')}/chat/history?node=users-${global.appData.id}-${senderId}&last_message=1000000000`;
        const headers = { 
            "cookie": `golden_key=${config.token}`,
            "x-requested-with": "XMLHttpRequest"
        };

        const options = {
            method: 'GET',
            headers: headers
        }

        const resp = await fetch(url, options);
        result = await resp.json();
    } catch (err) {
        log(`Ошибка при получении сообщений: ${err}`, 'r');
    }
    return result;
}

async function getLastMessageId(senderId) {
    let lastMessageId = 1000000000;
    try {
        let chat = await getMessages(senderId);
        if(!chat) return lastMessageId;
        chat = chat['chat'];
        if(!chat) return lastMessageId;

        const messages = chat.messages;
        lastMessageId = messages[messages.length - 1].id;
    } catch (err) {
        log(`Ошибка при получении id сообщения: ${err}`, 'r');
    }

    return lastMessageId;
}

async function sendMessage(node, message, customNode = false) {
    if(!message || message == undefined || !node || node == undefined) return;

    let result = false;
    let maxRetries = 6;
    let tries = 1;
    let delay = 0;

    try {
        while(result == false) {
            if(tries > maxRetries) break;

            const url = `${getConst('api')}/runner/`;
            const headers = {
                "accept": "*/*",
                "cookie": `golden_key=${config.token}; PHPSESSID=${global.appData.sessid}`,
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest"
            };

            let lastMessageId = 1000000000;
            if(customNode) {
                lastMessageId = await getLastMessageId(node);
                node = `users-${global.appData.id}-${node}`;
            }

            let reqMessage = message;
            if(config.watermark && config.watermark != '') {
                reqMessage = `${config.watermark}\n${message}`;
            }

            const request = {
                "action": "chat_message",
                "data": {
                    "node": node,
                    "last_message": lastMessageId,
                    "content": reqMessage
                }
            };

            const params = new URLSearchParams();
            params.append('objects', '');
            params.append('request', JSON.stringify(request));
            params.append('csrf_token', global.appData.csrfToken);

            const options = {
                method: 'POST',
                body: params,
                headers: headers
            };

            const resp = await fetch(url, options, delay);
            const json = await resp.json();

            if(json.response && json.response.error == null) {
                log(`Сообщение отправлено, чат node ${c.yellowBright(node)}.`, 'g');
                result = true;
            } else {
                log(`Не удалось отправить сообщение, node: "${node}", сообщение: "${reqMessage}"`, 'r');
                log(`Запрос:`);
                log(options);
                log(`Ответ:`);
                log(json);
                result = false;
            }

            tries++;
            delay += 10000;
        }
    } catch (err) {
        log(`Ошибка при отправке сообщения: ${err}`, 'r');
    }
    return result;
}

async function getNodeByUserName(userName) {
    let node = null;

    try {
        const bookmarks = await getChatBookmarks();
        if(!bookmarks) return null;

        for(let i = 0; i < bookmarks.length; i++) {
            const chat = bookmarks[i];

            if(chat.userName == userName) {
                node = chat.node;
                break;
            }
        }
    } catch(err) {
        log(`Ошибка при получении node: ${err}`, 'e');
    }

    return node;
}

async function getChatBookmarks() {
    let result = [];
    try {
        const url = `${getConst('api')}/runner/`;
        const headers = {
            "accept": "*/*",
            "cookie": `golden_key=${config.token}; PHPSESSID=${global.appData.sessid}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        };
    
        const chat_bookmarks =  {
            "type": "chat_bookmarks",
            "id": `${global.appData.id}`,
            "tag": `${getRandomTag()}`,
            "data": false
        };
    
        const objects = [chat_bookmarks];
        const params = new URLSearchParams();
        params.append('objects', JSON.stringify(objects));
        params.append('request', false);
        params.append('csrf_token', global.appData.csrfToken);
    
        const options = {
            method: 'POST',
            body: params,
            headers: headers
        };
    
        const resp = await fetch(url, options);
        const json = await resp.json();
    
        const html = json.objects[0].data.html;
    
        const doc = parseDOM(html);
        const chats = doc.querySelectorAll(".contact-item");
    
        for(let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            
            let userName = chat.querySelector('.media-user-name').innerHTML;
            let message = chat.querySelector('.contact-item-message').innerHTML;
            let time = chat.querySelector('.contact-item-time').innerHTML;
            let node = chat.dataset.id;
    
            result.push({
                userName: userName,
                message: message,
                time: time,
                node: node
            });
        }
    
        return result;
    } catch (err) {
        log(`Ошибка при получении списка сообщений: ${err}`, 'e');
    }
}

export { getMessages, sendMessage, getChatBookmarks, autoResponse, enableAutoResponse, getLastMessageId, getNodeByUserName };