import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log, getDate } from './log.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const dataFolder = 'data';
const logPath = `${_dirname}/../${dataFolder}/log/`;

function initStorage() {
    const files = [
        "appData.js", "goodsState.js", "autoIssueGoods.js", "goodsBackup.js"
    ];

    if(!fs.existsSync(`${_dirname}/../${dataFolder}`)) {
        fs.mkdirSync(`${_dirname}/../${dataFolder}`);
    }

    files.forEach(file => {
        if(!fs.existsSync(`${_dirname}/../${dataFolder}/${file}`)) {
            fs.openSync(`${_dirname}/../${dataFolder}/${file}`, 'w');
            fs.writeFileSync(`${_dirname}/../${dataFolder}/${file}`, 'export default\n{\n}');
        }
    });
}

function load(uri) {
    let result = false;
    try {
        uri = `${_dirname}/../${uri}`;
        
        if(!fs.existsSync(uri)) {
            fs.openSync(uri, 'w');
            fs.writeFileSync(uri, '{}');
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
        if(!fs.existsSync(filePath)) {
            fs.openSync(filePath, 'w');
        }

        if(filePath.includes('.json')) {
            fs.writeFileSync(filePath, '');
        } else {
            fs.writeFileSync(filePath, 'export default\n');
        }
        
        fs.appendFileSync(filePath, JSON.stringify(content, null, 4));
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