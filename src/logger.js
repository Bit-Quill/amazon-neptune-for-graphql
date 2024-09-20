import fs from 'fs';

let LOG_FILE = './output/log.txt';

function loggerInit(file) {
    LOG_FILE = file;
    fs.writeFileSync(LOG_FILE, '', (err) => {
        return console.log(err);
    });
}

function logToFile(text) {
    // remove yellow escape from text
    text = text.replaceAll(/\x1b\[33m/g, '');
    text = text.replaceAll(/\x1b\[0m/g, '');

    fs.appendFileSync(LOG_FILE, (new Date()).toISOString() + ' ' + text + '\n', (err) => {
        return console.log(err);
    })
}

function loggerLog(text, logToConsole = false) {
    if (logToConsole) {
        console.log(text);
    }
    logToFile(text);
}

function loggerError(text) {
    console.error(text);
    logToFile(text);
}

export { loggerInit, loggerLog, loggerError };