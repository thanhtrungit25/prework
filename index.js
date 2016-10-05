"use strict"

let http = require('http');
let request = require('request');
let url = require('url');
let argv = require('yargs').argv;
let fs = require('fs');

let logStream = argv.logfile ? fs.createWriteStream(argv.logfile) 
  : process.stdout;

let localhost = '127.0.0.1';
let schema = 'http://';
let host = argv.host || localhost;
let port = argv.port || (host === localhost) ? 8000 : 80;
let destinationUrl = schema + host + ':' + port;

http.createServer((req, res) => {
  logStream.write(`Request received at: ${req.url}\n`);

  req.pipe(res);
  for (let header in req.headers) {
      res.setHeader(header, req.headers[header]);
  }

}).listen(8000);
logStream.write('proxyServer listening at 127.0.0.1:8000\n');

http.createServer((req, res) => {
  logStream.write('proxy server\n');
  logStream.write(JSON.stringify(req.headers)+'\n');
  let url = destinationUrl;
  if (req.headers['x-destination-url']) {
    url = 'http://' + req.headers['x-destination-url'];
  }
  
  let options = {
    url: url + req.url
  };

  req.pipe(request(options)).pipe(res);
}).listen(8001);
logStream.write('proxyServer listening at 127.0.0.1:8001\n');