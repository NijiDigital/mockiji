'use strict';

const bunyan = require('bunyan');
const fs = require('fs');
const rimraf = require('rimraf');
const Mockiji = require('../src/index');

describe("Logger", function() {
  beforeEach(function() {
    // Helper that creates a new instance of Mockiji and return its
    // logger's streams
    this.getCreatedStreams = (logs, silent, env = 'dev') => {
      let streams = [];
      let configuration = {
        env,
        middlewares: [
          // A bit of a hack to retrieve the current logger
          ({logger}) => {
            streams = logger.streams;
            return (req, res, next) => {
              next();
            };
          }
        ],
      };

      if (typeof logs !== 'undefined') {
        configuration.logs = logs;
      }

      if (typeof silent !== 'undefined') {
        configuration.silent = silent;
      }

      // eslint-disable-next-line no-new
      new Mockiji({ configuration });

      return streams;
    }
  });

  it('should have two default streams (stdout + rotating-file)', function() {
    const streams = this.getCreatedStreams();
    expect(streams.length).toBe(2);
  });

  it('should be possible to disable all the streams', function() {
    const streams = this.getCreatedStreams([], true);
    expect(streams.length).toBe(0);
  });

  it('should be possible to add a stream without the default ones', function() {
    const noopStream = { write: () => { }}; // eslint-disable-line no-empty-function
    const stream = { name: 'stream1', stream: noopStream, level: 'info' };
    const streams = this.getCreatedStreams([stream], true);
    expect(streams.length).toBe(1);
  });

  it('should be possible to add multiple streams to the default stdout one', function() {
    const noopStream = { write: () => { }}; // eslint-disable-line no-empty-function
    const stream1 = { name: 'stream1', stream: noopStream, level: 'info' };
    const stream2 = { name: 'stream2', stream: noopStream, level: 'info' };
    const streams = this.getCreatedStreams([stream1, stream2]);
    expect(streams.length).toBe(3);
  });

  it('should create logs folders if needed', function(done) {
    const randomFolder = `/tmp/mockiji-${new Date().getTime()}-${Math.round(Math.random()*1000)}`;
    this.getCreatedStreams([{ path: `${randomFolder}/mockiji.log` }]);
    expect(fs.existsSync(randomFolder)).toBe(true);
    rimraf(randomFolder, done);
  });

  it('should use the "debug" level for the default stdout stream in "dev" environment', function() {
    let streams = this.getCreatedStreams([], false, 'dev');
    expect(streams.length).toBe(1);
    expect(streams[0].level).toBe(bunyan.DEBUG);
  });

  it('should use the "info" level for the default stdout stream in "prod" environment', function() {
    let streams = this.getCreatedStreams([], false, 'prod');
    expect(streams.length).toBe(1);
    expect(streams[0].level).toBe(bunyan.INFO);
  });
});
