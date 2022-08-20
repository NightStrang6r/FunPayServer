import fetch from './fetch.js';
import { log } from './log.js';
import { parseDOM } from './DOMParser.js';
import { load, loadSettings, getConst } from './storage.js';
import { issueGood, getGood, addDeliveredName, searchOrdersByUserName } from './sales.js'
import { getSteamCode } from './email.js';
import { getUserData } from './account.js';
import { getRandomTag } from './activity.js';

const config = loadSettings();
const autoRespData = load('data/autoResponse.json');
let appData = load('data/appData.json');

let isAutoRespBusy = false;

function enableAutoResponse(timeout) {
    setInterval(autoResponse, timeout);
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
                    log(`Команда: ${autoRespData[i].command}, ответ: ${autoRespData[i].response} для пользователя ${chat.userName}`);
                    await sendMessage(chat.node, autoRespData[i].response);
                    break;
                }
            }
    
            // Custom commands

            if(config.autoIssueTestCommand == true && chat.message.includes("!автовыдача")) {
                const goodName = chat.message.split(`"`)[1];
                if(!goodName) {
                    log(`Команда: !автовыдача для пользователя ${chat.userName}: товар не указан.`, `c`);
                    await sendMessage(chat.node, `Товар не указан. Укажите название предложения в кавычках (").`);
                    break;
                }

                log(`Команда: !автовыдача для пользователя ${chat.userName}:`);
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

            if(chat.message.toLowerCase() == "!код") {
                const orders = await searchOrdersByUserName(chat.userName);
                if(orders.length == 0) {
                    await sendMessage(chat.node, `На данный момент нет соответствующих заказов для вызова данной команды.`);
                    isAutoRespBusy = false;
                    break;
                }
                const order = orders[0];
                const good = await getGood(order.name);
                const delivered = good.delivered;
                let alreadyDelivered = false;
            
                for(let i = 0; i < delivered.length; i++) {
                    if(delivered[i].name == order.buyerName && delivered[i].order == order.id) {
                        alreadyDelivered = true;
                        break;
                    }
                }
    
                if(!alreadyDelivered) {
                    //sendMessage(chat.node, `Получаем код. Пожалуйста, подождите.`);
                    const codeResult = await getSteamCode(good.email, good.pass, good.server);
                    let code = false;

                    if(codeResult.error != true) {
                        code = codeResult.code;
                    } else {
                        if(codeResult.msg == "no-new-mails") {
                            await sendMessage(chat.node, `На данный момент новых кодов нет. Убедитесь, что вошли в нужный аккаунт в нужном лаунчере, либо попробуйте ещё раз через минуту.`);
                            break;
                        }
                    }

                    if(code) {
                        const res = await sendMessage(chat.node, `Code: ${code}`);
                        if(res) {
                            await addDeliveredName(order.name, order.buyerName, order.id);
                        }
                    }
                } else {
                    await sendMessage(chat.node, `К сожалению, вы уже получали код. Если у вас возникли проблемы со входом, напишите об этом сюда в чат. Продавец ответит вам при первой же возможности.`);
                }
                break;
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
        const url = `${getConst('api')}/chat/history?node=users-${appData.id}-${senderId}&last_message=1000000000`;
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

async function sendMessage(senderId, message, customNode = false) {
    if(!message || message == undefined || !senderId || senderId == undefined) return;

    let result = false;
    let maxRetries = 6;
    let tries = 1;
    let delay = 0;
    let node = "";

    try {
        while(result == false) {
            if(tries > maxRetries) break;

            await getUserData();
            appData = load('data/appData.json');

            const url = `${getConst('api')}/runner/`;
            const headers = {
                "accept": "*/*",
                "cookie": `golden_key=${config.token}; PHPSESSID=${appData.sessid}`,
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest"
            };

            let lastMessageId = 1000000000;
            if(!customNode) {
                node = senderId;
            } else {
                node = `users-${appData.id}-${senderId}`;
                lastMessageId = await getLastMessageId(senderId);
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
            params.append('csrf_token', appData.csrfToken);

            const options = {
                method: 'POST',
                body: params,
                headers: headers
            };

            const resp = await fetch(url, options, delay);
            const json = await resp.json();

            if(json.response && json.response.error == null) {
                log(`Сообщение отправлено, чат node ${node}.`, 'g');
                //log(`Сообщение отправлено, node: "${node}", сообщение: "${reqMessage}"`);
                // log(`Запрос:`);
                // log(options);
                // log(`Ответ:`);
                // log(json);
                result = true;
            } else {
                log(`Не удалось отправить сообщение, node: "${node}", сообщение: "${reqMessage}"`);
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
            "cookie": `golden_key=${config.token}; PHPSESSID=${appData.sessid}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        };
    
        const chat_bookmarks =  {
            "type": "chat_bookmarks",
            "id": `${appData.id}`,
            "tag": `${getRandomTag()}`,
            "data": false
        };
    
        const objects = [chat_bookmarks];
        const params = new URLSearchParams();
        params.append('objects', JSON.stringify(objects));
        params.append('request', false);
        params.append('csrf_token', appData.csrfToken);
    
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

export { getMessages, sendMessage, getChatBookmarks, enableAutoResponse, getLastMessageId, getNodeByUserName };