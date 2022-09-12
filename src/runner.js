import { log } from './log.js';
import { getConst } from './storage.js';
import { getRandomTag } from './activity.js';
import fetch from './fetch.js';

const config = global.settings;

class Runner {
    constructor() {
        this.newOrderCallback = () => {};
        this.newMessageCallback = () => {};

        this.lastMessages = [];
        this.lastMessagesCount = 0;
        this.lastOrdersCount = 0;

        this.ordersTag = getRandomTag();
        this.messagesTag = getRandomTag();
    }

    start() {
        setInterval(() => this.loop(), 6000);
        //log('Обработка событий запущена.', 'g');
    }

    async loop() {
        try {
            const appData = global.appData;

            const url = `${getConst('api')}/runner/`;
            const headers = {
                "accept": "*/*",
                "cookie": `golden_key=${config.token}; PHPSESSID=${appData.sessid}`,
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest"
            };
    
            const orders_counters = {
                "type": "orders_counters",
                "id": `${appData.id}`,
                "tag": `${this.ordersTag}`,
                "data": false
            };
    
            const chat_bookmarks =  {
                "type": "chat_bookmarks",
                "id": `${appData.id}`,
                "tag": `${this.messagesTag}`,
                "data": false
            };
    
            const objects = [orders_counters, chat_bookmarks];
            const params = new URLSearchParams();
            params.append('objects', JSON.stringify(objects));
            params.append('request', 'false');
            params.append('csrf_token', appData.csrfToken);
    
            const options = {
                method: 'POST',
                body: params,
                headers: headers
            };
    
            const resp = await fetch(url, options);
            if(!resp || !resp.ok) {
                log('Ошибка при запросе в цикле событий.', 'c');
                return;
            }
    
            const json = await resp.json();
            const resObjects = json.objects;
    
            for(let i = 0; i < resObjects.length; i++) {
                if(resObjects[i].type == "orders_counters") {
                    this.ordersTag = resObjects[i].tag;
                    this.newOrderCallback();
                }
    
                if(resObjects[i].type == "chat_bookmarks") {
                    this.messagesTag = resObjects[i].tag;
                    this.newMessageCallback();
                }
            }
        } catch (err) {
            log(`Ошибка при обработке событий: ${err}`, 'e');
        }
    }

    registerNewOrderCallback(callback) {
        this.newOrderCallback = callback;
    }

    registerNewMessageCallback(callback) {
        this.newMessageCallback = callback;
    }
}

export default Runner;