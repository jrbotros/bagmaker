var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var Totebag = mongoose.model('Totebag');

/* GET totes listing. */
router.get('/', function(req, res) {
    // var db = req.db;

    Totebag.find(function(err, totebags) {
        if(err) {
          console.log(err);  
          return res.status(500).json("Internal Server Error");  
        } 

        return res.status(200).json(totebags);
    });

    // db.collection('totebags').find().toArray(function (err, items){
        // res.json(items);
    // });
});

/* GET New tote page. */
router.get('/newtote', function(req, res) {
    res.render('newtote', { title: 'Design a Tote Bag' });
});

/* POST to createtote */
router.post('/createtote', function(req, res) {
    // var db = req.db;

    var newtote = new Totebag(req.body);
    newtote.save(function(err) {
        if(err) return res.status(500).json(err);
        return res.send({ res: "Success"});
    });

    // db.collection('totebags').insert(req.body, function(err, result){
        // res.send(
            // (err === null) ? { msg: '' } : { msg: err }
        // );
    // });


});

/* DELETE to deletetote */
router.delete('/deletetote/:id', function(req, res) {
    // var db = req.db;
    var toteToDelete = req.params.id;

    Totebag.remove({'_id': toteToDelete}, function(err) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.status(200).end();
    });

    // db.collection('totebags').removeById(toteToDelete, function(err, result) {
        // res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    // });
});

/* UPDATE  to updatetote */
router.put('/updatetote/:id', function(req, res) {
    // var db = req.db;
    var toteToUpdate = req.params.id;

    Totebag.findOneAndUpdate({_id: toteToUpdate}, req.body, function(err) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.send({ res: "Success"});
    });

    // var doc = { $set: req.body };
    // db.collection('totebags').updateById(toteToUpdate, doc, function(err, result) {
        // res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    // });

});

/* GET a single tote */
router.get('/:id', function(req, res) {

    var toteToUpdate = req.params.id;

    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.status(200).json(totebag);
    });

    // var db = req.db;
    // db.collection('totebags').findOne({ bagNum: req.params.id }, function(err, tote){
        // if (err){
            // res.send(err);
        // }
        //res.json(tote);
        // res.render('index', { title: 'Check out this tote.', tote: JSON.stringify(tote) });
    // });
});

module.exports = router;
