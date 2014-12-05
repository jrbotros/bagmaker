// enlargement multiplier, remember to change in css too.
var multiplier = 1.1;

// largest number of columns evaaaa.
var maxColumns = 4;

// current number of columns;
var currColumns = 4;

// columnBreakPoints
var oneColumnMax = 800;
var twoColumnMax = 1150;
var threeColumnMax = 1500;

// array of all the totebags
var toteBags = [];

// how many per page
var loadChunk = currColumns * 3;
var currPage = 0;
var totalPages;

// loads all the bags into array
function loadBags(){
    $.getJSON('/totes', function( data ){
        toteBags = sortByKey(data, "timestamp", "desc");
        totalPages = Math.ceil(toteBags.length / loadChunk);
        buildBagGrid(data);
    });
}

function buildBagGrid(data){
    // up the page number
    if (currPage < totalPages){
        currPage++;
    }
    else{
        return;
    }
    var start = (currPage - 1) * loadChunk;
    var end = currPage * loadChunk;
    if (end > data.length)
        end = data.length;

    //$.each(data, function(i, tote){
    for (var i = start; i < end; i++){
        var tote = data[i];

        var $toteHTML = $("<div/>", {
            id : "tote-" + tote.bagNum,
            class : "tote-grid-element tote start",
            html :  "<div class='heart-wrap'>" +
                        "<div class='heart-circle'></div>" +
                        "<div class='heart'>" + 
                            "<div class='inner-heart grey'></div>" +
                            "<div class='inner-heart white'></div>" +
                        "</div>" +
                    "</div>" +
                    "<div class='grid-wrap'>" + 
                        "<div class='actual-tote"  + " " + tote.size + " " + tote.color + "'>" +
                            "<div class='text-wrap'>" + tote.text + "</div>" +
                            "<div class='shadow-blur'><div class='tote-shadow'></div></div>" +
                        "</div>" + 
                    "</div>"
        });

        $toteHTML.find(".text-wrap").css("text-align", tote.justification);
        $toteHTML.find(".text-wrap").css("font-size", tote.fontSize + "em");
        $toteHTML.find(".text-wrap").css("letter-spacing", tote.kerning + "em");
        $toteHTML.find(".text-wrap").css("line-height", tote.leading + "em");

        var dist = Number(tote.yAxis) * multiplier / maxColumns;

        $toteHTML.find(".text-wrap").css("transform", "translateY(" + dist + "px)" );
        $toteHTML.find(".text-wrap").css("-webkit-transform", "translateY(" + dist + "px)" );
        $toteHTML.find(".text-wrap").css("-moz-transform", "translateY(" + dist + "px)" );

        $toteHTML.appendTo(".browse-tote-wrap");
    }
    //});
    
    resizeHandler();
    checkFavorites();

    // checks if its a view mode.
    if ($(".overlay-tote").length > 0){
        $(".tote-grid-element, .featured-carousel").addClass("no-transition");
        $(".tote-grid-element").removeClass("start");
        $(".featured-carousel").addClass("on");


        var bagNum = $(".overlay-tote").attr("id").substr(14);
        if ( !$("#tote-" + bagNum).hasClass("overlayed") ){
            $("#tote-" + bagNum).addClass("overlayed");
            checkArrows();
        }

        // remove no-transition after a bit.
        setTimeout(function(){
            $(".featured-carousel, .tote-grid-element").removeClass("no-transition");
        },300);
    }
    else{
        animateIn(start, $.noop);        
    }

}

// for the animations: spits out what order
// number a certain index in the list should be
function gridOrderHelper(input){
    var mod = input % (currColumns * 2);
    if (mod < currColumns){
        return input;
    }
    else{
        return (input + ((currColumns - 1) - ( mod - currColumns) * 2));
    }
}

// Animate grid in is a recursive function.
function animateIn(startIndex, callback){
    startIndex = startIndex || 0;
    animateInHelper(startIndex, callback);
}
function animateInHelper(ind, callback){
    var totalGridElements = $(".tote-grid-element").length;
    if (ind > totalGridElements) {
        setTimeout(function(){
            if (callback && callback != undefined){
                callback();
            }
        }, ind * 20);
        return;
    }
    else{
        setTimeout(function(){
            var output = gridOrderHelper(ind);
            $(".tote-grid-element").eq(output).removeClass("start");
            animateInHelper(ind+1, callback);

        }, ind * 20);
    }
}

// Animate grid out is the opposite of animateIn. Also, recursive.
function animateOut(callback){
    var totalGridElements = $(".tote-grid-element").length;
    // if (totalGridElements >= loadChunk){
    //     totalGridElements = loadChunk;
    // }

    animateOutHelper( totalGridElements - 1, callback );
}
function animateOutHelper(ind, callback){
    var elementNum = $(".tote-grid-element").length;
    if (ind < 0) {
        setTimeout(function(){
            if (callback && callback != undefined){
                callback();
            }
        }, elementNum * 20);
        return;
    }
    else{
        setTimeout(function(){
            var output = gridOrderHelper(ind);
            $(".tote-grid-element").eq(output).addClass("start");
            animateOutHelper(ind-1, callback);
        }, (elementNum - ind) * 10);
    }
}


