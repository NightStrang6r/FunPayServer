import fetch from 'node-fetch';
import { log } from './log.js';
import { parseDOM } from './DOMParser.js';
import { sendMessage } from './chat.js';
import { load, updateFile } from './storage.js';
import Delays from './delays.js';
const delays = new Delays();

const goodsfilePath = 'data/autoIssueGoods.json';
const config = load('config.json');
let goods = load(goodsfilePath);

async function enableAutoIssue(timeout) {
    let backupOrders = await getOrders();
    let orders = [];

    setInterval(async () => {
        try {
            log(`Проверяем на наличие новых заказов...`);
            orders = await getNewOrders(backupOrders);
            if(!orders || !orders.newOrders[0]) {
                //log(`Новых заказов нет.`);
                return;
            }
            log(orders.newOrders);
    
            const order = orders.newOrders[0];
            if(order) {
                issueGood(order.buyerId, order.name);
                backupOrders = orders.backupOrders;
            }
        } catch (err) {
            log(`Ошибка при автовыдаче: ${err}`);
        }
    }, timeout);

    log(`Автовыдача запущена, загружено ${goods.length} товара(ов).`);
}

async function issueGood(buyerId, goodName) {
    try {
        goods = load(goodsfilePath);
        let message = "";
        
        for(let i = 0; i < goods.length; i++) {
            if(goods[i].name == goodName) {
                if(goods[i].message != undefined) {
                    message = goods[i].message;
                    break;
                } 
                else
                if(goods[i].nodes != undefined) {
                    for(let j = 0; j < goods[i].nodes.length; j++) {
                        const node = goods[i].nodes[j];
    
                        if(node.sold == false) {
                            goods[i].nodes[j].sold = true;
                            updateFile(goods, goodsfilePath);
                            message = node.message;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        if(message != "") {
            await sendMessage(buyerId, message).then(res => {log(res)});
            log(`Товар "${goodName}" выдан пользователю ${buyerId} с сообщением:`);
            log(message);
        } else {
            log(`Товара "${goodName}" нет в списке автовыдачи, пропускаю.`);
        }
    } catch (err) {
        log(`Ошибка при выдаче товара: ${err}`);
    }
}

async function getGood(orderName) {
    let result = false;
    try {
        goods = load(goodsfilePath);
    
        for(let i = 0; i < goods.length; i++) {
            if(orderName == goods[i].name) {
                result = goods[i];
                break;
            }
        }
    } catch (err) {
        log(`Ошибка при поиске заказов по нику: ${err}`);
    }

    return result;
}

async function addDeliveredName(orderName, name, orderId) {
    try {
        goods = load(goodsfilePath);
        
        for(let i = 0; i < goods.length; i++) {
            if(orderName === goods[i].name) {
                if(goods[i].delivered == undefined) {
                    goods[i].delivered = [];
                }

                goods[i].delivered.push({
                    name: name, order: orderId
                });
                updateFile(goods, goodsfilePath);
                break;
            }
        }
    } catch (err) {
        log(`Ошибка при записи новых ников к заказу: ${err}`);
    }
}

async function searchOrdersByUserName(userName) {
    let result = [];
    try {
        goods = load(goodsfilePath);
    
        const orders = await getOrders();
    
        for(let i = 0; i < orders.length; i++) {
            if (orders[i].buyerName == userName) {
                result[result.length] = orders[i];
            }
        }
    } catch (err) {
        log(`Ошибка при поиске заказов по нику: ${err}`);
    }

    return result;
}

async function getNewOrders(lastOrders) {
    if(!lastOrders || !lastOrders[0]) {
        log(`Начальные данные по заказам не переданы`);
        return;
    }
    let result = [];
    let orders = [];

    try {
        orders = await getOrders();
        if(!orders || !orders[0]) {
            log(`Список продаж пуст`);
            return;
        }
    
        const lastOrderId = lastOrders[0].id;
        
        for(let i = 0; i < orders.length; i++) {
            if(orders[i].id == lastOrderId) {
                break;
            }
                
            result[i] = orders[i];
        }
    } catch(err) {
        log(`Ошибка при получении новых заказов: ${err}`);
    }

    return {newOrders: result, backupOrders: orders};
}

async function getOrders() {
    let result = [];
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

        let resp = await fetch(url, options);
        await delays.sleep();
        
        const data = await resp.text();
        const doc = parseDOM(data);
        const ordersEl = doc.querySelectorAll(".tc-item");

        for(let i = 0; i < ordersEl.length; i++) {
            const order = ordersEl[i];
            const id = order.querySelector(".tc-order").innerHTML;
            const name = order.querySelector(".order-desc").firstElementChild.innerHTML.split(", ")[1];
            const buyerName = order.querySelector(".media-user-name > span").innerHTML;
            const buyerProfileLink = order.querySelector(".avatar-photo").dataset.href.split("/");
            const buyerId = buyerProfileLink[buyerProfileLink.length - 2];
            const status = order.querySelector(".tc-status").innerHTML;
            const price = Number(order.querySelector(".tc-price").firstChild.textContent);

            result[i] = {
                id: id,
                name: name,
                buyerId: buyerId,
                buyerName: buyerName,
                status: status,
                price: price
            }
        }

        return result;
    } catch (err) {
        log(`Ошибка при получении списка продаж: ${err}`);
    }
    return result;
}

export { getOrders, getNewOrders, issueGood, searchOrdersByUserName, getGood, addDeliveredName, enableAutoIssue };