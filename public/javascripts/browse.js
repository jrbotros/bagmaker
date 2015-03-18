var browse = {
    toteBags : [], // array of tote objects

    sort : function(attr, dir){
        browse.toteBags = _.sortBy(browse.toteBags, attr);
        if (dir === "desc")
            browse.toteBags = browse.toteBags.reverse();
        browse.animateOut(function(){
            $(".browse-tote-wrap").empty();
            browse.buildBagGrid();
        });
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
    loadBags : function(){
        $.getJSON('/totes', function( data ){
            // sort it by time - newest
            browse.toteBags = _.sortBy(data, function(tote){
                return tote.timestamp;
            });
            browse.toteBags = browse.toteBags.reverse();

            // build grid.
            //totalPages = Math.ceil(toteBags.length / loadChunk);
            browse.buildBagGrid();
        });
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
                var $tote = $("<div />", {
                    //id : "tote-" + tote._id,
                    class : "tote-grid-element start",
                    html :  "<div class='heart-wrap'>" +
                                "<div class='heart-circle'></div>" +
                                "<div class='heart'>" + 
                                    "<div class='inner-heart grey'></div>" +
                                    "<div class='inner-heart white'></div>" +
                                "</div>" +
                            "</div>" + rendered
                }).appendTo(".browse-page.content .browse-tote-wrap");

                // on the last one, update the type sizing and animate it in.
                if (tote == browse.toteBags[browse.toteBags.length-1]){
                    site.refreshTypeOnTotes();
                    browse.animateIn();
                }
            });
        });        
    },
    swingOnce : function(index){
        var $bag = $(".tote-grid-element").eq(index);
        var $tote = $bag.find(".actual-tote");
        var $shadow = $bag.find(".tote-shadow");

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
                        TweenLite.to($shadow, 0.5, { rotation : "0deg", scaleX : 1, ease : gridBagBezier });
                        TweenLite.to($tote, 0.5, {
                            rotation : "0deg",
                            ease : gridBagBezier
                        });
                    }
                });    
            }
        });
    },
    swing : function(index){
        if ( !$(".tote-grid-element").eq(index).hasClass("swinging") ){
            browse.swingOnce(index);
            $(".tote-grid-element").eq(index).addClass("swinging");
            browse.toteBags[index].swingTimer = setInterval(function(){browse.swingOnce(index)}, 1900);    
        }
    },
    stopSwing : function(index){
        $(".tote-grid-element").eq(index).removeClass("swinging");
        clearInterval(browse.toteBags[index].swingTimer);
    }
};

var gridElement = {
    data : null
}

$(document).ready(function(){
    browse.loadBags();

    $(".sort ul li").hammer().on("tap", function(){
        var attr = $(this).attr("data-attr");
        var dir = $(this).attr("data-dir");
        browse.sort(attr, dir);
    });

    $(document).hammer().on("tap", ".heart-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        $(this).toggleClass("favorited");
    });

    $(document).on("mouseenter", ".tote-grid-element", function(){
        var index = $(this).index();
        browse.swing(index);
    });
    $(document).on("mouseleave", ".tote-grid-element", function(){
        var index = $(this).index();
        browse.stopSwing(index);
    });

    $(".tote-grid-element").hover(function(){
        var index = $(this).index();
        browse.swing(index);
    }, function(){
        var index = $(this).index();
        browse.stopSwing(index);
    });
});