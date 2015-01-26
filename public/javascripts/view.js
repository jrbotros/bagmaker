function showActualTote(bagNum, theTote, callback){
    var $toteHTML = $("<div/>", {
        id : "featured-tote-" + bagNum,
        class : "overlay-tote", //start
        html :  "<div class='grid-wrap" + " " + theTote.size + " " + theTote.color + "'>" + 
                    "<div class='actual-tote'>" +
                        "<div class='text-wrap'>" + theTote.text + "</div>" +
                        "<div class='shadow-blur'><div class='tote-shadow'></div></div>" +
                    "</div>" + 
                "</div>"
    });

    $toteHTML.find(".text-wrap").css("text-align", theTote.justification);
    $toteHTML.find(".text-wrap").css("font-size", theTote.fontSize + "em");
    $toteHTML.find(".text-wrap").css("letter-spacing", theTote.kerning + "em");
    $toteHTML.find(".text-wrap").css("line-height", theTote.leading + "em");

    var dist = Number(theTote.yAxis);

    $toteHTML.find(".text-wrap").css("transform", "translateY(" + dist + "px)" );
    $toteHTML.find(".text-wrap").css("-webkit-transform", "translateY(" + dist + "px)" );
    $toteHTML.find(".text-wrap").css("-moz-transform", "translateY(" + dist + "px)" );

    if (hasLike( theTote._id )){
        $(".featured-carousel .heart-wrap").addClass("favorited");
    }
    else{
        $(".featured-carousel .heart-wrap").removeClass("favorited");
    }

    $toteHTML.appendTo(".featured-carousel-wrap");

    if (callback && callback != undefined){
        callback();
    }
}

function featuredResizeHandler(){
    if ($(".overlay-tote").length > 0){
        
        var maxWidth;
        var featuredWidth = $(".overlay-tote .grid-wrap").width();
         
        if ( $(".overlay-tote .grid-wrap").hasClass("big") ) {
            maxWidth = 750;
        }
        else{
            maxWidth = 600;
        }

        if (featuredWidth < maxWidth){
            var scaleValue = featuredWidth / maxWidth;
            $(".overlay-tote").css("font-size", scaleValue + "em" );
        }
        else{
            $(".overlay-tote").css("font-size", "1em" );
        }
    }
}

function showTote(bagNum, theTote, callback){
    $("body").addClass("lock-scroll");
    showActualTote(bagNum, theTote, callback);
    featuredResizeHandler();

    // change the url without reloading!
    window.history.pushState("html", "Title", "/totes/" + bagNum);
    ga('send', 'pageview');
    window.onpopstate = function(e){
        location.reload();
    };


    $(window).bind("resize", featuredResizeHandler );
}

function checkArrows(){
    // determines if we should hide any arrows
    if ( $(".tote-grid-element.overlayed").html() === $(".tote-grid-element").eq(0).html() ){
        $(".arrow.left").addClass("disabled");
    }
    else{
        $(".arrow.left").removeClass("disabled");
    }
    if ( $(".tote-grid-element.overlayed").html() === $(".tote-grid-element").eq($(".tote-grid-element").length-1).html() ){
        $(".arrow.right").addClass("disabled");
    }
    else{
        $(".arrow.right").removeClass("disabled");
    }
}
function animateCallBack(){
    $(".overlay-tote:not(.temp)").remove();
    $(".featured-carousel-wrap").removeClass("animating next prev");
    $(".overlay-tote").removeClass('next prev temp');
    TweenLite.to(".featured-carousel-wrap", 0, {x : "0%"} );
    checkArrows();
}
function nextTote(){
    var nextId = $(".tote-grid-element.overlayed").next(".tote-grid-element").attr("id").substr(5);
    var nextJson = returnToteByIndex(nextId);
    showActualTote(nextId, nextJson, function(){
        $(".featured-carousel-wrap").addClass("animating next");
        $("#featured-tote-" + nextId).addClass("next temp");

        window.history.pushState("html", "Title", "/totes/" + nextId);
        $(".tote-grid-element.overlayed").removeClass("overlayed");
        $("#tote-" + nextId).addClass("overlayed");
        if ($("#tote-" + nextId).find(".heart-wrap").hasClass("favorited")){
            $(".featured-carousel .heart-wrap").addClass("favorited");
        }
        else{
            $(".featured-carousel .heart-wrap").removeClass("favorited");   
        }

        TweenLite.to(".featured-carousel-wrap", 0.5, {x : "-50%", onComplete:animateCallBack} );
    });
}
function prevTote(){
    var prevId = $(".tote-grid-element.overlayed").prev(".tote-grid-element").attr("id").substr(5);
    var prevJson = returnToteByIndex(prevId);
    showActualTote(prevId, prevJson, function(){
        $(".featured-carousel-wrap").addClass("animating prev");
        $("#featured-tote-" + prevId).addClass("prev temp");

        window.history.pushState("html", "Title", "/totes/" + prevId);
        $(".tote-grid-element.overlayed").removeClass("overlayed");
        $("#tote-" + prevId).addClass("overlayed");
        if ($("#tote-" + prevId).find(".heart-wrap").hasClass("favorited")){
            $(".featured-carousel .heart-wrap").addClass("favorited");
        }
        else{
            $(".featured-carousel .heart-wrap").removeClass("favorited");   
        }

        TweenLite.to(".featured-carousel-wrap", 0.5, {x : "50%", onComplete:animateCallBack} );
    });
}

function hideTote(callback){
    $(".featured-carousel").removeClass("on");
    $("body").removeClass("lock-scroll");
    window.history.pushState("html", "Title", "/");
    $(window).unbind("resize", featuredResizeHandler );
    $(".tote-grid-element.overlayed").removeClass("overlayed");

    setTimeout(function(){
        $(".overlay-tote").remove();

        if (callback && callback != undefined){
            callback();
        }
    }, 700); //time matches css.
}

$(document).ready(function(){


});