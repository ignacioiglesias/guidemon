var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes/index');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = 'https://www.getyourguide.com/touring.json?key=2Gr0p7z96D';
var intervalTime = 2500;

io.on('connection', function(socket) {
    console.log('Client connected');

    var spawn = function() {
        request({url: url, json: true}, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                io.emit('spawn', body);
            }
        });
    };

    spawn();
    var intervalId = setInterval(spawn, intervalTime);
    socket.on('disconnect', function() {
        console.log('Client Disconnected');
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = http;
