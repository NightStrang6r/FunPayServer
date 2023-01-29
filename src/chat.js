// MODULES
const fetch = global.fetch;
const c = global.chalk;
const log = global.log;
const parseDOM = global.DOMParser;
const { load, getConst } = global.storage;
const { getRandomTag } = global.activity;

// CONSTANTS
const settings = global.settings;
const autoRespData = await load('data/configs/autoResponse.json');

let isAutoRespBusy = false;

function enableAutoResponse() {
    log(`Автоответ запущен.`);
}

async function processMessages() {
    if(isAutoRespBusy) return;
    isAutoRespBusy = true;
    let result = false;

    try {
        const chats = await getChatBookmarks();
        for(let j = 0; j < chats.length; j++) {
            const chat = chats[j];

            // Notification
            if(chat.isUnread && global.telegramBot && settings.newMessageNotification) {
                if(!chat.message.includes(settings.watermark))
                    global.telegramBot.sendNewMessageNotification(chat);
            }
    
            // Command logic here
    
            // Commands in file
            for(let i = 0; i < autoRespData.length; i++) {
                if(autoRespData[i].command && chat.message.toLowerCase() == autoRespData[i].command.toLowerCase()) {
                    log(`Команда: ${c.yellowBright(autoRespData[i].command)} для пользователя ${c.yellowBright(chat.userName)}.`);
                    await sendMessage(chat.node, autoRespData[i].response);
                    break;
                }

                /*if(autoRespData[i].word && chat.message.toLowerCase().includes(autoRespData[i].word.toLowerCase())) {
                    log(`Ключевое слово: ${c.yellowBright(autoRespData[i].word)} для пользователя ${c.yellowBright(chat.userName)}.`);
                    await sendMessage(chat.node, autoRespData[i].response);
                    break;
                }*/
            }
    
            // Custom commands

            if(settings.autoIssueTestCommand == true && chat.message.includes("!автовыдача")) {
                const goodName = chat.message.split(`"`)[1];
                if(!goodName) {
                    log(`Команда: ${c.yellowBright('!автовыдача')} для пользователя ${c.yellowBright(chat.userName)}: товар не указан.`, `c`);
                    await sendMessage(chat.node, `Товар не указан. Укажите название предложения в кавычках (").`);
                    break;
                }

                log(`Команда: ${c.yellowBright('!автовыдача')} для пользователя ${c.yellowBright(chat.userName)}:`);
                const { issueGood } = global.sales;
                let issueResult = await issueGood(chat.node, chat.userName, goodName, 'node');

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
            "cookie": `golden_key=${settings.golden_key}`,
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
    let lastMessageId = -1;
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

    try {
        let newNode = node;
        const url = `${getConst('api')}/runner/`;
        const headers = {
            "accept": "*/*",
            "cookie": `golden_key=${settings.golden_key}; PHPSESSID=${global.appData.sessid}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        };

        if(customNode) {
            if(newNode > global.appData.id) {
                newNode = `users-${global.appData.id}-${node}`;
            } else {
                newNode = `users-${node}-${global.appData.id}`;
            }
        }

        let reqMessage = message;
        if(settings.watermark && settings.watermark != '') {
            reqMessage = `${settings.watermark}\n${message}`;
        }

        const request = {
            "action": "chat_message",
            "data": {
                "node": newNode,
                "last_message": -1,
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

        const resp = await fetch(url, options);
        const json = await resp.json();

        if(json.response && json.response.error == null) {
            log(`Сообщение отправлено, чат node ${c.yellowBright(newNode)}.`, 'g');
            result = true;
        } else {
            log(`Не удалось отправить сообщение, node: "${newNode}", сообщение: "${reqMessage}"`, 'r');
            log(`Запрос:`);
            log(options);
            log(`Ответ:`);
            log(json);
            result = false;
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
            "cookie": `golden_key=${settings.golden_key}; PHPSESSID=${global.appData.sessid}`,
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
            let node = chat.getAttribute('data-id');
            let isUnread = chat.getAttribute('class').includes('unread');
    
            result.push({
                userName: userName,
                message: message,
                time: time,
                node: node,
                isUnread: isUnread
            });
        }
    
        return result;
    } catch (err) {
        log(`Ошибка при получении списка сообщений: ${err}`, 'e');
    }
}

export { getMessages, sendMessage, getChatBookmarks, processMessages, enableAutoResponse, getLastMessageId, getNodeByUserName };