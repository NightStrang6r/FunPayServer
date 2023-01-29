// MODULES
const fs = global.fs_extra;
const c = global.chalk;
const inq = global.inquirer;
const ConfigParser = global.config_parser;
const log = global.log;
const { exit } = global.helpers;

// CONSTANTS
const _dirname = process.cwd();

const dataFolder = 'data';
const logsFolder = 'logs';
const configFolder = 'configs';
const otherFolder = 'other';

const dataPath = `${_dirname}/${dataFolder}`;
const logsPath = `${dataPath}/${logsFolder}`;
const configPath = `${dataPath}/${configFolder}`;
const otherPath = `${dataPath}/${otherFolder}`;

const config = new ConfigParser();

// START
await initStorage();
global.settings = await loadSettings();

// FUNCTIONS
async function initStorage() {
    try {
        const configFiles = [
            "delivery.json", 
            "autoResponse.json"
        ];

        const otherFiles = [
            "categories.json", 
            "categoriesCache.json", 
            "goodsState.json",
            "telegram.txt"
        ];
    
        if(!(await fs.exists(dataPath))) {
            await fs.mkdir(dataPath);
        }

        if(!(await fs.exists(logsPath))) {
            await fs.mkdir(logsPath);
        }

        if(!(await fs.exists(configPath))) {
            await fs.mkdir(configPath);
        }

        if(!(await fs.exists(otherPath))) {
            await fs.mkdir(otherPath);
        }
    
        for(let i = 0; i < configFiles.length; i++) {
            const file = configFiles[i];

            if(!(await fs.exists(`${configPath}/${file}`))) {
                await fs.writeFile(`${configPath}/${file}`, '[]');
            }
        }

        for(let i = 0; i < otherFiles.length; i++) {
            const file = otherFiles[i];

            if(!(await fs.exists(`${otherPath}/${file}`))) {
                await fs.writeFile(`${otherPath}/${file}`, '[]');
            }
        }
    } catch (err) {
        log(`Не удалось создать файлы хранилища: ${err}`);
    }
}

async function loadSettings() {
    try {
        let uri = `${_dirname}/settings.txt`;
        let settings = {};
        
        if(!(await fs.exists(uri))) {
            const answers = await askSettings();

            settings = {
                golden_key: answers.golden_key,
                userAgent: answers.userAgent,
                alwaysOnline: answers.alwaysOnline,
                lotsRaise: answers.lotsRaise,
                goodsStateCheck: answers.goodsStateCheck, 
                autoIssue: answers.autoIssue, 
                autoResponse: answers.autoResponse, 
                autoIssueTestCommand: 0,
                telegramBot: answers.telegramBot,
                telegramToken: answers.telegramToken,
                userName: '',
                newMessageNotification: 0,
                newOrderNotification: 0,
                lotsRaiseNotification: 0,
                deliveryNotification: 0,
                watermark: "[ 🔥NightBot ]",
                proxy: {
                    useProxy: 0,
                    host: "",
                    port: 3128,
                    login: "",
                    pass: "",
                    type: "http"
                }
            };

            await saveConfig(settings);
        } else {
            settings = await loadConfig();
        }

        if(!checkGoldenKey(settings.golden_key)) {
            log('Невалидный токен (golden_key).', 'r');
            await exit();
        }

        return settings;
    } catch (err) {
        log(`Ошибка при загрузке файла настроек: ${err}. Программа будет закрыта.`, 'r');
        await exit();
    }
}

function loadConfig() {
    config.read(`${_dirname}/settings.txt`);
    
    let settings = {
        golden_key: config.get('FunPay', 'golden_key'),
        userAgent: config.get('FunPay', 'user_agent'),
        alwaysOnline: config.get('FunPay', 'alwaysOnline'),
        lotsRaise: config.get('FunPay', 'lotsRaise'),
        goodsStateCheck: config.get('FunPay', 'goodsStateCheck'),
        autoIssue: config.get('FunPay', 'autoDelivery'),
        autoResponse: config.get('FunPay', 'autoResponse'),
        autoIssueTestCommand: config.get('FunPay', 'autoDeliveryTestCommand'),
        telegramBot: config.get('Telegram', 'enabled'),
        telegramToken: config.get('Telegram', 'token'),
        userName: config.get('Telegram', 'userName'),
        newMessageNotification: config.get('Telegram', 'newMessageNotification'),
        newOrderNotification: config.get('Telegram', 'newOrderNotification'),
        lotsRaiseNotification: config.get('Telegram', 'lotsRaiseNotification'),
        deliveryNotification: config.get('Telegram', 'deliveryNotification'),
        watermark: "[ 🔥NightBot ]",
        proxy: {
            useProxy: config.get('Proxy', 'enabled'),
            host: config.get('Proxy', 'host'),
            port: config.get('Proxy', 'port'),
            login: config.get('Proxy', 'login'),
            pass: config.get('Proxy', 'pass'),
            type: config.get('Proxy', 'type')
        }
    };

    return settings;
}

