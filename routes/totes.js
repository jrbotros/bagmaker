var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');
var pageLimit = 10;

/* GET totes listing. */
// router.get('/data', function(req, res) {
//     Totebag.find(function(err, totebags) {
//         if(err) {
//           console.log(err);
//           return res.status(500).json("Internal Server Error");  
//         }        
//         return res.status(200).json(totebags);
//     });
// });

/* GET New tote page. */
router.get('/newtote', function(req, res) {
    res.render('newtote', { title: 'Create a Tote / Totebag Maker / Huge inc.' });
});

// /* POST to createtote */
// router.post('/createtote', function(req, res) {
//     // if it meets the admin requirements.
//     if (req.body.textfields.length === 1 && req.body.textfields[0].text === "Enter Sesame"){
//         return res.send({ res: "Success"});
//     }
//     else{
//         var newtote = new Totebag(req.body);
//         newtote.save(function(err) {
//             if(err) return res.status(500).json(err);
//             return res.send({ res: "Success"});
//         });
//     }
// });

// /* DELETE to deletetote */
// router.get('/deletetote/:id', function(req, res) {
//     var toteToDelete = req.params.id;
//     Totebag.findByIdAndRemove(toteToDelete, null, function(err) {
//         if(err) return res.status(500).json("Internal Server Error");
        
//         res.render('index', {
//             title : 'Latest | Totebag Maker | Huge inc.',
//             sort : "latest"
//         });
//     });
// });

/* UPDATE  to updatetote */
// router.put('/updatetote/:id', function(req, res) {
//     var toteToUpdate = req.params.id;

//     Totebag.findOneAndUpdate({_id: toteToUpdate}, req.body, function(err) {
//         if(err) return res.status(500).json("Internal Server Error");
//         return res.send({ res: "Success"});
//     });
// });

// validates all uses of the "id" variable.
// router.param('id', function(req, res, next, id){
//     Totebag.findById(id, function (err, found) {
//         // if you can't find this id, take them to the index page.
//         if (found === null || typeof found === "undefined")
//             handle404(req, res);
//         // valid id
//         else
//             next();
//     });    
// });

/* GET a single tote */
router.get('/:id', function(req, res) {
    var toteToUpdate = req.params.id;
    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err){
            res.render('index', {
                title : 'Latest | Totebag Maker | Huge inc.',
                sort : "latest"
            });
        }
        res.render("index", {
            title: 'View Tote | Totebag Maker | Huge inc.',
            toteID : toteToUpdate,
            sort : "latest"
        });
    });
});

module.exports = router;
