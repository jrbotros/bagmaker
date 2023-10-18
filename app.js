var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/bagmaker');

// var Totebag = mongoose.model('Totebag', {
//     color: String,
//     likes: { type : [Number], index : true },
//     views: Number, // { type : [Number], index : true }
//     size: String,
//     timestamp: { type : [Date], index : true },
//     textfields: [{
//         text: String,
//         x: Number,
//         y: Number,
//         domid: String,
//         leading: Number,
//         kerning: Number,
//         fontSize: Number,
//         justify: String,
//         strikethrough: String,
//         width: String
//     }]
// });

// Totebag.schema.path('color').validate(function(value) {
//     return /red|black|white/i.test(value);
// }, 'Invalid color');

// var routes = require('./routes/index');
// var users = require('./routes/users');
// var totes = require('./routes/totes');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make our db accessible to our router

// app.use(function(req, res, next){
    // req.db = db;
    // next();
// });

// app.use('/', routes);
// app.use('/users', users);
// app.use('/totes', totes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;

//     next(err);
// });

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
    // app.use(function(err, req, res, next) {
        // res.status(err.status || 500);
        // res.render('error', {
            // message: err.message,
            // error: err
        // });
    // });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
    // res.status(err.status || 500);
    // res.render('error', {
        // message: err.message,
        // error: {}
    // });
// });


module.exports = app;
