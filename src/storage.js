import fs from 'fs-extra';
import c from 'chalk';
import inq from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log, getDate } from './log.js';
import { exit } from './event.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const dataFolder = 'data';
const logPath = `${_dirname}/../${dataFolder}/log/`;

await initStorage();
global.settings = await loadSettings();

async function initStorage() {
    try {
        const files = [
            "autoIssueGoods.json", "autoResponse.json", "categories.json", "categoriesCache.json", "goodsState.json"
        ];
    
        if(!(await fs.exists(`${_dirname}/../${dataFolder}`))) {
            await fs.mkdir(`${_dirname}/../${dataFolder}`);
        }
    
        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!(await fs.exists(`${_dirname}/../${dataFolder}/${file}`))) {
                await fs.writeFile(`${_dirname}/../${dataFolder}/${file}`, '[]');
            }
        }
    } catch (err) {
        log(`Не удалось создать файлы хранилища: ${err}`);
    }
}

async function loadSettings() {
    try {
        let uri = `${_dirname}/../settings.json`;
        let settings = {};
        
        if(!(await fs.exists(uri))) {
            const answers = await askSettings();

            settings = {
                token: answers.token,
                telegramBot: answers.telegramBot,
                telegramToken: answers.telegramToken,
                telegramUserName: '',
                alwaysOnline: answers.alwaysOnline,
                lotsRaise: answers.lotsRaise,
                goodsStateCheck: answers.goodsStateCheck, 
                autoIssue: answers.autoIssue, 
                autoResponse: answers.autoResponse, 
                autoIssueTestCommand: false,
                proxy: {
                    useProxy: false,
                    host: "",
                    port: 3128,
                    login: "",
                    pass: "",
                    type: "http"
                },
                requestsDelay: 0,
                watermark: "[ 🔥NightBot ]"
            };

            settings = JSON.stringify(settings, null, 4);
            await fs.writeFile(uri, settings);
        }

        if(!settings.token) {
            const rawdata = await fs.readFile(uri);
            settings = JSON.parse(rawdata);
        }

        if(!checkToken(settings.token)) {
            log('Невалидный токен (golden_key).', 'r');
            await exit();
        }

        return settings;
    } catch (err) {
        log(`Ошибка при загрузке файла настроек: ${err}. Программа будет закрыта.`, 'r');
        await exit();
    }
}

async function load(uri) {
    let result = false;
    try {
        uri = `${_dirname}/../${uri}`;
        
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
    filePath = `${_dirname}/../${filePath}`;

    try {
        await fs.writeFile(filePath, JSON.stringify(content, null, 4));
        result = true;
    } catch(err) {
        log(`Ошибка записи файла: ${err}`, 'r');
        result = false;
    }

    return result;
}

function checkToken(token) {
    if(!token || token.length != 32) return false;
    return true;
}

function checkTelegramToken(token) {
    if(!token || token.length != 46) return false;
    return true;
}

function getConst(name) {
    switch (name) {
        case 'api': return 'https://funpay.com';
        case 'autoIssueFilePath': return `${_dirname}/../${dataFolder}/autoIssueGoods.json`;
    }
}

function setConst(name, value) {
    switch (name) {
        case 'telegramUserName': 
            global.settings.telegramUserName = value;
            fs.writeFileSync(`${_dirname}/../settings.json`, JSON.stringify(global.settings, null, 4)); 
            break;
    }
}

async function loadAutoIssueFile() {
    return await fs.readFile(`${_dirname}/../data/autoIssueGoods.json`, 'utf8');
}

async function logToFile(msg) {
    try {
        if(!(await fs.exists(logPath))) {
            await fs.mkdir(logPath);
        }

        const time = getDate();
        const logFile = `${logPath}log-${time.day}-${time.month}-${time.year}.txt`;
        if(!(await fs.exists(logFile))) {
            await fs.writeFile(logFile, '');
        }

        await fs.appendFile(logFile, `${msg}\n`);
    } catch(err) {
        log(`Ошибка записи файла: ${err}`, 'r');
    }
}

async function askSettings() {
    const question1 = await inq.prompt({
        name: 'golden_key',
        type: 'input',
        message: `Введите golden_key. Его можно получить из cookie с сайта FunPay при помощи расширения EditThisCookie:`,
        validate: function (input) {
            const done = this.async();
        
            if (!checkToken(input)) {
                done('Невалидный токен (golden_key).');
                return;
            }

            done(null, true);
        }
    });

    const question2 = await inq.prompt({
        name: 'autoSettings',
        type: 'list',
        message: `Запуск бота выполняется впервые. Вы хотите настроить функции бота или оставить все параметры по умолчанию? Эти параметры всегда можно поменять в файле ${c.yellowBright('settings.json')}:`,
        choices: ['Оставить по умолчанию', 'Настроить']
    });

    let telegramToken = '';

    if(question2.autoSettings == 'Оставить по умолчанию') {
        console.log();
        return {
            token: question1.golden_key,
            telegramBot: false,
            telegramToken: telegramToken,
            alwaysOnline: true,
            lotsRaise: true,
            goodsStateCheck: true,
            autoIssue: true,
            autoResponse: true,
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
        message: `Включить функцию автовыдачи товаров (не забудьте потом её настроить в файле autoIssueGoods.json)?`,
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
        token: question1.golden_key,
        telegramBot: (question3.telegramBot == 'Да') ? true : false,
        telegramToken: telegramToken,
        alwaysOnline: (answers.alwaysOnline == 'Да') ? true : false,
        lotsRaise: (answers.lotsRaise == 'Да') ? true : false,
        goodsStateCheck: (answers.goodsStateCheck == 'Да') ? true : false,
        autoIssue: (answers.autoIssue == 'Да') ? true : false,
        autoResponse: (answers.autoResponse == 'Да') ? true : false
    }

    console.log();
    return askSettings;
}

export { updateFile, initStorage, load, loadSettings, logToFile, getConst, setConst, loadAutoIssueFile };