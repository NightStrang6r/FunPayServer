import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log, getDate } from './log.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const dataFolder = 'data';
const logPath = `${_dirname}/../${dataFolder}/log/`;

await initStorage();

function initStorage() {
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
}

function load(uri) {
    let result = false;
    try {
        uri = `${_dirname}/../${uri}`;
        
        if(!fs.existsSync(uri)) {
            fs.writeFileSync(uri, '');
        }

        const rawdata = fs.readFileSync(uri);
        result = JSON.parse(rawdata);
    } catch (err) {
        log(`Ошибка при загрузке файла: ${err}`);
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
        log(`Ошибка записи файла: ${err}`);
        result = false;
    }
    return result;
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
        console.log(`Ошибка записи файла: ${err}`);
    }
}

export { updateFile, initStorage, load, logToFile };