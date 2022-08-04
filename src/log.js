import { logToFile } from './storage.js';

const logo = `
█▀▀ █░░█ █▄░█ █▀▄ ▄▀▄ █░█ . ▄▀▀ █▀▀ █▀▄ █░░░█ █▀▀ █▀▄
█▀▀ █░░█ █▀██ █▀░ █▄█ ▀█▀ . ░▀▄ █▀▀ █▀▄ ░█░█░ █▀▀ █▀▄
▀░░ ░▀▀░ ▀░░▀ ▀░░ ▀░▀ ░▀░ . ▀▀░ ▀▀▀ ▀░▀ ░░▀░░ ▀▀▀ ▀░▀
`;
const version = 'v0.1.1';
const by = 'By NightStranger\n';

const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
};

const enableFileLog = true;
let logBuffer = [];

if(enableFileLog) {
    logBuffer[0] = "---NewLoad---";
    setInterval(logInterval, 30000);
}

printLogo();

function printLogo() {
    /*for(let key in colors) {
        console.log(`${colors[key]}`, `${key}\n${text}`, `\x1b[0m`);
    }*/
    console.log(`${colors['Blink']}${logo}\x1b[0m`);
    console.log(`${colors['FgCyan']}${version}\x1b[0m`);
    console.log(`${colors['FgMagenta']}${by}\x1b[0m`);
}

function log(msg, err = false) {
    const date = getDate();
    const logMsg = `>[${date.day}.${date.month}.${date.year}] [${date.hour}:${date.minute}:${date.second}]: ${msg}`;

    if(typeof msg != 'object') {
        console.log(logMsg);
        if(enableFileLog) {
            logBuffer[logBuffer.length] = logMsg;
        }
    } else {
        console.log(msg);
        if(enableFileLog) {
            logBuffer[logBuffer.length] = JSON.stringify(msg);
        }
    }
}

function logInterval() {
    if(logBuffer.length <= 0) return;
    
    let msg = logBuffer.join('\n');
    logToFile(msg);
    logBuffer = [];
}

function getDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    if(day.toString().length == 1)
        day = `0${day}`;
    if(month.toString().length == 1)
        month = `0${month}`;
    if(hour.toString().length == 1)
        hour = `0${hour}`;
    if(minute.toString().length == 1)
        minute = `0${minute}`;
    if(second.toString().length == 1)
        second = `0${second}`;

    return {
        day: day,
        month: month,
        year: year,
        hour: hour,
        minute: minute,
        second: second
    }
}

export { log, printLogo, getDate };