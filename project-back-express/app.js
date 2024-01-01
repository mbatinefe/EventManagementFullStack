var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var eventsRouter = require('./routes/eventsRouter');
var volunteersRouter = require('./routes/volunteerRouter');
var indexRouter = require('./routes/index')

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
  var reqPath = req.path;
  console.log("---R-E-C-E-V-I-E-D--P-A-T-H------> " + reqPath);
  if (reqPath.startsWith('/api/volunteer') || reqPath.startsWith('/api/become/volunteer') || reqPath.endsWith('/volunteer')) {
    console.log("---S-E-N-D-I-N-G--T-O---------> VOLUNTEER router");
    volunteersRouter(req, res, next);
  } else if (reqPath.startsWith('/api/event') || reqPath.endsWith('/event')) {
    console.log("---S-E-N-D-I-N-G--T-O---------> EVENT router");
    eventsRouter(req, res, next);
  } else {
    console.log("---S-E-N-D-I-N-G--T-O---------> INDEX router");
    indexRouter(req, res, next);
  }
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
