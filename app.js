const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoConfig = require('./config/mongoConfig');
const dbCon = mongoose.connection;
dbCon.once('open',()=>{console.log('MongoDB Ready');});
dbCon.on('error',console.error);
mongoose.connect(mongoConfig.dbURI,{useMongoClient:true});
const session = require('express-session');
const sessionConfig = require('./config/sessionConfig');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	key:sessionConfig.sessionKey,
	secret:sessionConfig.sessionSecret,
	cookie:{
		max:1000*60*60
	},
	saveUninitialized:true,
	resave:true
}));
const userDTO = require('./models/userVO');
const mainCon = require('./routes/mainController')(app,userDTO);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
