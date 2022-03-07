import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

function initStorage() {
    if(!fs.existsSync(`${_dirname}/data`)) {
        fs.openSync(`${_dirname}/data/categories.js`, 'w');
        fs.openSync(`${_dirname}/data/goodsState.js`, 'w');
    }
    fs.writeFileSync(`${_dirname}/data/categories.js`, 'export default\n');
    fs.writeFileSync(`${_dirname}/data/categories.js`, 'export default\n');
}

function updateFile(content, filePath) {
    let result = false;
    filePath = `${_dirname}/${filePath}`;
    try {
        if(!fs.existsSync(filePath)) {
            fs.openSync(filePath, 'w');
        }
        fs.writeFileSync(filePath, 'export default\n');
        fs.appendFileSync(filePath, JSON.stringify(content, null, 2));
        result = true;
    } catch(err) {
        console.log(`Ошибка записи файла: ${err}`);
        result = false;
    }
    return result;
}

export { updateFile };