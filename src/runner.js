import { log } from './log.js';
import { getConst } from './storage.js';
import { getRandomTag } from './activity.js';
import { load } from './storage.js';
import { parseDOM } from './DOMParser.js';
import fetch from './fetch.js';

const config = global.settings;

class Runner {
    constructor() {
        this.newOrderCallback = () => {};
        this.newMessageCallback = () => {};

        this.lastMessages = [];
        this.lastMessagesCount = 0;
        this.lastOrdersCount = 0;
    }

    start() {
        setInterval(() => this.loop(), 6000);
        log('Обработка событий запущена.', 'g');
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
                "tag": `${getRandomTag()}`,
                "data": false
            };
    
            const chat_bookmarks =  {
                "type": "chat_bookmarks",
                "id": `${appData.id}`,
                "tag": `${getRandomTag()}`,
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
                    this.checkForNewOrders(resObjects[i].data);
                }
    
                if(resObjects[i].type == "chat_bookmarks") {
                    this.checkForNewMessages(resObjects[i].data);
                }
            }
        } catch (err) {
            log(`Ошибка при обработке событий: ${err}`, 'e');
        }
    }

    checkForNewOrders(object) {
        if(!object) return;
        const seller = object.seller;

        if(seller != this.lastOrdersCount) {
            this.lastOrdersCount = seller;
            this.newOrderCallback();
        }
    }

    checkForNewMessages(object) {
        if(!object) return;
        const counter = object.counter;
        
        if(counter != this.lastMessagesCount) {
            this.lastMessagesCount = counter;
            this.newMessageCallback();
            return;
        }

        const html = object.html;
        const doc = parseDOM(html);
        const chats = doc.querySelectorAll(".contact-item");

        let messages = [];
    
        for(let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            
            let message = chat.querySelector('.contact-item-message').innerHTML;
            messages.push(message);
        }

        for(let i = 0; i < messages.length; i++) {
            if(messages[i] != this.lastMessages[i]) {
                this.lastMessages = messages.slice();
                this.newMessageCallback();
                return;
            }
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