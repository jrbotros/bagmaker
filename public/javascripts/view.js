var viewPage = {
    // return a $(".tote-grid-element") object most optimally from either
    // a loaded element, or render one if it hasn't be rendered before.
    getToteGridHTML : function(data, callback){
        // if its an array, just take the [0] of it.
        if ( typeof data[0] !== "undefined"){
            data = data[0];
        }

        var toteId = data._id;
        var alreadyLoaded = _.findWhere(browse.toteBags, { "_id" : toteId });
        
        // if it hasn't been loaded before, render it.
        if (typeof alreadyLoaded === "undefined"){
            var toteObj = { bags : [data] };

            $.get("/templates/_bag.html", function(html) {
                var template = Handlebars.compile(html);
                var rendered = template(toteObj);

                var $renderedTote = $("<div />", {
                    "class" : "tote-grid-element view " + toteObj.bags[0].color,
                    "data-id" : toteObj.bags[0]._id,
                    "html" :  rendered
                });

                callback($renderedTote, -1);
            });
        }

        // if we have already rendered it before, just grab the existing html.
        else{
            var toteIndex = _.indexOf(browse.toteBags, alreadyLoaded);
            var $tote = $(".browse-tote-wrap .tote-grid-element").eq(toteIndex);

            var $renderedTote = $("<div />", {
                "class" : $tote.attr("class") + " view",
                "data-id" : toteId,
                "html" :  $tote.html()
            });

            callback($renderedTote, toteIndex);
        }
    },
    nextTote : function(){
        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();
        var toteId = $(".view-carousel .tote-grid-element:last-child").attr("data-id");
        var nextJsonURL = "/data/" + browse.currSort + "/" + toteId + "/next";

        $.getJSON(nextJsonURL, function( data ){

            viewPage.getToteGridHTML(data, function($nextTote, nextToteId){
                
                // if we know the one we're about to be on, but don't know the next loaded one,
                // we then know we're in order and should load more.
                var alreadyLoadedToteObj = _.findWhere(browse.toteBags, { "_id" : toteId });
                if (nextToteId === -1 && typeof alreadyLoadedToteObj !== "undefined"){
                    browse.loadMoreBags();
                }

                // animating a swing with the carousel.
                TweenLite.to(".view-carousel .tote-grid-element .actual-tote", 0.3, {
                    rotation : "-10deg",
                    ease : gridBagBezier,
                    onComplete : function(){
                        TweenLite.to(".view-carousel .tote-grid-element .actual-tote", 0.3, {
                            rotation : "0deg",
                            ease : gridBagBezier,
                        });
                    }
                });
                TweenLite.to(".view-carousel .tote-grid-element .tote-shadow", 0.3, {
                    rotation : "10deg",
                    scaleX : 0.9,
                    ease : gridBagBezier,
                    onComplete : function(){
                        TweenLite.to(".view-carousel .tote-grid-element .tote-shadow", 0.3, {
                            rotation : "0deg",
                            ease : gridBagBezier,
                        });
                    }
                });
            
                TweenLite.to($carousel, 0.5, {
                    x : -dist,
                    ease: cssBezier,
                    onComplete : function() {
                        $carousel.append( $nextTote );

                        $carousel.find(".tote-grid-element:first-child").remove();
                        TweenLite.to($carousel, 0, { x : 0 });

                        $carousel.parents(".view-carousel").attr("data-display", toteId );
                        window.history.pushState("html", "Title", "/totes/" + toteId);

                        // $("head title").html("View Tote | Maker | Huge inc.");
                        site.refreshTypeOnTotes();
                        $(".view-carousel-wrap .tote-grid-element .tote-shadow").css("opacity", "1");
                        $(".view-controls .heart-outer-wrap").attr("class", "heart-outer-wrap " + alreadyLoadedToteObj.color);
                        viewPage.updateLikes();
                        bagObject.upViewCount(toteId);
                    }
                });
            });
        }); 
    },
    prevTote : function(){
        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();
        var toteId = $(".view-carousel .tote-grid-element:first-child").attr("data-id");
        var prevJsonURL = "/data/" + browse.currSort + "/" + toteId + "/prev";

        $.getJSON(prevJsonURL, function( data ){
           viewPage.getToteGridHTML(data, function($prevTote, prevToteId){

                var alreadyLoadedToteObj = _.findWhere(browse.toteBags, { "_id" : toteId });

                // animation
                TweenLite.to(".view-carousel .tote-grid-element .actual-tote", 0.3, {
                    rotation : "10deg",
                    ease : gridBagBezier,
                    onComplete : function(){
                        TweenLite.to(".view-carousel .tote-grid-element .actual-tote", 0.3, {
                            rotation : "0deg",
                            ease : gridBagBezier,
                        });
                    }
                });
                TweenLite.to(".view-carousel .tote-grid-element .tote-shadow", 0.3, {
                    rotation : "-10deg",
                    scaleX : 0.9,
                    ease : gridBagBezier,
                    onComplete : function(){
                        TweenLite.to(".view-carousel .tote-grid-element .tote-shadow", 0.3, {
                            rotation : "0deg",
                            ease : gridBagBezier,
                        });
                    }
                });

                TweenLite.to($carousel, 0.5, {
                    x : dist,
                    ease: cssBezier,
                    onComplete : function() {
                        $carousel.prepend( $prevTote );

                        $carousel.find(".tote-grid-element:last-child").remove();
                        TweenLite.to($carousel, 0, { x : 0 });

                        $carousel.parents(".view-carousel").attr("data-display", toteId );
                        window.history.pushState("html", "Title", "/totes/" + toteId);

                        // $("head title").html("View Tote | Maker | Huge inc.");
                        site.refreshTypeOnTotes();
                        $(".view-carousel-wrap .tote-grid-element .tote-shadow").css("opacity", "1");
                        $(".view-controls .heart-outer-wrap").attr("class", "heart-outer-wrap " + alreadyLoadedToteObj.color);
                        viewPage.updateLikes();
                        bagObject.upViewCount(toteId);
                    }
                });
            });
        });
        
    },
    updateLikes : function(){
        var toteID = $(".view-carousel").attr("data-display");
        
        // user likes it and the button isn't already liked
        if (likes.indexOf(toteID) > -1 && !$(".view-controls .heart-outer-wrap").hasClass("favorited") ){
            likes.favorite($(".view-controls .heart-outer-wrap"));
        }
        // user doesnt like it and the button is liked.
        else if (likes.indexOf(toteID) === -1 && $(".view-controls .heart-outer-wrap").hasClass("favorited")) {
            likes.unfavorite($(".view-controls .heart-outer-wrap"));
        }
    }
};

