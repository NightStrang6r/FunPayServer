// MODULES
const c = global.chalk;
const fs = global.fs_extra;

// CONSTANTS
const logo = `
█▀▀ █░░█ █▄░█ █▀▄ ▄▀▄ █░█ . ▄▀▀ █▀▀ █▀▄ █░░░█ █▀▀ █▀▄
█▀▀ █░░█ █▀██ █▀░ █▄█ ▀█▀ . ░▀▄ █▀▀ █▀▄ ░█░█░ █▀▀ █▀▄
▀░░ ░▀▀░ ▀░░▀ ▀░░ ▀░▀ ░▀░ . ▀▀░ ▀▀▀ ▀░▀ ░░▀░░ ▀▀▀ ▀░▀
`;

const version = `v${(JSON.parse((await fs.readFile('./package.json')))).version}`;
const by = 'By NightStranger\n';
const enableFileLog = true;

// START
if(enableFileLog) logToFile('---------------New Load--------------');
setTerminalTitle('FunPayServer by NightStranger');
printLogo();

// FUNCTIONS
function setTerminalTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}

function printLogo() {
    console.log(`\x1b[5m${logo}\x1b[0m`);
    console.log(c.cyan(version));
    console.log(c.magenta(by));
    console.log(c.greenBright(` *Telegram: https://t.me/fplite`));
    console.log(c.greenBright(` *Discord:  https://discord.gg/Y9tZYkgk3p`));
    console.log(c.greenBright(` *Github:   https://github.com/NightStrang6r/FunPayServer\n`));
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
            logToFile(logText);
    } else {
        console.log(msg);

        if(enableFileLog)
            logToFile(JSON.stringify(msg, null, 4));
    }
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

async function logToFile(msg) {
    try {
        const _dirname = process.cwd();
        const dataFolder = 'data';
        const dataPath = `${_dirname}/${dataFolder}`;
        const logPath = `${dataPath}/logs/`;

        if(!(await fs.exists(dataPath))) {
            await fs.mkdir(dataPath);
        }

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
        console.log(`Ошибка записи файла: ${err}`);
    }
}

export default log;