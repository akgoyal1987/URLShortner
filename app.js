var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('express-flash');

var routes = require('./routes/index');

var app = express();


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
mongoose.connection.on('error', function(err){
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

var URLModel = require('./models/URLMOdel');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'my secret'}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var logger = require('./config/logger.js');

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minut = 59;
var j = schedule.scheduleJob(rule, function(){
  var date = new Date();
  // date.setHours(0);
  // date.setMinutes(0)
  // date.setSeconds(0);
  date.setDate(date.getDate() - 15);
  URLModel.remove({created_at : {"$lt" : date }}, function(err, urlModel){
    logger.info("URLs Created Before 15 Days ie : (Created On "+date+") has been removed from database");
  });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger.error("Error Occured status : "+err.status);
    res.status(err.status || 500);    
    res.render('error', {
      title : 'Error',
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error("Error Occured status : "+err.status);
  res.status(err.status || 500);
  res.render('error', {
    title : 'Error',
    message: err.message,
    error: {}
  });
});


module.exports = app;
