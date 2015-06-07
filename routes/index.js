var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');
var sorts = ["newest", "oldest", "popular", "views"];


function handle404(req, res){
    console.log("\n\n\n\n404\n\n\n\n");
    res.render('index', {
        title : 'Newest | Totebag Maker | Huge inc.',
        sort : "newest"
    });
}

/* GET home page. Default: newest */
router.get('/', function(req, res) {
    res.render('index', {
        title : 'Newest | Totebag Maker | Huge inc.',
        sort : "newest"
    });
});

// validates all uses of the "id" variable.
router.param('sort', function(req, res, next, sort){
    // if you can't find this id, take them to the index page.
    if (sorts.indexOf(sort) === -1){
        handle404(req, res);
    }
    // valid id
    else
        next();
});

router.get('/:sort', function(req, res) {
    var sort = req.params.sort;
    
    var sortName;
    if (sort === "newest")
        sortName = "Newest";
    else if (sort === "oldest")
        sortName = "Oldest";
    else if (sort === "popular")
        sortName = "Popular";
    else if (sort === "views")
        sortName = "Most Views";

    if (typeof sortName === "undefined")
        next();

    res.render('index', {
        title : sortName + ' | Totebag Maker | Huge inc.',
        sort : sort
    });
});

// get a single bag's json
router.get('/data/tote/:id', function(req, res){
    var toteToUpdate = req.params.id;
    
    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err){
            console.log(err);
            return res.status(500).json("Internal Server Error");  
        }
        return res.status(200).json(totebag);
    });
});

/* JSON return for all sort and pagination. */
router.get('/data/:sort/:page', function(req, res) {
    var page = req.params.page - 1; //we want index
    var sort = req.params.sort;
    var loadSize = 10;

    var sortAttribute = {};    
    if (sort === "newest")
        sortAttribute.timestamp = -1; // desc
    else if (sort === "oldest") 
        sortAttribute.timestamp = 1; // asc, oldest
    else if (sort === "popular")
        sortAttribute.likes = -1;
    else if (sort === "views")
        sortAttribute.views = -1;

    Totebag.find({},null,{
        skip: page * loadSize,
        limit: loadSize,
        sort: sortAttribute
    }, function(err, totebags) {
        if(err) {
          console.log(err);
          return res.status(500).json("Internal Server Error");  
        }
        return res.status(200).json(totebags);
    });
});

// router.get('*', function(req, res){
//     handle404(req, res);
// });


module.exports = router;
