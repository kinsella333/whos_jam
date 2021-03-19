/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path')
    methods = require('methods'),
    cors = require('cors'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    dotenv = require('dotenv'),
    admins = require("./routes/api/admins"),
    cookieParser = require('cookie-parser'),
    sassMiddleware = require('node-sass-middleware');

module.exports = function() {
  var app = express();
  dotenv.config({path: path.join(__dirname, '/.env')})
  var isProduction = process.env.NODE_ENV === 'production';

  // all environments
  app.use(cors());
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, '/views'));
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(passport.initialize());
  require("./mongo_config/passport")(passport);

  app.use(sassMiddleware({
    src: path.join(__dirname, '/bootstrap'),
    dest: path.join(__dirname, '/public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true }))
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(errorHandler());
  app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));

  if(isProduction){
    app.use(cookieParser(Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4)));
    mongoose
        .connect(
          process.env.MONGODB_URI,
          {useNewUrlParser: true, useUnifiedTopology: true}
        ).then(() => console.log("MongoDB successfully connected"))
  } else {
    app.use(errorHandler());
    app.use(cookieParser('dev_secret'));

    mongoose
        .connect(
          'mongodb://localhost/conduit',
          {useNewUrlParser: true, useUnifiedTopology: true}
        ).then(() => console.log("MongoDB successfully connected"))
    mongoose.set('debug', true);
  }

  return app;
}();
