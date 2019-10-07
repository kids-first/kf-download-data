import log4js from 'log4js';

log4js.configure({
  appenders: {
    toFile: { type: 'file', filename: 'debug.log' },
    out: { type: 'stdout', layout: { type: 'messagePassThrough' } },
  },
  categories: { default: { appenders: ['toFile', 'out'], level: 'info' } }
});

export const logToFileAndStdOut = log4js.getLogger('logToFileAndStdOut');
