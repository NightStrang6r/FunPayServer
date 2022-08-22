import fs from 'fs-extra';
import c from 'chalk';
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
            "appData.json", "autoIssueGoods.json", "autoResponse.json", "categories.json", "goodsState.json"
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
            settings = {
                token: "Here is your golden_key from funpay cookies",
                lotsRaise: true,
                goodsStateCheck: true, 
                autoIssue: true, 
                autoResponse: true, 
                userDataUpdate: true, 
                intervals: {
                    lotsRaise: 120,
                    userDataUpdate: 300
                },
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
            log(c.cyan('Файл settings.json создан. Пропишите свой "golden_key" из куки funpay в поле "token" данного файла, после чего перезапустите программу.'));
            await exit();
        }

        const rawdata = await fs.readFile(uri);
        settings = JSON.parse(rawdata);

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
        log(`Ошибка при загрузке файла "${uri}". Возможно файл имеет неверную кодировку (поддерживается UTF-8): ${err}`, 'r');
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

function getConst(name) {
    switch (name) {
        case 'api': return 'https://funpay.com';
    }
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

export { updateFile, initStorage, load, loadSettings, logToFile, getConst };