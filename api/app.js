'use strict';

// Server
let express = require('express');
let app = express();

app.use(express.json());
app.use(express.urlencoded());
let http = require('http').Server(app);

var livereload = require('livereload');
var reloadServer = livereload.createServer();
reloadServer.watch(__dirname);  // Enable watch on complete app folder

let Logger = require('bunyan');
let log = new Logger({
  name: 'helloapi',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    },
    {
      path: 'logs/hello.log',
      level: 'trace'
    }
  ]
});

// Routes
let routes = require('./src/routes/index');
routes(app);

// Launch server
http.listen('3030');

// Expose
module.exports = app;
