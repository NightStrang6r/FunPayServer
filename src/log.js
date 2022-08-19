import c from 'chalk';
import { logToFile } from './storage.js';

const logo = `
█▀▀ █░░█ █▄░█ █▀▄ ▄▀▄ █░█ . ▄▀▀ █▀▀ █▀▄ █░░░█ █▀▀ █▀▄
█▀▀ █░░█ █▀██ █▀░ █▄█ ▀█▀ . ░▀▄ █▀▀ █▀▄ ░█░█░ █▀▀ █▀▄
▀░░ ░▀▀░ ▀░░▀ ▀░░ ▀░▀ ░▀░ . ▀▀░ ▀▀▀ ▀░▀ ░░▀░░ ▀▀▀ ▀░▀
`;
const version = 'v0.1.5';
const by = 'By NightStranger\n';

const enableFileLog = true;
let logBuffer = [];

if(enableFileLog) {
    logBuffer[0] = "---NewLoad---";
    setInterval(logInterval, 30000);
}

printLogo();

function printLogo() {
    console.log(`\x1b[5m${logo}\x1b[0m`);
    console.log(c.cyan(version));
    console.log(c.magenta(by));
    console.log(c.greenBright(`Telegram: https://t.me/fplite`));
    console.log(c.greenBright(`Discord:  https://discord.gg/gEPnwzVD3H\n`));
}

function log(msg, color = 'w') {
    const date = getDate();
    const dateString = `[${date.day}.${date.month}.${date.year}]`;
    const timeString = `[${date.hour}:${date.minute}:${date.second}]`;
    const logText = `>${dateString} ${timeString}: ${msg}`;
    let coloredMsg = msg;

    switch (color) {
        case 'c': coloredMsg = c.cyan(msg); break;
        case 'g': coloredMsg = c.green(msg); break;
        case 'm': coloredMsg = c.magenta(msg); break;
        case 'y': coloredMsg = c.yellow(msg); break;
        case 'r': coloredMsg = c.red(msg); break;
        default: coloredMsg = msg; break;
    } 

    const logMsg = `${c.yellow('>')} ${c.cyan(dateString)} ${c.cyan(timeString)}: ${coloredMsg}`;

    if(typeof msg != 'object') {
        console.log(logMsg);

        if(enableFileLog) 
            logBuffer[logBuffer.length] = logText;
    } else {
        console.log(msg);

        if(enableFileLog)
            logBuffer[logBuffer.length] = JSON.stringify(msg);
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

export { log, getDate };