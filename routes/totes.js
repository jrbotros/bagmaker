var express = require('express');
var router = express.Router();

/* GET totes listing. */
router.get('/', function(req, res) {
    var db = req.db;
    db.collection('totebags').find().toArray(function (err, items){
        res.json(items);
    });
});

/* GET New tote page. */
router.get('/newtote', function(req, res) {
    res.render('newtote', { title: 'Design a Tote Bag' });
});

/* POST to createtote */
router.post('/createtote', function(req, res) {
    var db = req.db;
    db.collection('totebags').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/* DELETE to deletetote */
router.delete('/deletetote/:id', function(req, res) {
    var db = req.db;
    var toteToDelete = req.params.id;
    db.collection('totebags').removeById(toteToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/* UPDATE  to updatetote */
router.put('/updatetote/:id', function(req, res) {
    var db = req.db;
    var toteToUpdate = req.params.id;
    var doc = { $set: req.body };
    db.collection('totebags').updateById(toteToUpdate, doc, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/* GET a single tote */
router.get('/:id', function(req, res) {
    var db = req.db;
    db.collection('totebags').findOne({ bagNum: req.params.id }, function(err, tote){
        if (err){
            res.send(err);
        }
        //res.json(tote);
        res.render('index', { title: 'Check out this tote.', tote: JSON.stringify(tote) });
    });
});

module.exports = router;
