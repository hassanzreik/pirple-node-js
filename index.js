
//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);

});

// Start HTTP server, and have it listen
httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
});

// start HTTPS server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem'),
};
var httpsServer = https.createServer(httpsServerOptions,function (req, res) {
    unifiedServer(req, res);
});

// Start HTTP server, and have it listen
httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`);
});

// All the server login for both the http and https
var unifiedServer = (req, res) => {
    // get the URL and parse it
    // if true is to parse the query string
    var parsedURL = url.parse(req.url,true);

    // get the path from URL
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get the query string as an object
    var queryStringObject = parsedURL.query;

    //get the HTTP method
    var method = req.method.toLowerCase();

    // get header
    var headers = req.headers;

    // get the payload if any
    var decoder = new stringDecoder('utf-8');
    var buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', ()=> {
        buffer += decoder.end();

        // Choose the handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler

        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parsJsonToObject(buffer),
        }

        // route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload)=>{
            // default status code
            statusCode = typeof(statusCode) == 'number' ? statusCode: 200;
            // use the payload called back by the handler or default empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // convert the payload to a string

            var payloadString = JSON.stringify(payload);

            // Return response

            res.setHeader('Content-Type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('end here');
        });
    });
}

// Define a request router
var router = {
    'sample': handlers.sample,
    'ping' : handlers.ping,
    'hello' : handlers.hello,
    'users' : handlers.users,
};