async function saveConfig(settings) {
    let data = await fs.readFile(`${_dirname}/s.example`, 'utf-8');
    
    data = setValue(data, 'FunPay', 'golden_key', settings.golden_key);
    data = setValue(data, 'FunPay', 'user_agent', settings.userAgent);
    data = setValue(data, 'FunPay', 'alwaysOnline', settings.alwaysOnline);
    data = setValue(data, 'FunPay', 'lotsRaise', settings.lotsRaise);
    data = setValue(data, 'FunPay', 'goodsStateCheck', settings.goodsStateCheck);
    data = setValue(data, 'FunPay', 'autoDelivery', settings.autoIssue);
    data = setValue(data, 'FunPay', 'autoResponse', settings.autoResponse);
    data = setValue(data, 'FunPay', 'autoDeliveryTestCommand', settings.autoIssueTestCommand);
    data = setValue(data, 'FunPay', 'waterMark', settings.watermark);
    data = setValue(data, 'Telegram', 'enabled', settings.autoResponse)
    data = setValue(data, 'Telegram', 'token', settings.telegramToken);
    data = setValue(data, 'Telegram', 'userName', settings.telegramUserName);
    data = setValue(data, 'Telegram', 'newMessageNotification', settings.newMessageNotification);
    data = setValue(data, 'Telegram', 'newOrderNotification', settings.newOrderNotification);
    data = setValue(data, 'Telegram', 'lotsRaiseNotification', settings.lotsRaiseNotification);
    data = setValue(data, 'Telegram', 'deliveryNotification', settings.deliveryNotification);
    data = setValue(data, 'Proxy', 'enabled', settings.proxy.useProxy);
    data = setValue(data, 'Proxy', 'host', settings.proxy.host);
    data = setValue(data, 'Proxy', 'port', settings.proxy.port);
    data = setValue(data, 'Proxy', 'login', settings.proxy.login);
    data = setValue(data, 'Proxy', 'pass', settings.proxy.pass);
    data = setValue(data, 'Proxy', 'type', settings.proxy.type);

    await fs.writeFile(`./settings.txt`, data);
}

function setValue(file, section, name, value) {
    let sections = file.split(`[${section}]`);
    let currentSection = sections[1];
    let strings = currentSection.split('\r\n');

    for(let i = 0; i < strings.length; i++) {
        let str = strings[i];
        if(str.includes(name)) {
            strings[i] = `${name}: ${value}`;
            break;
        }
    }

    currentSection = strings.join('\r\n');
    sections[1] = currentSection;
    file = sections.join(`[${section}]`);

    return file;
}

async function load(uri) {
    let result = false;
    try {
        uri = `${_dirname}/${uri}`;
        
        if(!(await fs.exists(uri))) {
            await fs.writeFile(uri, '');
            return result;
        }

        const rawdata = await fs.readFile(uri, 'utf-8');
        result = JSON.parse(rawdata);
    } catch (err) {
        log(`Ошибка при загрузке файла "${uri}". Возможно файл имеет неверную кодировку (поддерживается UTF-8), либо неверный формат JSON: ${err}`, 'r');
    }
    return result;
}

async function updateFile(content, filePath) {
    let result = false;
    filePath = `${_dirname}/${filePath}`;

    try {
        await fs.writeFile(filePath, JSON.stringify(content, null, 4));
        result = true;
    } catch(err) {
        log(`Ошибка записи файла: ${err}`, 'r');
        result = false;
    }

    return result;
}

function checkGoldenKey(golden_key) {
    if(!golden_key || golden_key.length != 32) return false;
    return true;
}

function checkTelegramToken(token) {
    if(!token || token.length != 46) return false;
    return true;
}

