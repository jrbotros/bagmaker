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
        
        // loops to the end of the list
        var beforeIndex = toteIndex - 1;
        if (beforeIndex < 0){
            beforeIndex = $tote.siblings().length - 1;
        }
        var $beforeTote = $(".browse-tote-wrap .tote-grid-element").eq(beforeIndex);

        // loops to the first element on the list
        var afterIndex = toteIndex + 1;
        if (afterIndex > $tote.siblings().length - 1){
            afterIndex = 0;
        }
        var $afterTote = $(".browse-tote-wrap .tote-grid-element").eq(afterIndex);

        // create each of the 3 bags.
        var $dupeBefore = $("<div />", {
            "class" : $beforeTote.attr("class") + " view",
            "data-id" : beforeIndex,
            "html" : $beforeTote.html()
        });
        var $dupe = $("<div />", {
            "class" : $tote.attr("class") + " view",
            "data-id" : toteIndex,
            "html" : $tote.html()
        });
        var $dupeAfter = $("<div />", {
            "class" : $afterTote.attr("class") + " view",
            "data-id" : afterIndex,
            "html" : $afterTote.html()
        });

        // add all the shit.
        $(".view-carousel").addClass("on");
        $(".view-carousel-wrap").append($dupeBefore).append($dupe).append($dupeAfter);
        
        // stop it from swinging.
        TweenLite.to(".view-carousel-wrap .tote-grid-element .actual-tote, .view-carousel-wrap .tote-grid-element .tote-shadow", 0, { rotation : "0deg" })
        $(".view-carousel-wrap .tote-grid-element.swinging").removeClass("swinging");

        //update bag size / favorites
        site.refreshTypeOnTotes();
        if ($dupe.find(".heart-outer-wrap").hasClass("favorited")){
            $dupe.parents(".view-carousel").find(".view-controls .heart-outer-wrap").addClass("favorited");
        }
        window.history.pushState("html", "Title", "/totes/" + browse.toteBags[toteIndex]._id);
        $("body").addClass("lock-scroll");

        // scroll user to the bottom of the bag.
        var viewToteHeight = $dupe.height();
        var viewportHeight = $(window).height();
        $(".view-carousel-wrap").scrollTop(viewToteHeight - viewportHeight);
        $(".view-carousel").attr("data-display", toteIndex);
    },
    viewZoomIn : function($tote){
        var x = $tote.offset().left;
        var y = $tote.offset().top - $(window).scrollTop();
        var $dupe = $("<div />", {
            "id" : "zoomAnimation",
            "class" : $tote.attr("class") + "",
            "html" : $tote.html()
        });

        // add all the shit.
        $(".content.browse-page .zoomTransition .zoomAnimationWrapper").append($dupe);
        TweenLite.to($dupe, 0, { x : x, y : y});
        $dupe.removeClass("swinging");
        TweenLite.to($dupe.find(".actual-tote"), 0.3, { rotation: "0deg" });
        TweenLite.to($dupe.find(".tote-shadow"), 0.3, { rotation: "0deg" });

        site.refreshTypeOnTotes();
        $("body").addClass("lock-scroll");
        
        // animating to full screen
        var currWidth = $dupe.outerWidth();
        var currHeight = $dupe.outerHeight();
        var windowWidth = $(window).width();
        var ratio = Math.round(windowWidth / currWidth);
        var toBeWidth = currWidth * ratio;
        var toBeHeight = currHeight * ratio;
        $(".zoomTransition").scrollTop(toBeHeight - $(window).height());

        TweenLite.to($dupe, 0.5, {
            x : (ratio - 1) * 1/2 * currWidth,
            y : 0,
            scale : ratio,
            ease : cssBezier,
            onComplete : function(){
                site.refreshTypeOnTotes();
                browse.view($tote);
                
                setTimeout(function(){
                    $("#zoomAnimation").remove();
                }, 1000);
            }
        });
    },
    viewZoomOut : function($tote){

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

$(document).ready(function(){
    likes.fetchUserLikes();
    browse.loadBags(browse.buildBagGrid);

    $(".sort ul li").hammer().on("tap", function(){
        browse.sort($(this));
    });

    $(document).hammer().on("tap", ".heart-outer-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var toteIndex;

        // its in the view mode
        if ($(this).parents(".view-controls").length > 0){
            var index = $(this).parents(".view-carousel").attr("data-display");
            toteIndex = parseInt(index);
        }
        else{
            var $gridEle = $(this).parents(".tote-grid-element");
            toteIndex = $gridEle.index();
        }
       
        var toteBag = browse.toteBags[toteIndex];
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

    $(document).on("mouseenter", ".browse-tote-wrap .tote-grid-element", function(){
        browse.swing($(this));
    });

    $(document).on("mouseleave", ".browse-tote-wrap .tote-grid-element", function(){
        browse.stopSwing($(this));
    });

    $(".tote-grid-element").hover(function(){
        browse.swing($(this));
    }, function(){
        browse.stopSwing($(this));
    });

    $(document).hammer().on("tap", ".browse-tote-wrap .tote-grid-element", function(e){
        e.preventDefault();
        e.stopPropagation();

        browse.viewZoomIn($(this));
    });
});