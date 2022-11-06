import fetch from 'node-fetch';
import proxy from 'https-proxy-agent';
import { exit, sleep } from './event.js';
import { log } from './log.js';

const settings = global.settings;
let retriesErrCounter = 0;
let requestsDelay = 0;
if(settings.requestsDelay) requestsDelay = settings.requestsDelay;

if(settings.proxy.useProxy == true) {
    if(!settings.proxy.type || !settings.proxy.host) {
        log(`Неверные данные прокси!`, 'r');
        await exit();
    }

    log(`Для обработки запросов используется ${settings.proxy.type} прокси: ${settings.proxy.host}`, 'g');
}

export default async function fetch_(url, options, delay = 0, retries = 20) {
    try {
        let tries = 1;
        if(retriesErrCounter > 5) {
            log(`Превышен максимальный лимит безуспешных попыток запросов!`, 'r');
            await exit();
        }

        if(settings.proxy.useProxy == true) {
            if(!options) options = {};
            let proxyString = '';

            if(settings.proxy.login || settings.proxy.pass) {
                proxyString = `${settings.proxy.type}://${settings.proxy.login}:${settings.proxy.pass}@${settings.proxy.host}:${settings.proxy.port}`;
            } else {
                proxyString = `${settings.proxy.type}://${settings.proxy.host}:${settings.proxy.port}`;
            }
            
            const agent = new proxy(proxyString);
            options.agent = agent;
        }

        delay += requestsDelay;
        await sleep(delay);

        let res = await fetch(url, options);

        while(!res.ok) {
            if(tries > retries) {
                retriesErrCounter++;
                log(`Превышено количество попыток запроса.`);
                log(`Request:`);
                log(options);
                log(`Response:`);
                log(res);
                break;
            };
            await sleep(2000 + requestsDelay);
            res = await fetch(url, options);
            tries++;
        }

        retriesErrCounter = 0;
        return res;
    } catch (err) {
        log(`Ошибка при запросе (нет доступа к интернету / funpay): ${err}`);
        //return await fetch_(url, options, delay + 200, retries - 5);
    }
}