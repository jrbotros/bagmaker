var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Huge Totes' });
});

router.get('/tote/:id', function(req, res) {
    
    var toteToView = req.params.id;

    Totebag.findOne({_id: toteToView}, function(err, totebag) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.status(200).json(totebag);
    });

});

module.exports = router;
