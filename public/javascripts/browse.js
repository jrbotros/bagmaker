var browse = {
    toteBags : null, // array of tote objects

    sort : function($li){
        var attr = $li.attr("data-attr");
        var dir = $li.attr("data-dir");


        // delete if statement after we figure out how to scope variables in mongodb 
        if (attr === "likes"){
            browse.toteBags = _.sortBy(browse.toteBags, function(bag){
                return parseInt(bag.likes);
            });
        }
        else{
            browse.toteBags = _.sortBy(browse.toteBags, attr);
        }
        if (dir === "desc")
            browse.toteBags = browse.toteBags.reverse();
        browse.animateOut(function(){
            $(".browse-tote-wrap").empty();
            browse.buildBagGrid();
        });

        $("nav .sort .name").html($li.html());
    },
    gridOrderHelper : function(input){
        var gridWidth = $(".tote-grid-element").width();
        var currColumns = Math.round($(window).width() / gridWidth);
        var mod = input % (currColumns * 2);

        if (mod < currColumns){
            return input;
        }
        else{
            return (input + ((currColumns - 1) - ( mod - currColumns) * 2));
        }
    },
    animateIn : function(startIndex, callback){
        startIndex = startIndex || 0;
        browse.animateInHelper(startIndex, callback);
    },
    animateInHelper : function(ind, callback){
        var totalGridElements = $(".tote-grid-element").length;
        if (ind >= totalGridElements) {
            setTimeout(function(){
                if (callback && callback !== undefined){
                    callback();
                }
            }, ind * 20);
            return;
        }
        else{
            setTimeout(function(){
                var output = browse.gridOrderHelper(ind);

                if ( $(".tote-grid-element").eq(output).length === 0 ){
                    output = ind;
                }

                //console.log(ind, output);
                $(".tote-grid-element").eq(output).removeClass("start");
                browse.animateInHelper(ind+1, callback);

            }, ind * 20);
        }
    },
    // Animate grid out is the opposite of animateIn. Also, recursive.
    animateOut : function(callback){
        var totalGridElements = $(".tote-grid-element").length;
        // if (totalGridElements >= loadChunk){
        //     totalGridElements = loadChunk;
        // }
        browse.animateOutHelper( totalGridElements - 1, callback );
    },
    animateOutHelper : function(ind, callback){
        var elementNum = $(".tote-grid-element").length;
        if (ind < 0) {
            setTimeout(function(){
                if (callback && callback !== undefined){
                    callback();
                }
            }, elementNum * 20);
            return;
        }
        else{
            setTimeout(function(){
                var output = browse.gridOrderHelper(ind);
                $(".tote-grid-element").eq(output).addClass("start");
                browse.animateOutHelper(ind-1, callback);
            }, (elementNum - ind) * 10);
        }
    },
    // grab tote data
    loadBags : function(callback){
        if (browse.toteBags === null){
            $.getJSON('/totes', function( data ){
                // sort it by time - newest
                browse.toteBags = _.sortBy(data, function(tote){
                    return tote.timestamp;
                });
                browse.toteBags = browse.toteBags.reverse();

                // build grid.
                //totalPages = Math.ceil(toteBags.length / loadChunk);
                if (typeof callback !== "undefined"){
                    callback();
                }
            });
        }
        else{
            if (typeof callback !== "undefined"){
                callback();
            }
        }

    },
    buildBagGrid : function(){
        _.each(browse.toteBags, function(tote){

            // temporary hack for not being able to save json properly
            if (typeof tote.textfields === "string")
                tote.textfields = JSON.parse(tote.textfields);
            tote.swingTimer = null;
            var toteObj = {bags : [tote]};

            // create a slightly modified bag template html for each (add favoriting)
            $.get("/templates/_bag.html", function(html) {
                var template = Handlebars.compile(html);
                var rendered = template(toteObj);

                // marking which ones are favorited.
                var heartWrap = "<div class='heart-outer-wrap'><div class='heart-wrap'>";
                var toteID = toteObj.bags[0]._id;
                if (likes.indexOf(toteID) > -1){
                    heartWrap = "<div class='heart-outer-wrap favorited'><div class='heart-wrap'>";
                }

                heartWrap += "<div class='heart-circle'></div>" +
                                "<div class='heart'>" + 
                                    "<div class='inner-heart grey'></div>" +
                                    "<div class='inner-heart magenta'></div>" +
                                    "<div class='inner-heart white'></div>" +
                                "</div>" +
                            "</div></div>";

                var $tote = $("<div />", {
                    //id : "tote-" + tote._id,
                    class : "tote-grid-element start " + toteObj.bags[0].color,
                    html :  heartWrap + rendered
                }).appendTo(".browse-page.content .browse-tote-wrap");

                // on the last one, update the type sizing and animate it in.
                if (tote == browse.toteBags[browse.toteBags.length-1]){
                    $('.browse-page.content .browse-tote-wrap .clearfix').remove();
                    $('.browse-page.content .browse-tote-wrap').append("<div class='clearfix'></div>");
                    site.refreshTypeOnTotes();
                    browse.animateIn();
                }
            });
        });        
    },
    // positions the view carousel with the $tote centered.
    view : function($tote){
        var toteIndex = $tote.index();
        
        var beforeIndex = toteIndex - 1;
        if (beforeIndex < 0){
            beforeIndex = $tote.siblings().length - 1;
        }
        var $beforeTote = $(".browse-tote-wrap .tote-grid-element").eq(beforeIndex);

        var afterIndex = toteIndex + 1;
        if (afterIndex > $tote.siblings().length - 1){
            afterIndex = 0;
        }
        var $afterTote = $(".browse-tote-wrap .tote-grid-element").eq(afterIndex);

        var $dupeBefore = $("<div />", {
            "class" : $beforeTote.attr("class") + "",
            "data-id" : beforeIndex,
            "html" : $beforeTote.html()
        });
        var $dupe = $("<div />", {
            "class" : $tote.attr("class") + "",
            "data-id" : toteIndex,
            "html" : $tote.html()
        });
        var $dupeAfter = $("<div />", {
            "class" : $afterTote.attr("class") + "",
            "data-id" : afterIndex,
            "html" : $afterTote.html()
        });

        $(".view-carousel").addClass("on");
        $(".view-carousel-wrap").append($dupeBefore).append($dupe).append($dupeAfter);
        site.refreshTypeOnTotes();
        $("body").addClass("lock-scroll");
    },
    swingOnce : function($bag){
        // var $bag = $(".tote-grid-element").eq(index);
        var $tote = $bag.find(".actual-tote");
        var $shadow = $bag.find(".tote-shadow");

        // $shadow.parents(".shadow-blur").css("opacity", "1");

        //start at 0
        // swing to the left
        TweenLite.to($shadow, 0.5, { rotation : "-4deg", scaleX : 0.9, ease : gridBagBezier });
        TweenLite.to($tote, 0.5, {
            rotation : "5deg",
            ease : gridBagBezier,
            onComplete : function(){
                // swing to the right, double the distance, double the time.
                TweenLite.to($shadow, 0.5, {
                    rotation : "0deg",
                    scaleX : 1,
                    ease : gridBagBezier,
                    onComplete: function(){
                        TweenLite.to($shadow, 0.5, {
                            rotation : "4deg",
                            scaleX : 0.9,
                            ease : gridBagBezier
                        });
                    }
                });
                TweenLite.to($tote, 1, {
                    rotation : "-5deg",
                    ease : gridBagBezier,
                    onComplete : function(){
                        // swing back to 0
                        TweenLite.to($shadow, 0.5, {
                            rotation : "0deg",
                            scaleX : 1,
                            ease : gridBagBezier,
                            onComplete : function(){
                                // $shadow.parents(".shadow-blur").css("opacity", "0");
                            }
                        });
                        TweenLite.to($tote, 0.5, {
                            rotation : "0deg",
                            ease : gridBagBezier
                        });
                    }
                });    
            }
        });
    },
    swing : function($tote){
        var index;
        if (typeof $tote.attr("data-id") === "undefined") index = $tote.index();
        else index = parseInt($tote.attr("data-id"));

        if ( !$tote.hasClass("swinging") ){
            browse.swingOnce($tote);
            $tote.addClass("swinging");
            browse.toteBags[index].swingTimer = setInterval(function(){browse.swingOnce($tote)}, 1900);
        }
        // rolling over something thats already swinging
        else{
            clearTimeout(browse.toteBags[index].stopTimer);
        }
    },
    stopSwing : function($tote){
        var index;
        if (typeof $tote.attr("data-id") === "undefined") index = $tote.index();
        else index = parseInt($tote.attr("data-id"));

        browse.toteBags[index].stopTimer = setTimeout(function(){
            $tote.removeClass("swinging");
            clearInterval(browse.toteBags[index].swingTimer);
        }, 500);
    }
};

var gridElement = {
    data : null
}

$(document).ready(function(){
    likes.fetchUserLikes();
    browse.loadBags(browse.buildBagGrid);

    $(".sort ul li").hammer().on("tap", function(){
        browse.sort($(this));
    });

    $(document).hammer().on("tap", ".heart-outer-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var $gridEle = $(this).parents(".tote-grid-element");
        var toteBag = browse.toteBags[$gridEle.index()];
        var toteID = toteBag._id;

        //likes.toggleLike(toteID);
        if ($(this).hasClass("favorited")){
            likes.unfavorite($(this).find(".heart-wrap"));
            likes.unlikeBag(toteID);
        }
        else{
            likes.favorite($(this).find(".heart-wrap"));
            likes.likeBag(toteID);
        }
    });

    $(document).on("mouseenter", ".tote-grid-element", function(){
        browse.swing($(this));
    });

    $(document).on("mouseleave", ".tote-grid-element", function(){
        browse.stopSwing($(this));
    });

    $(".tote-grid-element").hover(function(){
        browse.swing($(this));
    }, function(){
        browse.stopSwing($(this));
    });
});