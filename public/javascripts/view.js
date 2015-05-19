var viewPage = {
    nextTote : function(){
        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();

        var nextIndex = parseInt($carousel.find(".tote-grid-element:last-child").attr("data-id"));
        var newIndex = nextIndex + 1;
        if (newIndex >= $(".browse-tote-wrap .tote-grid-element").length )
            newIndex = 0;

        TweenLite.to($carousel, 0.5, {
            x : -dist,
            ease: cssBezier,
            onComplete : function() {
                var $nextTote = $(".browse-tote-wrap .tote-grid-element").eq(newIndex);
                var $addNext = $("<div />", {
                    "class" : $nextTote.attr("class") + " view",
                    "data-id" : newIndex,
                    "html" : $nextTote.html()
                });
                $carousel.append( $addNext );
                $carousel.find(".tote-grid-element:first-child").remove();
                TweenLite.to($carousel, 0, { x : 0 });

                $carousel.parents(".view-carousel").attr("data-display", nextIndex );
                window.history.pushState("html", "Title", "/totes/" + browse.toteBags[nextIndex]._id);
                site.refreshTypeOnTotes();
                viewPage.updateLikes();
            }
        });
    },
    prevTote : function(){
        var $carousel = $(".view-carousel-wrap");
        var dist = $carousel.find(".tote-grid-element").outerWidth();

        var prevIndex = parseInt($carousel.find(".tote-grid-element:first-child").attr("data-id"));
        
        console.log(prevIndex);

        var newIndex = prevIndex - 1;
        if ( newIndex < 0 )
            newIndex = $(".browse-tote-wrap .tote-grid-element").length - 1;

        TweenLite.to($carousel, 0.5, {
            x : dist,
            ease: cssBezier,
            onComplete : function() {
                var $prevTote = $(".browse-tote-wrap .tote-grid-element").eq(newIndex);
                var $addPrev = $("<div />", {
                    "class" : $prevTote.attr("class") + " view",
                    "data-id" : newIndex,
                    "html" : $prevTote.html()
                });
                $carousel.prepend( $addPrev );
                $carousel.find(".tote-grid-element:last-child").remove();
                TweenLite.to($carousel, 0, { x : 0 });

                $carousel.parents(".view-carousel").attr("data-display", prevIndex );
                window.history.pushState("html", "Title", "/totes/" + browse.toteBags[prevIndex]._id);
                site.refreshTypeOnTotes();
                viewPage.updateLikes();
            }
        });
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