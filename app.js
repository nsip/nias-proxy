// name:    nias-proxy
// process: TODO
// authors: Scott Penrose <scottp@dd.com.au>

var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var fs           = require('fs');
var nconf        = require('nconf');

// Configuration - Default/Local config, override by central
// This merges the config data in '/etc/1api.json' with the default database supplied here
nconf.argv()
	.env()
	.file('local', 'config.json')
	.file('home', process.env.HOME + '/.nias.json')
	.file('central', '/etc/nias.json')
	.defaults({
		todo: {
			todo: 'todo'
		}
	});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle our known paths (no root, see internal routes)
app.use(
	require('./routes/index'),
	require('./routes/token'),
	require('./routes/login'),
	require('./routes/proxy')
);

// https://stackoverflow.com/questions/10435407/proxy-with-express-js
var proxy = require('express-http-proxy');
app.use('/proxy', proxy('www.google.com', {
	forwardPath: function(req, res) {
		return require('url').parse(req.url).path;
	},

	intercept: function(rsp, data, req, res, callback) {
		// rsp - original response from the target 
		// data = JSON.parse(data.toString('utf8'));
		callback(null, data);
	},

	decorateRequest: function(req) {
		//req.headers['Content-Type'] = '';
		//req.method = 'GET';
		//req.bodyContent = wrap(req.bodyContent);
		return req;
	}
}));

// All other cases fall through to here

app.use(function(req, res, next){
	res.status(404);
	res.render('404', { 
		title: 'Error 404',
		message: 'Sorry cant find that'
	});
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

module.exports = app;
