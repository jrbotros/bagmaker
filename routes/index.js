var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Totebag = mongoose.model('Totebag');
var sorts = ["latest", "oldest", "popular", "views"];


function handle404(req, res){
    console.log("\n\n\n\n404\n\n\n\n");
    res.render('index', {
        title : 'Latest | Totebag Maker | Huge inc.',
        sort : "latest"
    });
}

function getSortAttributePrevFromSort(sort){
    var sortAttribute = {};    
    if (sort === "latest")
        sortAttribute.timestamp = 1; // desc
    else if (sort === "oldest") 
        sortAttribute.timestamp = -1; // asc, oldest
    else if (sort === "popular")
        sortAttribute.likes = 1;
    else if (sort === "views")
        sortAttribute.views = 1;

    return sortAttribute;
}

function getSortAttributeNextFromSort(sort){
    var sortAttribute = {};    
    if (sort === "latest")
        sortAttribute.timestamp = -1; // desc
    else if (sort === "oldest") 
        sortAttribute.timestamp = 1; // asc, oldest
    else if (sort === "popular"){
        sortAttribute.likes = -1;
        sortAttribute._id = -1;
    }
    else if (sort === "views")
        sortAttribute.views = -1;

    return sortAttribute;
}

function getSortFieldFromSort(sort){
    var sortField = "timestamp";
    if (sort === "popular")
        sortField = "likes";
    else if (sort === "views")
        sortField = "views";

    return sortField;
}

/* GET home page. Default: latest */
router.get('/', function(req, res) {
    res.render('index', {
        title : 'Latest | Totebag Maker | Huge inc.',
        sort : "latest"
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

// validates all uses of the "id" variable.
router.param('id', function(req, res, next, id){
    Totebag.findById(id, function (err, found) {
        // if you can't find this id, take them to the index page.
        if (found === null || typeof found === "undefined")
            handle404(req, res);
        // valid id
        else
            next();
    });    
});

router.get('/:sort', function(req, res) {
    var sort = req.params.sort;
    
    var sortName;
    if (sort === "latest")
        sortName = "Latest";
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

router.get('/:sort/tote/:id', function(req, res) {
    var sort = req.params.sort;
    var id = req.params.id;
    
    var sortName;
    if (sort === "latest")
        sortName = "Latest";
    else if (sort === "oldest")
        sortName = "Oldest";
    else if (sort === "popular")
        sortName = "Popular";
    else if (sort === "views")
        sortName = "Most Views";

    if (typeof sortName === "undefined")
        next();

    res.render('index', {
        title : 'View Tote | Totebag Maker | Huge inc.',
        toteID : id,
        sort : sort
    });
});

// return a single tote json based on sort and index (not id).
router.get("/data/:sort/:index", function(req, res){
    var skip = req.params.index;
    var sort = req.params.sort;
    var sortAttribute = getSortAttributeNextFromSort(sort);

    Totebag.find({},null,{
        skip: skip,
        limit: 1,
        sort: sortAttribute
    }, function(err, totebag) {
        if(err) {
          console.log(err);
          return res.status(500).json("Internal Server Error");  
        }
        return res.status(200).json(totebag);
    });
});

// return a single tote json based on sort and id (not index).
router.get("/data/:sort/tote/:id", function(req, res){
    var id = req.params.id;
    var sort = req.params.sort;

    var sortAttribute = getSortAttributeNextFromSort(sort);

    Totebag.find({}, null, {
        sort: sortAttribute
    }, function(err, totebags) {
        if(err) {
            console.log(err);
            return res.status(500).json("Internal Server Error"); 
        }
        for (var i = 0; i < totebags.length; i++){
            if (("" + totebags[i]._id) === id){
                var clone = JSON.parse(JSON.stringify(totebags[i]));
                
                var prevIndex = i - 1;
                if (prevIndex < 0){
                    prevIndex = totebags.length - 1;
                }
                var nextIndex = i + 1;
                if (nextIndex >= totebags.length){
                    nextIndex = 0;
                }
                clone.index = i;
                clone.nextIndex = nextIndex;
                clone.prevIndex = prevIndex;
                clone.totalBags = totebags.length;

                return res.status(200).json(clone);
            }
        }
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
router.get('/data/:sort/page/:page', function(req, res) {
    var page = req.params.page - 1; //we want index
    var sort = req.params.sort;
    var loadSize = 24;

    var sortAttribute = getSortAttributeNextFromSort(sort);

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
