var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Totebag Maker | Huge inc.' });
});

module.exports = router;
