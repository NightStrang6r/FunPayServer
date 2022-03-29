import imap from 'imap-simple';
import lodash from 'lodash';
import { simpleParser }  from 'mailparser';
import { log } from './log.js';

async function getSteamCode(email, pass, server) {
    let code = false;
    let result = {code: code, error: false, msg: ""};

    try {
        const minutes = 10;
        const whitelist = [
            "Код Steam Guard, необходимый для входа в аккаунт",
            "Here is the Steam Guard code you need to login to account"
        ];
        const messages = await getAllEmails(email, pass, server);
    
        for(let i = messages.length - 1; i >= 0; i--) {
            const item = messages[i];

            if(!item.attributes.date) break;

            const difference = new Date() - new Date(item.attributes.date);

            if(difference / 60000 > minutes) {
                result = {code: code, error: true, msg: "no-new-mails"};
                log(`Новых писем за последние ${minutes} минут не приходило. Mail date: ${item.attributes.date}`);
                break;
            }

            const all = lodash.find(item.parts, { "which": "TEXT" });
            const id = item.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";
        
            const mail = await simpleParser(idHeader + all.body);
            const text = mail.text;
            let containsWhitelist = false;
    
            whitelist.forEach(word => {
                if(text.includes(word)) {
                    containsWhitelist = true;
                    return;
                }
            });
    
            if(!containsWhitelist) {
                continue;
            }
    
            for(let i = 0; i < text.length; i++) {
                if((isUpperCase(text[i]) || isNumber(text[i]))
                && (isUpperCase(text[i + 1]) || isNumber(text[i + 1]))
                && (isUpperCase(text[i + 2]) || isNumber(text[i + 2]))
                && (isUpperCase(text[i + 3]) || isNumber(text[i + 3]))
                && (isUpperCase(text[i + 4]) || isNumber(text[i + 4]))) {
                    code = text.substr(i, 5);
                    if(countNumbers(code) >= 4)
                        continue;
                    break;
                }
            }
    
            if(code)
                break;
        }
    } catch (err) {
        log(`Ошибка при парсинге кода Steam Guard: ${err}`);
    }

    if(!result.error) {
        result = {code: code, error: false, msg: ""};
    }
    
    return result;
}

async function getAllEmails(email, pass, server) {
    const config = {
        imap: {
            user: email,
            password: pass,
            host: server,
            port: 993,
            tls: true,
            authTimeout: 3000
        }
    };

    let messages = false;
    try {
        const connection = await imap.connect(config);
        await connection.openBox('INBOX');
    
        const searchCriteria = [
            'ALL'
        ];
    
        const fetchOptions = {
            bodies: ['TEXT'],
            markSeen: false
        };
    
        messages = await connection.search(searchCriteria, fetchOptions);
    
        await connection.end();
    } catch(err) {
        log(`Ошибка при получении почты: ${err}`);
    }
    
    return messages;
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

export { getAllEmails, getSteamCode };