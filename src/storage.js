import fs from 'fs';
import c from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log, getDate } from './log.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const dataFolder = 'data';
const logPath = `${_dirname}/../${dataFolder}/log/`;
await initStorage();

function initStorage() {
    try {
        const files = [
            "appData.json", "autoIssueGoods.json", "autoResponse.json", "categories.json", "goodsState.json"
        ];
    
        if(!fs.existsSync(`${_dirname}/../${dataFolder}`)) {
            fs.mkdirSync(`${_dirname}/../${dataFolder}`);
        }
    
        files.forEach(file => {
            if(!fs.existsSync(`${_dirname}/../${dataFolder}/${file}`)) {
                fs.writeFileSync(`${_dirname}/../${dataFolder}/${file}`, '[]');
            }
        });
    } catch (err) {
        log(`Не удалось создать файлы хранилища: ${err}`);
    }
}

function loadSettings() {
    try {
        let uri = `${_dirname}/../settings.json`;
        let settings = {};
        
        if(!fs.existsSync(uri)) {
            settings = {
                token: "Here is your golden_key from funpay cookies",
                lotsRaise: true,
                goodsStateCheck: true, 
                autoIssue: true, 
                autoResponse: false, 
                userDataUpdate: true, 
                intervals: {
                    lotsRaise: 120,
                    goodsStateCheck: 120, 
                    autoIssue: 20, 
                    autoResponse: 5, 
                    userDataUpdate: 100
                },
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
            fs.writeFileSync(uri, settings);
            log(c.cyan('Файл settings.json создан. Пропишите свой "golden_key" из куки funpay в поле "token" данного файла, после чего перезапустите программу.'));
            process.exit(1);
        }

        const rawdata = fs.readFileSync(uri);
        settings = JSON.parse(rawdata);

        if(!checkToken(settings.token)) {
            log('Невалидный токен (golden_key).', 'r');
            process.exit(1);
        }

        return settings;
    } catch (err) {
        log(`Ошибка при загрузке файла настроек: ${err}`, 'r');
        process.exit(1);
    }
}

function load(uri) {
    let result = false;
    try {
        uri = `${_dirname}/../${uri}`;
        
        if(!fs.existsSync(uri)) {
            fs.writeFileSync(uri, '');
            return result;
        }

        const rawdata = fs.readFileSync(uri);
        result = JSON.parse(rawdata);
    } catch (err) {
        log(`Ошибка при загрузке файла: ${err}`, 'r');
    }
    return result;
}

function updateFile(content, filePath) {
    let result = false;
    filePath = `${_dirname}/../${filePath}`;
    try {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
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
        if(!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath);
        }

        const time = getDate();
        const logFile = `${logPath}log-${time.day}-${time.month}-${time.year}.txt`;
        if(!fs.existsSync(logFile)) {
            fs.writeFileSync(logFile, '');
        }

        fs.appendFileSync(logFile, `${msg}\n`);
    } catch(err) {
        log(`Ошибка записи файла: ${err}`, 'r');
    }
}

export { updateFile, initStorage, load, loadSettings, logToFile, getConst };