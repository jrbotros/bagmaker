var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Huge Totes', tote : JSON.stringify( {bagNum : -1} ) });
});

module.exports = router;
