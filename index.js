/*
* Primary file for project
*
*/
const http = require("http");
const https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');


// The server should respond to all request with string

// Instantiating the HTTP server
var httpServer = http.createServer(function(req, res){
    unifiedServer(req,res);
});

// Starting http server
httpServer.listen(config.httpPort, function(){
    console.log(`Server started on port ${config.httpPort} in environment ${config.envName}`)
})
// Start the server, and have it listen on port 3000


// Instantiating the HTTPS server
var httpsServerOptions = {
    'key':fs.readFileSync('./https/key.pem','utf8').toString(),
    'cert':fs.readFileSync('./https/cert.pem','utf8').toString()
};
var httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req,res);
});

// Starting htt ps server
httpsServer.listen(config.httpsPort, function(){
    console.log(`Server started on port ${config.httpsPort} in environment ${config.envName}`)
})


// All the server logic for both the http and https server

var unifiedServer = function(req, res){

// Get url and parse it
var parsedUrl = url.parse(req.url, true);

// Get the path
var path = parsedUrl.pathname;
var trimmedPath = path.replace(/^\/+|\/+$/g,'');

// Get the query string as an object
var queryStringObject = parsedUrl.query;


// Send the response
var method= req.method.toLowerCase();

// Get the headers as an object
var headers = req.headers;

// Get the payload if any
var decoder = new stringDecoder('utf-8');
var buffer = '';
req.on('data', function(data){
    buffer += decoder.write(data);
});


req.on('end', function(){
    buffer+=decoder.end();


    //Choose the handler this request should go to, if one is not found use the not found handler
    var choosenHandler = typeof(router[trimmedPath])!=='undefined' ? router[trimmedPath]: handlers.notFound;


    //construct data object to send to handler
    var data ={
        'trimmedPath':trimmedPath,
        'queryStringObject':queryStringObject,
        'method':method,
        'headers':headers,
        'payload':buffer
    }

    // Route the request to the handler specified in the router
    choosenHandler(data, function(statusCode, payload){
        // Use the status code called by the handler, or default choose 200
        statusCode = typeof(statusCode) == 'number' ? statusCode :200;

        // Use the payload called back by the handler, or default to an empty object
        payload = typeof(payload)=='object'? payload :{};

        // Convert the payload to a string 
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(statusCode)
        res.end(payloadString);
        console.log('Returning this response', statusCode, payloadString);

    })

    //res.end('Hello World\n')
    //console.log('Request received with these headers ', headers);
    //console.log('Request is received with this payload ', buffer);


})



// log the request path

//console.log('Request receive on the path:'+trimmedPath +"with this method "+method+' with these queryString param ', queryStringObject);


}

// Define the handlers
var handlers={}

// // Simple handler
// handlers.sample = function(data, callback){
//     //callback a http status code, and a payload object
//     callback(406, {'name':'sample handler'});
// };

// Ping handler
handlers.ping = function(data, callback){
    callback(200);
}

handlers.notFound = function(data,callback){
callback(404);
};

//Define a request router

var router ={
    'sample':handlers.sample,
    'ping':handlers.ping
}
