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
    mongoose = require('mongoose');

module.exports = function() {
  var app = express();
  require('dotenv').config({path: path.join(__dirname, '/.env')})
  var isProduction = process.env.NODE_ENV === 'production';

  // all environments
  app.use(cors());
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, '/views'));
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(errorHandler());
  app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));

  if (!isProduction) app.use(errorHandler());

  // if(isProduction){
  //   mongoose.connect(process.env.MONGODB_URI);
  // } else {
  //   mongoose.connect('mongodb://localhost/conduit');
  //   mongoose.set('debug', true);
  // }

  app.set('view engine', 'pug')
  return app;
}();