function resizeHandler(){
    var wWidth = $(window).width();
    var numColumns = 4;

    if (wWidth <= oneColumnMax){
        numColumns = 1;
    }
    else if (wWidth > oneColumnMax && wWidth <= twoColumnMax){
        numColumns = 2;
    }
    else if (wWidth > twoColumnMax && wWidth <= threeColumnMax){
        numColumns = 3;
    }
    else{
        numColumns = 4;
    }


    // if its already this number of columns, return.
    if (currColumns === numColumns){
        return;
    }

    var ratio = numColumns / maxColumns;

    // update all the distances.
    $.each(toteBags, function(i, tote){

        var dist = Number(tote.yAxis) * ratio * multiplier / numColumns;
    
        var $tote = $("#tote-" + tote.bagNum);
        $tote.find(".text-wrap").css("transform", "translateY(" + dist + "px)" );
        $tote.find(".text-wrap").css("-webkit-transform", "translateY(" + dist + "px)" );
        $tote.find(".text-wrap").css("-moz-transform", "translateY(" + dist + "px)" );
    
    });

    // update currColumns to how many columns exist now.
    currColumns = numColumns;
}

function checkFavorites(){
    $.each(toteBags, function(i, tote){
        if (hasLike(tote._id)){
            $("#tote-" + tote.bagNum + " .heart-wrap").addClass("favorited");
        }
    });
}

function returnToteByIndex(toteIndex){
    for (var i = 0, numBags = toteBags.length; i < numBags; i++) {
        if(toteBags[i].bagNum == toteIndex) {
            return toteBags[i];
        }
    }
}

$(document).ready(function(){
    loadBags();
    $(window).resize(function(){
        resizeHandler();
    });

    // Sort by dropdown
    $(document).hammer().on("tap", ".sort .selected-sort", function(){
        $(this).find("ul").toggleClass("open");
    });
    $(document).hammer().on("tap", "li.item", function(){
        var $item = $(this);
        var sortName = $item.html();

        if ( $(".sort .selected-sort .name").html() === sortName ){
            return;
        }

        animateOut(function(){
            window.scrollTo(0, 0);
            $(".tote-grid-element").remove();
            var sortAttr = $item.attr("data-attr");
            var sortDir = $item.attr("data-dir");

            $(".sort .selected-sort .name").html(sortName);
            var newToteBags = sortByKey(toteBags, sortAttr, sortDir);
            currPage = 0;
            buildBagGrid(newToteBags);
        });
    });

    $(window).scroll(function(){
        var scrollPos = $(window).scrollTop();
        var bottomView = scrollPos + $(window).height();
        
        var docHeight = $(document).height();
        var cardHeight = $(".tote-grid-element").height();
        var threshold = docHeight - cardHeight;

        if ( currPage < totalPages && bottomView > threshold ){
            buildBagGrid(toteBags);
        }
    });

    // handling tapping into view mode
    $(document).hammer().on("tap", ".tote-grid-element", function(){
        var toteIndex = Number($(this).attr("id").substr(5));
        $(this).addClass("overlayed");
        var thisTote = returnToteByIndex(toteIndex);

        showTote(toteIndex, thisTote, function(){
            $(".featured-carousel").addClass("on");
            checkArrows();
        })
    });

    // closing out of overlay mode
    $(document).hammer().on("tap", ".close-overlay", function(){
        hideTote();
    });
    $(document).hammer().on("tap", ".arrow.left", function(){
        prevTote();
    });
    $(document).hammer().on("tap", ".arrow.right", function(){
        nextTote();
    });

    // handling hitting the like action.
    $(document).hammer().on("tap", ".heart-wrap", function(e){
        e.stopPropagation();

        // identify index and ID.
        var $tote = $(this).parents(".tote");
        var toteIndex;
        if ($tote.hasClass("featured-carousel")){
            toteIndex = Number($(".overlay-tote").attr("id").substr(14)); 
        }
        else{
            toteIndex = Number($tote.attr("id").substr(5));
        }

        var thisTote = returnToteByIndex(toteIndex);
        var toteId = thisTote._id;

        // if the user already likes this, like--, if they don't, like++
        var userAlreadyLikesThis = $(this).hasClass("favorited");

        if (userAlreadyLikesThis){
            thisTote.likes = Number(thisTote.likes) - 1;
        }
        else{
            thisTote.likes = Number(thisTote.likes) + 1;
        }

        // clone data element so we can remove the _id and add back to mongo
        var newTote = jQuery.extend(true, {}, thisTote);
        delete newTote._id;

        // update database.
        $.ajax({
            type: 'PUT',
            data: newTote,
            url: '/totes/updatetote/' + toteId
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {
                if (userAlreadyLikesThis){
                    removeLike(toteId);
                    $("#tote-" + thisTote.bagNum + " .heart-wrap").removeClass("favorited");
                    $(".featured-carousel .heart-wrap").removeClass("favorited");
                }
                else{
                    addLike(toteId);
                    $("#tote-" + thisTote.bagNum + " .heart-wrap").addClass("favorited");
                    $(".featured-carousel .heart-wrap").addClass("favorited");
                }
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                console.log('Error: ' + response.msg);
            }
        });
    });
});


