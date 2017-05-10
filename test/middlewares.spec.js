'use strict';

describe("Middlewares", function() {
  afterEach(function(done) {
    this.stopServer().then(done, done.fail);
  });

  it('should call a single middleware if defined', function(done) {
    let middlewareCalled = false;

    this.startServer({
      dataPath: 'test/data/middlewares',
      middlewares: [() => (req, res, next) => {
        middlewareCalled = true;
        next();
      }]
    }).
    then(() => this.checkPaths('GET', {'api': {status: 200}})).
    then(() => { expect(middlewareCalled).toBe(true); }).
    then(done, done.fail);
  });

  it('should call multiple middlewares if defined', function(done) {
    let middleware1Called = false;
    let middleware2Called = false;
    let middleware3Called = false;

    this.startServer({
      dataPath: 'test/data/middlewares',
      middlewares: [
        () => (req, res, next) => {
          middleware1Called = true;
          next();
        },
        () => (req, res) => {
          middleware2Called = true;
          res.status(201).end();
        },
        () => (req, res, next) => {
          middleware3Called = true;
          next();
        },
      ]
    }).
    then(() => this.checkPaths('GET', {'api': {status: 201}})).
    then(() => {
      expect(middleware1Called).toBe(true, 'The 1st middleware should have been called');
      expect(middleware2Called).toBe(true, 'The 2nd middleware should have been called');
      expect(middleware3Called).toBe(false, 'The 3rd middleware should NOT have been called');
    }).
    then(done, done.fail);
  });

  it('should pass the logger and the configuration to middlewares', function(done) {
    this.startServer({
      dataPath: 'test/data/middlewares',
      middlewares: [
        ({logger, configuration}) => (req, res, next) => {
          if (logger) {
            expect(typeof logger.trace).toBe('function');
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.fatal).toBe('function');
          } else {
            fail('Expected logger to be set');
          }

          if (configuration) {
            expect(configuration.get('middlewares')).toBeDefined();
            expect(configuration.get('middlewares')).not.toBeNull();
            expect(configuration.get('middlewares').length).toBe(1);
          } else {
            fail('Expected configuration to be set');
          }

          next();
        }
      ]
    }).
    then(() => this.checkPaths('GET', {'api': {}})).
    then(done, done.fail);
  });
});
