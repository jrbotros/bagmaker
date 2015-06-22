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

function getSortAttributePrevFromSort(sort){
    var sortAttribute = {};    
    if (sort === "newest")
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
    if (sort === "newest")
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

// get the tote bag that was made after this one
router.get("/data/:sort/:id/next", function(req, res){
    var toteToUpdate = req.params.id;
    var sortName = req.params.sort;

    // find the tote its in reference to
    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err){
            console.log(err);
            return res.status(500).json("Internal Server Error");  
        }

        // save the current value
        var sortField = getSortFieldFromSort(sortName);
        var selValue = totebag[sortField][0];
        var sortAttribute = getSortAttributeNextFromSort(sortName);

        // find all the totebags that have been made AFTER this one, limit 1, sort by oldest
        var query = {};
        if (sortName === "newest"){
            query[sortField] = { $lt : selValue };
        }
        else if (sortName === "oldest"){
            query[sortField] = { $gt : selValue };
        }
        else if (sortName === "popular"){
            var id = totebag._id;
            query[sortField] = { $lte : selValue };
            query._id = { $gt : id };
        }

        Totebag.find( query, null, {
            limit : 1,
            sort : sortAttribute
        }, function(err, next){
            if (next.length === 0){
                Totebag.find({}, null, { limit : 1, sort : sortAttribute }, function(err, least){
                    return res.status(200).json(least);
                });
            }
            // return it.
            else{
                return res.status(200).json(next);
            }
        });
    });
});

// get the tote bag that was made before this one
router.get("/data/:sort/:id/prev", function(req, res){
    var toteToUpdate = req.params.id;
    var sortName = req.params.sort;

    // find the tote its in reference to
    Totebag.findOne({_id: toteToUpdate}, function(err, totebag) {
        if(err){
            console.log(err);
            return res.status(500).json("Internal Server Error");  
        }

        // save the date
        var sortField = getSortFieldFromSort(sortName);
        var selValue = totebag[sortField][0];
        var sortAttribute = getSortAttributePrevFromSort(sortName);

        // find all the totebags that have been made AFTER this one, limit 1, sort by oldest
        var query = {};
        if (sortName === "newest"){
            query[sortField] = { $gt : selValue };
        }
        else if (sortName === "oldest"){
            query[sortField] = { $lt : selValue };
        }
        else if (sortName === "popular"){
            var id = totebag._id;
            query[sortField] = { $gte : selValue };
            query._id = { $gt : id };
        }

        Totebag.find(query, null, {
            limit : 1,
            sort : sortAttribute
        }, function(err, prev){
            if (prev.length === 0){
                Totebag.find({}, null, { limit : 1, sort : sortAttribute }, function(err, biggest){
                    return res.status(200).json(biggest);
                });
            }
            else{
                return res.status(200).json(prev);
            }
        });
    });
});

/* JSON return for all sort and pagination. */
router.get('/data/:sort/:page', function(req, res) {
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
