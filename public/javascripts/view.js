var viewPage = {
    nextTote : function(){
        if ($(".view-controls button.right").hasClass("disabled")) return;

        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();
        var nextIndex = parseInt($carousel.find(".tote-grid-element:last-child").attr("data-id"));
        var newIndex = nextIndex + 1;

        // catch for loading more.
        if (newIndex >= $(".browse-tote-wrap .tote-grid-element").length ){
            if (!browse.loadedAll){
                browse.loadBags( function(){ 
                    browse.buildBagGrid(false, function(){
                        slideNextAnimation();
                    });
                });
            }
            else{
                newIndex = -1;
                slideNextAnimation();
                $(".view-controls button.right").addClass("disabled");
            }
        }
        else{
            slideNextAnimation();
        }

        function slideNextAnimation(){
            TweenLite.to($carousel, 0.5, {
                x : -dist,
                ease: cssBezier,
                onComplete : function() {
                    var $addNext;
                    if (newIndex !== -1){
                        var $nextTote = $(".browse-tote-wrap .tote-grid-element").eq(newIndex);
                        $addNext = $("<div />", {
                            "class" : $nextTote.attr("class") + " view",
                            "data-id" : newIndex,
                            "html" : $nextTote.html()
                        });
                    }
                    else{
                        $addNext = $("<div />", {
                            "class" : "empty tote-grid-element black",
                            "data-id" : -1,
                            "html" : ""
                        });
                    }
                    $carousel.append( $addNext );

                    $carousel.find(".tote-grid-element:first-child").remove();
                    TweenLite.to($carousel, 0, { x : 0 });
                    $(".view-controls button.left").removeClass("disabled");

                    $carousel.parents(".view-carousel").attr("data-display", nextIndex );
                    var toteId = browse.toteBags[nextIndex]._id;
                    window.history.pushState("html", "Title", "/totes/" + toteId);

                    // $("head title").html("View Tote | Maker | Huge inc.");
                    site.refreshTypeOnTotes();
                    viewPage.updateLikes();
                    bagObject.upViewCount(toteId);
                }
            });
        }
        
    },
    prevTote : function(){
        if ($(".view-controls button.left").hasClass("disabled")) return;

        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();
        var prevIndex = parseInt($carousel.find(".tote-grid-element:first-child").attr("data-id"));
        var newIndex = prevIndex - 1;

        // catch for loading more.
        if (newIndex < 0 ){
            newIndex = -1;
            slidePrevAnimation();
            $(".view-controls button.left").addClass("disabled");
        }
        else{
            slidePrevAnimation();
        }

        function slidePrevAnimation(){
            TweenLite.to($carousel, 0.5, {
                x : dist,
                ease: cssBezier,
                onComplete : function() {
                    var $addPrev;
                    if (newIndex !== -1){
                        var $prevTote = $(".browse-tote-wrap .tote-grid-element").eq(newIndex);
                        $addPrev = $("<div />", {
                            "class" : $prevTote.attr("class") + " view",
                            "data-id" : newIndex,
                            "html" : $prevTote.html()
                        });
                    }
                    else {
                        $addPrev = $("<div />", {
                            "class" : "empty tote-grid-element black",
                            "data-id" : -1,
                            "html" : ""
                        });
                    }
                    
                    $carousel.prepend( $addPrev );
                    $carousel.find(".tote-grid-element:last-child").remove();
                    TweenLite.to($carousel, 0, { x : 0 });
                    $(".view-controls button.right").removeClass("disabled");

                    $carousel.parents(".view-carousel").attr("data-display", prevIndex );
                    var toteId = browse.toteBags[prevIndex]._id;
                    window.history.pushState("html", "Title", "/totes/" + toteId);

                    // $("head title").html("View Tote | Maker | Huge inc.");
                    site.refreshTypeOnTotes();
                    viewPage.updateLikes();
                    bagObject.upViewCount(toteId);
                }
            });
        }
    },
    updateLikes : function(){
        var toteIndex = parseInt($(".view-carousel").attr("data-display"));
        var toteID = browse.toteBags[toteIndex]._id;

        // user likes it and the button isn't already liked
        if (likes.indexOf(toteID) > -1 && !$(".view-controls .heart-outer-wrap").hasClass("favorited") ){
            likes.favorite($(".view-controls .heart-outer-wrap .heart-wrap"));
        }
        // user doesnt like it and the button is liked.
        else if (likes.indexOf(toteID) === -1 && $(".view-controls .heart-outer-wrap").hasClass("favorited")) {
            likes.unfavorite($(".view-controls .heart-outer-wrap .heart-wrap"));
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
    })

    $(document).on("keyup", function(e){
        if ($(".view-carousel").hasClass("on")){
            // right
            if (e.keyCode === 39)
                viewPage.nextTote();

            // left
            else if (e.keyCode === 37)
                viewPage.prevTote();

            // up
            else if (e.keyCode === 38){
                currScroll = $(".view-carousel-wrap").scrollTop();
                $(".view-carousel-wrap").scrollTop(currScroll - 10);
            }

            // down
            else if (e.keyCode === 40){
                currScroll = $(".view-carousel-wrap").scrollTop();
                $(".view-carousel-wrap").scrollTop(currScroll + 10);
            }
        }
    });

    $(document).hammer().on("drag", ".view-carousel-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var dir = e.gesture.direction;
        if (dir == "left" || dir == "right"){
            TweenLite.to($(this), 0, { "x" : e.gesture.deltaX });
        }
    });

    $(document).hammer().on("dragend", ".view-carousel-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var dir = e.gesture.direction;

        if (dir == "left")
            viewPage.nextTote();
        else if (dir == "right")
            viewPage.prevTote();
    });
});