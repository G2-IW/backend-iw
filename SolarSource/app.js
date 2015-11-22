var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var home = require('./routes/home');
var rec = require('./routes/recommendation');
var enphase = require('./routes/enphase');

var test = require('./test/sample-request');

var mongoose = require('mongoose');
var config = require('./config');
var Home = require('./models/home');

// connect to mongodb
mongoose.connect(config.mongodb.server_path);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function (callback) {
    console.log('DB has been opened');
});

// Create a sample home and add to the database
var sampleHome = new Home({
    latitude: test.lat,
    longitude: test.lon,
    energy: test.energy,
    roof: test.roof
});

/*
sampleHome.save(function (err, createdHome) {
    if (err) console.error(err);
    else console.log(createdHome);
});


// Query db for all homes
Home.find(function(err, homes) {
    if (err) console.error(err);
    else console.log(homes);
});
*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// For apidoc page
app.use(express.static(path.join(__dirname, 'doc')));


app.use('/', routes);
app.use('/users', users);
app.use('/homes', home);
app.use('/recs', rec);
app.use('/enphase', enphase);

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


module.exports = app;
