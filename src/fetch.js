// MODULES
const fetch = global.node_fetch;
const dns = global.dns;
const https = global.https;
const proxy = global.https_proxy_agent;
const { exit, sleep } = global.helpers;
const log = global.log;

// CONSTANTS
const settings = global.settings;
let retriesErrCounter = 0;

// DNS
dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

// PROXY
if(settings.proxy.useProxy == true) {
    if(!settings.proxy.type || !settings.proxy.host) {
        log(`Неверные данные прокси!`, 'r');
        await exit();
    }

    log(`Для обработки запросов используется ${settings.proxy.type} прокси: ${settings.proxy.host}`, 'g');
}

async function staticLookup(hostname, _, cb) {
    try {
        const ips = await dns.resolve(hostname);
  
        if(ips.length === 0) {
            throw new Error(`Unable to resolve ${hostname}`);
        }
      
        cb(null, ips[0], 4);
    } catch(err) {
        log(`Ошибка при получении IP адреса: ${err}`, 'r');
    }
};

function staticDnsAgent() {
    const httpModule = https;
    return new httpModule.Agent({ lookup: staticLookup });
};

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

        // Adding proxy or dns
        if(settings.proxy.useProxy == true) {
            let proxyString = '';

            if(settings.proxy.login || settings.proxy.pass) {
                proxyString = `${settings.proxy.type}://${settings.proxy.login}:${settings.proxy.pass}@${settings.proxy.host}:${settings.proxy.port}`;
            } else {
                proxyString = `${settings.proxy.type}://${settings.proxy.host}:${settings.proxy.port}`;
            }
            
            const agent = new proxy(proxyString);
            options.agent = agent;
        } else {
            options.agent = staticDnsAgent();
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