import fetch from 'node-fetch';
import { log } from './log.js';
import config from '../config.js';
import { parseDOM } from './DOMParser.js';
import { sendMessage } from './chat.js';
import issue from '../data/autoIssueGoods.js';

async function autoIssue() {
    let backupOrders = await getOrders();

    setInterval(() => {
        try {
            getNewOrders(backupOrders).then((orders) => {
                log(`Проверяем на наличие новых заказов...`);
                if(!orders.newOrders) return;
    
                const order = orders.newOrders[0];
                if(order) {
                    //issueGood(order.buyerId, order.name);
                    log(123);
                    backupOrders = order.backupOrders;
                }
            });
        } catch (err) {
            log(`Ошибка при автовыдаче: ${err}`);
        }
    }, 10000);
    log(`Автовыдача запущена.`);
}

function issueGood(buyerId, goodName) {
    const goods = issue.goods;
    let message = "";
    
    for(let i = 0; i < goods.length; i++) {
        if(goods[i].name == goodName) {
            if(goods[i].message != undefined) {
                message = goods[i].message;
                break;
            } 
            else
            if(goods[i].nodes != undefined) {
                for(let j = 0; j < goods[i].nodes; j++) {
                    const node = goods[i].nodes[j];

                    if(!node.sold) {
                        message = node.message;
                        break;
                    }
                }
            }
        }
    }
    if(message != "") {
        sendMessage(buyerId, message);
        log(`Товар ${goodName} выдан пользователю ${buyerId}`);
    }
}

function getNewOrders(lastOrders) {
    if(!lastOrders[0]) return;
    let result = false;

    try {
        result = getOrders().then(orders => {
            if(!orders[0]) return;
    
            const res = [];
            const lastOrderId = lastOrders[0].id;
        
            for(let i = 0; i < orders.length; i++) {
                if(orders[i].id == lastOrderId) {
                    break;
                }
                    
                res[i] = orders[i];
            }
    
            return {newOrders: res, backupOrders: orders};
        });
    } catch(err) {
        log(`Ошибка при получении новых заказов: ${err}`);
    }

    return result;
}

function getOrders() {
    let result = false;
    try {
        const url = `${config.api}/orders/trade`;
        const headers = {
            "cookie": `golden_key=${config.token}`,
            "x-requested-with": "XMLHttpRequest"
        };

        const options = {
            method: 'POST',
            headers: headers
        }

        result = fetch(url, options)
            .then(async resp => {
                const data = await resp.text();
                const doc = parseDOM(data);
                const ordersEl = doc.querySelectorAll(".tc-item");
                const res = [];

                for(let i = 0; i < ordersEl.length; i++) {
                    const order = ordersEl[i];
                    const id = order.querySelector(".tc-order").innerHTML;
                    const name = order.querySelector(".order-desc").firstElementChild.innerHTML;
                    const buyerProfileLink = order.querySelector(".avatar-photo").dataset.href.split("/");
                    const buyerId = buyerProfileLink[buyerProfileLink.length - 2];
                    const status = order.querySelector(".tc-status").innerHTML;
                    const price = Number(order.querySelector(".tc-price").firstChild.textContent);


                    res[i] = {
                        id: id,
                        name: name,
                        buyerId: buyerId,
                        status: status,
                        price: price
                    }
                }

                return res;
            });
    } catch (err) {
        log(`Ошибка при получении списка продаж: ${err}`);
    }
    return result;
}

export { getOrders, getNewOrders, issueGood, autoIssue };