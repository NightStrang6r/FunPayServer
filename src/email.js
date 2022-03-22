import imap from 'imap-simple';
import lodash from 'lodash';
import { simpleParser }  from 'mailparser';
import { parseDOM } from './DOMParser.js';
import { log } from './log.js';

const config = {
    imap: {
        user: '',
        password: '',
        host: '',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

async function getEmails() {
    const connection = await imap.connect(config);
    await connection.openBox('INBOX');

    let searchCriteria = [
        'ALL'
    ];

    let fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const item = messages[messages.length - 4];
    let all = lodash.find(item.parts, { "which": "TEXT" });
    let id = item.attributes.uid;
    let idHeader = "Imap-Id: " + id + "\r\n";

    simpleParser(idHeader + all.body, (err, mail) => {
        let text = mail.text;
        let code = "";
        for(let i = 0; i < text.length; i++) {
            if((isUpperCase(text[i]) || isNumber(text[i]))
            && (isUpperCase(text[i + 1]) || isNumber(text[i + 1]))
            && (isUpperCase(text[i + 2]) || isNumber(text[i + 2]))
            && (isUpperCase(text[i + 3]) || isNumber(text[i + 3]))
            && (isUpperCase(text[i + 4]) || isNumber(text[i + 4]))) {
                code = text.substr(i, 5);
                if(countNumbers(code) >= 4) {
                    log(code);
                    continue;
                }
                    
                break;
            }
        }
        console.log(code);
    });

    //log(html);
    await connection.end();
}

function countNumbers(string) {
    let counter = 0;
    for(let i = 0; i < string.length; i++) {
        if(isNumber(string[i])) {
            counter++;
        }
    }
    return counter;
}

function isNumber(number) {
    if(number == undefined || number == "" || number == "\n") return false;
    if(isNaN(Number(number)))
        return false;
    return true;
}

function isUpperCase(letter) {
    if(letter == undefined || letter == "" || letter == "\n") return false;
    return letter.toUpperCase() == letter;
}

export { getEmails };