$(document).ready(function(){
    $(document).hammer().on("tap", ".view-controls button.left", function(){
        viewPage.prevTote();
    });

    $(document).hammer().on("tap", ".view-controls button.right", function(){
        viewPage.nextTote();
    });

    $(document).hammer().on("tap", ".view-carousel.on button.close", function(e){
        e.preventDefault();
        e.stopPropagation();
        
        browse.viewZoomOut();
    });

    $(document).on("keyup", function(e){
        if ($(".view-carousel").hasClass("on")){
            // right
            if (e.keyCode === 39){
                viewPage.nextTote();
            }

            // left
            else if (e.keyCode === 37){
                viewPage.prevTote();
            }

            // up
            else if (e.keyCode === 38){
                var currScroll = $(".view-carousel-wrap").scrollTop();
                $(".view-carousel-wrap").scrollTop(currScroll - 10);
            }

            // down
            else if (e.keyCode === 40){
                var currScroll = $(".view-carousel-wrap").scrollTop();
                $(".view-carousel-wrap").scrollTop(currScroll + 10);
            }
        }
    });

    $(document).hammer().on("drag", ".view-carousel-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var dir = e.gesture.direction;
        if (dir === "left" || dir === "right"){
            TweenLite.to($(this), 0, { "x" : e.gesture.deltaX });
        }
    });

    $(document).hammer().on("dragend", ".view-carousel-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var dir = e.gesture.direction;

        if (dir === "left"){
            viewPage.nextTote();
        }
        else if (dir === "right"){
            viewPage.prevTote();
        }
    });
});