function getConst(name) {
    switch (name) {
        case 'api': return 'https://funpay.com';
        case 'autoIssueFilePath': return `${dataPath}/configs/delivery.json`;
        case 'chatId': 
            if(!global.settings.chatId)  {
                global.settings.chatId = fs.readFileSync(`${otherPath}/telegram.txt`, 'utf8');
            }
            return global.settings.chatId;
    }
}

function setConst(name, value) {
    switch (name) {
        case 'chatId':
            global.settings.chatId = value;
            fs.writeFileSync(`${otherPath}/telegram.txt`, value.toString());
            break;
    }
}

async function loadAutoIssueFile() {
    return await fs.readFile(`${_dirname}/data/configs/delivery.json`, 'utf8');
}

async function askSettings() {
    const question1 = await inq.prompt([{
        name: 'golden_key',
        type: 'input',
        message: `Введите golden_key. Его можно получить из cookie с сайта FunPay при помощи расширения EditThisCookie:`,
        validate: function (input) {
            const done = this.async();
        
            if (!checkGoldenKey(input)) {
                done('Невалидный токен (golden_key).');
                return;
            }

            done(null, true);
        }
    },
    {
        name: 'userAgent',
        type: 'input',
        message: `Введите User-Agent браузера, с которого выполнялся вход на сайт FunPay. Его можно получить тут: https://n5m.ru/usagent.html`
    }]);

    const question2 = await inq.prompt({
        name: 'autoSettings',
        type: 'list',
        message: `Запуск бота выполняется впервые. Вы хотите настроить функции бота или оставить все параметры по умолчанию? Эти параметры всегда можно поменять в файле ${c.yellowBright('settings.txt')}:`,
        choices: ['Оставить по умолчанию', 'Настроить']
    });

    let telegramToken = '';

    if(question2.autoSettings == 'Оставить по умолчанию') {
        console.log();
        return {
            golden_key: question1.golden_key,
            userAgent: question1.userAgent,
            telegramBot: 0,
            telegramToken: telegramToken,
            alwaysOnline: 1,
            lotsRaise: 1,
            goodsStateCheck: 1,
            autoIssue: 1,
            autoResponse: 1
        }
    }

    const question3 = await inq.prompt({
        name: 'telegramBot',
        type: 'list',
        message: `Включить управление программой через телеграм бота (понадобится токен бота)?`,
        choices: ['Да', 'Нет']
    });
    
    if(question3.telegramBot == 'Да') {
        const question4 = await inq.prompt({
            name: 'telegramToken',
            type: 'input',
            message: `Введите токен Telegram бота, который вы получили от BotFather:`,
            validate: function (input) {
                const done = this.async();
            
                if (!checkTelegramToken(input)) {
                    done('Невалидный токен.');
                    return;
                }
    
                done(null, true);
            }
        });

        telegramToken = question4.telegramToken;
    }

    const answers = await inq.prompt([{
        name: 'alwaysOnline',
        type: 'list',
        message: `Включить функцию вечного онлайна?`,
        choices: ['Да', 'Нет']
    },
    {
        name: 'lotsRaise',
        type: 'list',
        message: `Включить функцию автоматического поднятия предложений?`,
        choices: ['Да', 'Нет']
    },
    {
        name: 'autoIssue',
        type: 'list',
        message: `Включить функцию автовыдачи товаров (не забудьте потом её настроить в файле delivery.json)?`,
        choices: ['Да', 'Нет']
    },
    {
        name: 'goodsStateCheck',
        type: 'list',
        message: `Включить функцию автоактивации товаров после продажи?`,
        choices: ['Да', 'Нет']
    },
    {
        name: 'autoResponse',
        type: 'list',
        message: `Включить функцию автоответа на команды (настройка в файле autoResponse.json)?`,
        choices: ['Да', 'Нет']
    }]);

    const askSettings = {
        golden_key: question1.golden_key,
        userAgent: question1.userAgent,
        telegramBot: (question3.telegramBot == 'Да') ? 1 : 0,
        telegramToken: telegramToken,
        alwaysOnline: (answers.alwaysOnline == 'Да') ? 1 : 0,
        lotsRaise: (answers.lotsRaise == 'Да') ? 1 : 0,
        goodsStateCheck: (answers.goodsStateCheck == 'Да') ? 1 : 0,
        autoIssue: (answers.autoIssue == 'Да') ? 1 : 0,
        autoResponse: (answers.autoResponse == 'Да') ? 1 : 0
    }

    console.log();
    return askSettings;
}

export { updateFile, initStorage, load, loadSettings, getConst, setConst, loadAutoIssueFile };