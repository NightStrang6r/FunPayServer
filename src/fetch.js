// MODULES
const fetch = global.node_fetch;
const proxy = global.https_proxy_agent;
const { exit, sleep } = global.helpers;
const log = global.log;

// CONSTANTS
const settings = global.settings;
let retriesErrCounter = 0;

// PROXY
if(settings.proxy.useProxy == true) {
    if(!settings.proxy.type || !settings.proxy.host) {
        log(`Неверные данные прокси!`, 'r');
        await exit();
    }

    log(`Для обработки запросов используется ${settings.proxy.type} прокси: ${settings.proxy.host}`, 'g');
}

// FETCH FUNCTION
export default async function fetch_(url, options, delay = 0, retries = 20) {
    try {
        let tries = 1;
        if(retriesErrCounter > 5) {
            log(`Превышен максимальный лимит безуспешных попыток запросов!`, 'r');
            await exit();
        }

        // Adding user-agent
        if(!options) options = {};
        if(!options.headers) options.headers = {};
        if(!options.headers['User-Agent']) options.headers['User-Agent'] = settings.userAgent;

        // Adding proxy
        if(settings.proxy.useProxy == true) {
            let proxyString = '';

            if(settings.proxy.login || settings.proxy.pass) {
                proxyString = `${settings.proxy.type}://${settings.proxy.login}:${settings.proxy.pass}@${settings.proxy.host}:${settings.proxy.port}`;
            } else {
                proxyString = `${settings.proxy.type}://${settings.proxy.host}:${settings.proxy.port}`;
            }
            
            const agent = new proxy(proxyString);
            options.agent = agent;
        }

        // Adding delay
        await sleep(delay);

        // Making request
        let res = await fetch(url, options);

        // Retrying if necessary
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
            await sleep(2000);
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