const logTime = true;
let time = Date.now();

if(logTime) console.log('Loading modules...');

// Node Modules
let t = Date.now();
global.commander = (await import('commander')).program;
if(logTime) console.log(`Commander loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.project_version = (await import('project-version')).default;
if(logTime) console.log(`Project version loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.fs_extra = (await import('fs-extra')).default;
if(logTime) console.log(`FS Extra loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.chalk = (await import('chalk')).default;
if(logTime) console.log(`Chalk loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.jsdom = (await import('jsdom')).JSDOM;
if(logTime) console.log(`JSDOM loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.inquirer = (await import('inquirer')).default;
if(logTime) console.log(`Inquirer loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.config_parser = (await import('configparser')).default;
if(logTime) console.log(`Configparser loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.node_fetch = (await import('node-fetch')).default;
if(logTime) console.log(`Node Fetch loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.https_proxy_agent = (await import('https-proxy-agent')).default;
if(logTime) console.log(`HTTPS Proxy Agent loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.telegraf = (await import('telegraf')).Telegraf;
if(logTime) console.log(`Telegraf loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.telegram_keyboard = (await import('telegram-keyboard')).Keyboard;
if(logTime) console.log(`Telegram Keyboard loaded in ${Date.now() - t}ms.`);

t = Date.now();
global.clone = (await import('clone')).default;
if(logTime) console.log(`Clone loaded in ${Date.now() - t}ms.`);

if(logTime) console.log(`Modules loaded in ${Date.now() - time}ms.`);

// Project Modules
// Base
global.log = (await import('./log.js')).default;
global.helpers = await import('./helpers.js');
global.storage = await import('./storage.js');
global.fetch = (await import('./fetch.js')).default;
global.DOMParser = (await import('./DOMParser.js')).default;

// Functional modules
global.raise = await import('./raise.js');
global.account = await import('./account.js');
global.categories = await import('./categories.js');
global.goods = await import('./goods.js');
global.activity = await import('./activity.js');
global.chat = await import('./chat.js');
global.sales = await import('./sales.js');

// Loops
global.runner = (await import('./runner.js')).default;
global.telegram = (await import('./telegram.js')).default;

let a;
export { a };