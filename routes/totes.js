var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');

/* GET totes listing. */
router.get('/', function(req, res) {
    Totebag.find(function(err, totebags) {
        if(err) {
          console.log(err);  
          return res.status(500).json("Internal Server Error");  
        } 

        return res.status(200).json(totebags);
    });
});

/* GET New tote page. */
router.get('/newtote', function(req, res) {
    res.render('newtote', { title: 'Design a Tote Bag' });
});

/* POST to createtote */
router.post('/createtote', function(req, res) {
    var newtote = new Totebag(req.body);
    newtote.save(function(err) {
        if(err) return res.status(500).json(err);
        return res.send({ res: "Success"});
    });
});

/* DELETE to deletetote */
router.delete('/deletetote/:id', function(req, res) {
    var toteToDelete = req.params.id;

    Totebag.remove({'_id': toteToDelete}, function(err) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.status(200).end();
    });
});

/* UPDATE  to updatetote */
router.put('/updatetote/:id', function(req, res) {
    var toteToUpdate = req.params.id;

    Totebag.findOneAndUpdate({_id: toteToUpdate}, req.body, function(err) {
        if(err) return res.status(500).json("Internal Server Error");
        return res.send({ res: "Success"});
    });
});

router.param('id', function(req, res, next, id){
    // validate the id.
    console.log("its validatingggg");
    next();
})

/* GET a single tote */
router.get('/:id', function(req, res) {
    var toteToUpdate = req.params.id;
    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err) return res.status(500).json("Internal Server Error");
        res.render("index", {
            toteID : toteToUpdate
        });
    });
});

module.exports = router;
