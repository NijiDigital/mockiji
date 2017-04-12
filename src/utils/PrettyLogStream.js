'use strict';

const bunyan = require('bunyan');
const chalk = require('chalk');
const Writable = require('stream').Writable;

const LOG_LEVELS = {
  UNKNOWN: 'Unknown',
  TRACE: 'Trace',
  DEBUG: 'Debug',
  INFO: 'Info',
  WARN: 'Warn',
  ERROR: 'Error',
  FATAL: 'Fatal',
};

const LOG_LEVELS_MAP = {
  [bunyan.TRACE]: LOG_LEVELS.TRACE,
  [bunyan.DEBUG]: LOG_LEVELS.DEBUG,
  [bunyan.INFO]: LOG_LEVELS.INFO,
  [bunyan.WARN]: LOG_LEVELS.WARN,
  [bunyan.ERROR]: LOG_LEVELS.ERROR,
  [bunyan.FATAL]: LOG_LEVELS.FATAL,
};

const LOG_LEVELS_COLORS = {
  [LOG_LEVELS.UNKNOWN]: 'white',
  [LOG_LEVELS.TRACE]: 'grey',
  [LOG_LEVELS.DEBUG]: 'cyan',
  [LOG_LEVELS.INFO]: 'green',
  [LOG_LEVELS.WARN]: 'yellow',
  [LOG_LEVELS.ERROR]: 'red',
  [LOG_LEVELS.FATAL]: 'magenta',
};

const HTTP_COLORS = {
  DEFAULT: 'white',
  SUCCESS: 'green',
  REDIRECT: 'yellow',
  CLIENT_ERROR: 'red',
  SERVER_ERROR: 'magenta',
};

class PrettyLogStream extends Writable {
  /** @inheritdoc */
  _write(entry, encoding, done) {
    process.stdout.write(this._formatEntry(entry));
    done();
  }

  /**
   * Format a log entry.
   * @param {Object} entry Bunyan log entry
   * @return {string} Formatted log entry
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
   */
  _formatRequest(entry) {
    const method = entry.method || '?';
    const url = entry.url || '?';

    return `${chalk.blue.bold('⇒')} ${chalk.bold(method)} ${url}`
  }

  /**
   * Format a "response" log entry
   * @param {Object} entry - Log entry previously parsed by _formatEntry
   * @return {string} Formatted message
   */
  _formatResponse(entry) {
    const method = entry.method || '?';
    const url = entry.url || '?';
    const statusCode = entry.httpCode || 0;
    const statusColor = this._getHttpStatusColor(statusCode);

    return `${chalk.blue.bold('⇐')} ${chalk.bold(method)} ${url} [${chalk.bold[statusColor](statusCode)}]`;
  }

  /**
   * Return the name of a bunyan log level.
   * @param {number} logLevel - A bunyan log level
   * @return {string} Level name
   */
  _getLogLevelName(logLevel) {
    if (LOG_LEVELS_MAP.hasOwnProperty(logLevel)) {
      return LOG_LEVELS_MAP[logLevel];
    }

    return LOG_LEVELS.UNKNOWN;
  }

  /**
   * Return a color given a HTTP status code.
   * @param {number} statusCode - HTTP status code
   * @return {string} Chalk color name
   */
  _getHttpStatusColor(statusCode) {
    if (statusCode >= 200 && statusCode < 300) {
      return HTTP_COLORS.SUCCESS;
    } else if (statusCode >= 300 && statusCode < 400) {
      return HTTP_COLORS.REDIRECT;
    } else if (statusCode >= 400 && statusCode < 500) {
      return HTTP_COLORS.CLIENT_ERROR;
    } else if (statusCode >= 500) {
      return HTTP_COLORS.SERVER_ERROR;
    }

    return HTTP_COLORS.DEFAULT;
  }
}

module.exports = PrettyLogStream;
