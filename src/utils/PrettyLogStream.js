'use strict';

const bunyan = require('bunyan');
const chalk = require('chalk');
const Writable = require('stream').Writable;

const LOG_LEVELS = {
  UNKNOWN: 'Unknown',
  TRACE  : 'Trace',
  DEBUG  : 'Debug',
  INFO   : 'Info',
  WARN   : 'Warn',
  ERROR  : 'Error',
  FATAL  : 'Fatal',
};

const LOG_LEVELS_MAP = {
  [bunyan.TRACE]: LOG_LEVELS.TRACE,
  [bunyan.DEBUG]: LOG_LEVELS.DEBUG,
  [bunyan.INFO] : LOG_LEVELS.INFO,
  [bunyan.WARN] : LOG_LEVELS.WARN,
  [bunyan.ERROR]: LOG_LEVELS.ERROR,
  [bunyan.FATAL]: LOG_LEVELS.FATAL,
};

const LOG_LEVELS_COLORS = {
  [LOG_LEVELS.UNKNOWN]: 'white',
  [LOG_LEVELS.TRACE]  : 'grey',
  [LOG_LEVELS.DEBUG]  : 'cyan',
  [LOG_LEVELS.INFO]   : 'green',
  [LOG_LEVELS.WARN]   : 'yellow',
  [LOG_LEVELS.ERROR]  : 'red',
  [LOG_LEVELS.FATAL]  : 'magenta',
};

const HTTP_COLORS = {
  DEFAULT: 'white',
  '200'  : 'green',
  '300'  : 'yellow',
  '400'  : 'red',
  '500'  : 'magenta',
};

class PrettyLogStream extends Writable {
  /** @inheritdoc */
  _write(entry, encoding, done) {
    process.stdout.write(this._formatEntry(entry));
    done();
  }

  /**
   * Format a log entry.
   * @param {Object} entry - Bunyan log entry
   * @return {string} Formatted log entry
   * @private
   */
  _formatEntry(entry) {
    try {
      // Bunyan log entries are JSON encoded
      entry = JSON.parse(entry);
    } catch (e) {
      // In case we could not decode the entry, create a basic object containing
      // the entry itself as a message.
      entry = {msg: entry};
    }

    // Extract informations from log entry
    const entryTime = entry.time || (new Date()).toISOString();
    const entryLevel = this._getLogLevelName(entry.level);
    const entryType = entry.type;
    const entryMessage = entry.msg;

    // Retrieve the log message based on the type of the entry
    let content = '';
    switch (entryType) {
    case 'request':
      content = this._formatRequest(entry);
      break;
    case 'response':
      content = this._formatResponse(entry);
      break;
    default:
      content = `${chalk[LOG_LEVELS_COLORS[entryLevel]](entryMessage)}`;
      break;
    }

    return `${entryTime} (${chalk.bold[LOG_LEVELS_COLORS[entryLevel]](entryLevel)}) ${content}\n`
  }

  /**
   * Format a "request" log entry
   * @param {Object} entry - Log entry previously parsed by _formatEntry
   * @return {string} Formatted message
   * @private
   */
  _formatRequest(entry) {
    const method = entry.method || '?';
    const url = entry.url || '?';

    return `${chalk.white.bold('▶')} ${chalk.bold(method)} ${url}`
  }

  /**
   * Format a "response" log entry
   * @param {Object} entry - Log entry previously parsed by _formatEntry
   * @return {string} Formatted message
   * @private
   */
  _formatResponse(entry) {
    const method = entry.method || '?';
    const url = entry.url || '?';
    const statusCode = entry.httpCode || 0;
    const statusColor = this._getHttpStatusColor(statusCode);

    return `${chalk.bold[statusColor]('◀')} ${chalk.bold(method)} ${url} [${chalk.bold[statusColor](statusCode)}]`;
  }

  /**
   * Return the name of a bunyan log level.
   * @param {number} logLevel - A bunyan log level
   * @return {string} Level name
   * @private
   */
  _getLogLevelName(logLevel) {
    return LOG_LEVELS_MAP.hasOwnProperty(logLevel) ? LOG_LEVELS_MAP[logLevel] : LOG_LEVELS.UNKNOWN;
  }

  /**
   * Return a color given a HTTP status code.
   * @param {number} statusCode - HTTP status code
   * @return {string} Chalk color name
   * @private
   */
  _getHttpStatusColor(statusCode) {
    const codeCategory = Math.floor(statusCode / 100) * 100;
    return HTTP_COLORS.hasOwnProperty(codeCategory) ? HTTP_COLORS[codeCategory] : HTTP_COLORS.DEFAULT;
  }
}

module.exports = PrettyLogStream;
