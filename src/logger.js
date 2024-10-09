import { pino } from "pino";

let logger;
let colorize = true;

/**
 * Initialize the standard out and file loggers.
 * @param logLevel the log level to output - "fatal" | "error" | "warn" | "info" | "debug" | "trace"
 * @param colors true if the output should have colors
 */
function loggerInit(logLevel = 'info', colors = true) {
    logger = pino(pino.transport({
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    // standard out
                    destination: 1,
                    colorize: colors,
                    colorizeObjects: colors,
                    translateTime: "SYS:standard",
                },
            }
        ]
    }));
    logger.level = logLevel;
    colorize = colors;
}

function loggerInfo(text, options = {}) {
    let detail = options.detail;
    if (detail) {
        logger.info(text + ': ' + yellow(detail));
    } else {
        logger.info(text);
    }
}

function loggerError(text) {
    logger.error(text);
}

function yellow(text) {
    if (colorize) {
        return '\x1b[33m' + text + '\x1b[0m';
    } else {
        return text;
    }
}

export { loggerInit, loggerInfo, loggerError, yellow };