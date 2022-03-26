const logo = `
█▀▀ █░░█ █▄░█ █▀▄ ▄▀▄ █░█ . ▄▀▀ █▀▀ █▀▄ █░░░█ █▀▀ █▀▄
█▀▀ █░░█ █▀██ █▀░ █▄█ ▀█▀ . ░▀▄ █▀▀ █▀▄ ░█░█░ █▀▀ █▀▄
▀░░ ░▀▀░ ▀░░▀ ▀░░ ▀░▀ ░▀░ . ▀▀░ ▀▀▀ ▀░▀ ░░▀░░ ▀▀▀ ▀░▀
`;
const text = 'By NightStranger\n';

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

printLogo();

function printLogo() {
    /*for(let key in colors) {
        console.log(`${colors[key]}`, `${key}\n${text}`, `\x1b[0m`);
    }*/
    console.log(`${colors['Blink']}${logo}\x1b[0m`);
    console.log(`${colors['FgCyan']}v0.1\x1b[0m`);
    console.log(`${colors['FgMagenta']}${text}\x1b[0m`);
}

function log(msg, err = false) {
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

    const logText = `>[${day}.${month}.${year}] [${hour}:${minute}:${second}]: ${msg}`;
    if(!err) {
        console.log(logText);
    } else {
        console.error(logText);
    }
    if(typeof msg == 'object')
        console.log(msg);
}

export { log, printLogo };