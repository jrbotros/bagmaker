var browse = {
    toteBags : [],
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
    loadBags : function(){
        $.getJSON('/totes', function( data ){
            browse.toteBags = _.sortBy(data, function(tote){
                return tote.timestamp;
            });
            browse.toteBags = browse.toteBags.reverse();
            //totalPages = Math.ceil(toteBags.length / loadChunk);
            browse.buildBagGrid();
        });
    },
    buildBagGrid : function(){
        _.each(browse.toteBags, function(tote){
            if (typeof tote.textfields === "string")
                tote.textfields = JSON.parse(tote.textfields);
            var toteObj = {bags : [tote]};

            $.get("/templates/_bag.html", function(html) {
                var template = Handlebars.compile(html);
                var rendered = template(toteObj);
                var $tote = $("<div />", {
                    id : "tote-" + toteObj._id,
                    class : "tote-grid-element start",
                    html :  "<div class='heart-wrap'>" +
                                "<div class='heart-circle'></div>" +
                                "<div class='heart'>" + 
                                    "<div class='inner-heart grey'></div>" +
                                    "<div class='inner-heart white'></div>" +
                                "</div>" +
                            "</div>" + rendered
                }).appendTo(".browse-page.content .browse-tote-wrap");

                if (tote == browse.toteBags[browse.toteBags.length-1]){
                    site.refreshTypeOnTotes();
                    browse.animateIn();
                }
            });
        });        
    }
};

var gridElement = {
    data : null
}

$(document).ready(function(){
    browse.loadBags();

    $(document).hammer().on("tap", ".sort ul li", function(){
        var attr = $(this).attr("data-attr");
        var dir = $(this).attr("data-dir");
        browse.sort(attr, dir);
    });

    $(document).hammer().on("tap", ".heart-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        $(this).toggleClass("favorited");
    });
});