var cssBezier = new Ease(BezierEasing(.7,0,.3,1));
var gridBagBezier = new Ease(BezierEasing(.42,0,.58,1));

//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-58975311-1', 'auto');

// Likes API
var likes = {
    userLikes : [],
    fetchUserLikes : function(){
        var userLikes = $.cookie("likes");
        likes.userLikes = userLikes.split(",");
    },
    likeBag : function(toteID){
        if (likes.indexOf(toteID) > -1){
            return false;
        }
        else{
            likes.userLikes.push(toteID);
            $.cookie("likes", likes.userLikes);

            browse.loadBags(function(){
                var tote = _.findWhere(browse.toteBags, {"_id" : toteID});
                tote.likes = parseInt(tote.likes) + 1;

                // sort of hacky, the only way i know how to update a tote. you aren't allowed
                // to update it with the sacred _id variable already assigned.
                var clone = _.extend({}, tote);
                // JSON STRING ISSUE
                clone.textfields = JSON.stringify(clone.textfields);
                delete clone._id;
                
                $.ajax({
                    type: 'PUT',
                    data: clone,
                    url: '/totes/updatetote/' + toteID
                }).done(function( response ) {
                    
                });

            });
        }
    },
    unlikeBag : function(toteID){
        var toteIndex = likes.indexOf(toteID);

        if (toteIndex > -1){
            likes.userLikes.splice(toteIndex, 1);
            $.cookie("likes", likes.userLikes);
        }
        else{
            return false;
        }
    },
    indexOf : function(toteID){
        return likes.userLikes.indexOf(toteID);
    },
    toggleLike : function(toteID){
        if (likes.indexOf(toteID) > -1){
            likes.unlikeBag(toteID);
        }
        else{
            likes.likeBag(toteID);
        }
    },
    favorite : function($heartWrap){
        //make circle immediately magenta and heart white.
        $heartWrap.css("background-color", "#D93182");
        $heartWrap.find(".heart .inner-heart").css("opacity", "0");
        $heartWrap.find(".heart .white").css("opacity", "1");
        $heartWrap.find(".heart").css("opacity", "1");

        // animate magenta circle/white heart to white circle / pink heart
        TweenLite.to($heartWrap, 0.3, {
            "backgroundColor" : "#fff",
            ease : cssBezier,
            delay : 0.1
        });
        TweenLite.to($heartWrap.find(".heart"), 0.15, {
            alpha : 0,
            scale : 1.1,
            ease : cssBezier,
            delay : 0.1,
            onComplete : function(){
                $heartWrap.find(".heart .inner-heart").css("opacity", "0");
                $heartWrap.find(".heart .magenta").css("opacity", "1");
                TweenLite.to($heartWrap.find(".heart"), 0.15, {
                    alpha : 1,
                    ease : cssBezier,
                    onComplete : function(){
                        $heartWrap.parents(".heart-outer-wrap").addClass("favorited");
                    }
                });
            }
        });
    },
    unfavorite : function($heartWrap){
        //make circle immediately magenta and heart white.
        $heartWrap.css("background-color", "#D93182");
        $heartWrap.find(".heart .inner-heart").css("opacity", "0");
        $heartWrap.find(".heart .white").css("opacity", "1");
        $heartWrap.find(".heart").css("opacity", "1");

        // animate magenta circle/white heart to white circle / grey heart
        TweenLite.to($heartWrap, 0.3, {
            "backgroundColor" : "#fff",
            ease : cssBezier,
            delay : 0.1
        });
        TweenLite.to($heartWrap.find(".heart"), 0.15, {
            alpha : 0,
            scale : 1.1,
            ease : cssBezier,
            delay : 0.1,
            onComplete : function(){
                $heartWrap.find(".heart .inner-heart").css("opacity", "0");
                $heartWrap.find(".heart .grey").css("opacity", "1");
                TweenLite.to($heartWrap.find(".heart"), 0.15, {
                    alpha : 1,
                    ease : cssBezier,
                    onComplete : function(){
                        $heartWrap.parents(".heart-outer-wrap").removeClass("favorited");
                    }
                });
            }
        });
    }
};

var site = {
    colors : ["black", "white", "red"],
    chars : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split(''),
    randomString : function(length){
        var string = '';
        for (var i = 0; i < length; i++){
            string += site.chars[ Math.floor(Math.random() * site.chars.length) ];
        }
        return string;
    },
    breakpts : {
        sml : 650,
        med : 960,
        lrg : 1440
    },
    transistionEnd : 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
    breakpt : function() {
        var ww = window.innerWidth;
        var breakptval = 'lrg';

        for( var key in site.breakpts){
            if( site.breakpts[key] >= ww ){
                breakptval = key;
                break;
            }
        }
        return breakptval;
    },
    refreshTypeOnTotes : function(){
        _.each($(".actual-tote"), function(tote){
            var width = $(tote).find(".bag-body").width();
            var fontSize = width / 2;
            $(tote).find(".bag-body").css("font-size", (fontSize + "px"));
            $(tote).find(".bag-bottom").css("font-size", (fontSize + "px"));

            if ( $(tote).find(".editable-field").length > 0 ){
                var fields = $(tote).find(".textfields-wrap .editable-field");
                for (var i = 0; i < fields.length; i++){
                    bagObject.updateTextAreaSize( $(fields[i]).find("textarea") );
                }
            }
            if ( $(tote).find(".text").length > 0 ){
                var texts = $(tote).find(".textfields-wrap .text");
                for (var j = 0; j < texts.length; j++){
                    var newX = Number($(texts[j]).attr("data-x")) * fontSize;
                    var newY = Number($(texts[j]).attr("data-y")) * fontSize;
                    TweenLite.to(texts[j], 0, { x : newX, y : newY });
                }
            }
        });
    },
    getTransformValue : function($el, orientation){
        var matrix = $el.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
        var x = matrix[12] || matrix[4];
        var y = matrix[13] || matrix[5];

        if (x === undefined){
            x = 0;
        }
        if (y === undefined){
            y = 0;
        }

        if (orientation === "x"){
            return x;
        }
        else if (orientation === "y"){
            return y;
        }
    },
    render : function(obj, tpl, target, onComplete) {
        $.get("/templates/_"+tpl+".html", function(html) {
            var template = Handlebars.compile(html);
            var rendered = template(obj);

            $(target).html(rendered);

            if(typeof onComplete !== 'undefined'){
                onComplete();
            }
        });
    },
    breakpts : {
        sml : 640,
        med : 940,
        lrg : 1280
    },
    breakpt : function() {
        var ww = window.innerWidth;
        var breakptval = 'lrg';

        for( var key in site.breakpts){
            if( site.breakpts[key] >= ww ){
                breakptval = key;
                break;
            }
        }
        return breakptval;
    }
};

var bagObject = {
    data : {
                textfields : [],
                size : "small",
                color : "black",
                likes : 0,
                editMode : false
            },
    
    htmlElement : null,
    parent : null,

    //refresh type based on bag size.
    refreshType : function(){
        var $theTote = this.htmlElement;
        var width = $theTote.find(".bag-body").width();
        var fontSize = width / 2;
        $theTote.find(".bag-body").css("font-size", (fontSize + "px"));
        $theTote.find(".bag-bottom").css("font-size", (fontSize + "px"));

        setTimeout(function(){
            site.refreshTypeOnTotes();
        }, 100);
    },

    //big to small, refresh type afterwards.
    toggleSize : function(size){
        var bag = this;

        if (size === "big" || (bag.data.size === "small" && typeof size === "undefined")) {
            bag.data.size = "big";
            bag.htmlElement.removeClass("small").addClass("big");
        }
        else if (size === "small" || (bag.data.size === "big" && typeof size === "undefined") ){
            bag.data.size = "small";
            bag.htmlElement.removeClass("big").addClass("small");
        }

        setTimeout( function(){
            bag.refreshType();
        }, 300 );
    },

    // change color
    changeColor : function(color){
        var bag = this;

        if (_.contains(site.colors, color)){
            $(bag.htmlElement).attr("class", "tote-wrap " + color + " " + bag.data.size);
            bag.data.color = color;
        }
    },

    updateTextAreaSize : function($textarea){
        var bag = this;

        var $field = $textarea.parents(".editable-field");
        var textFieldID = $field.attr("data-id");
        var $clone = $textarea.siblings(".clone-text");
        var content = $textarea.val();
    
        if (content === ""){
            content = "Type Something.";
        }
        //.replace(/\s{2}/g, ' &nbsp;')
        contentFormatted = content.replace(/\n/g, '<br/>');
        $clone.html(contentFormatted);

        if (bag.data && bag.data.textfields){
            var theTextField = _.findWhere(bag.data.textfields, { "_id" : textFieldID });
            theTextField.text = content;

            if ($textarea.val() === ""){
                $field.addClass("new");
            }
            else{
                $field.removeClass("new");
            }

            // dealing with x and y
            var parentFontSize = parseInt($field.parents(".bag-body").css("font-size"))
            var newX = theTextField.x * parentFontSize;
            var newY = theTextField.y * parentFontSize;
            TweenLite.to($field, 0, { x : newX, y : newY });
        }
        TweenLite.to($field, 0.1, { height : $clone.height() } );
    },

    draw : function($parent, onComplete){
        var bag = this;

        // if a $parent wasn't defined, and ones already assigned, use that one.
        if (typeof $parent === "undefined" && bag.parent !== null){
            $parent = $(bag.parent);
        }

        else if (bag.parent === null && typeof $parent === "undefined"){
            console.log("you done fucked up");
            return;
        }
        // if there is no parent assigned to the bag, the parameter is assigned.
        else if (bag.parent === null && typeof $parent !== "undefined"){
            bag.parent = $parent;
        }

        var viewObj = { bags : [bag.data]};

        site.render(viewObj, "bag", bag.parent, function(){
            bag.htmlElement = bag.parent.find(".tote-wrap");
            site.refreshTypeOnTotes();

            if (typeof onComplete !== "undefined"){
                onComplete();
            }
        });
    },
    // right now this is function is only intended for the create page.
    newTextField : function(){
        var emptyTextObj = {
            y : 0,
            x : 0,
            width : "100%",
            justify : "left",
            fontSize : 0.28,
            kerning : -0.03,
            leading : 1
        };
        var id = site.randomString(16);
        // if it finds something (not undefined), choose another id.
        while ( typeof _.findWhere(this.data.textfields, {"_id" : id }) !== "undefined" ){
            id = site.randomString(16);
        }
        emptyTextObj._id = id;

        this.data.textfields.push(emptyTextObj);

        if (this.data.textfields.length >= 4){
            $(".addTextfield").addClass("disabled");
        }
    },
    deleteTextField : function(id, callback){
        var bag = this;
        var $field = $(this.htmlElement).find(".editable-field[data-id=" + id + "]");
        TweenLite.to($field, 0.3, {
            scale : 1.15,
            alpha : 0,
            onComplete : function(){
                $field.remove();
                bag.data.textfields = _.reject(bag.data.textfields, function(tf){
                    return tf._id === id;
                });
                if (bag.data.textfields.length < 4){
                    $(".addTextfield").removeClass("disabled");
                }

                if (typeof callback !== "undefined"){
                    callback();
                }
            }
        });
    },
    saveAs : function(){
        var bagData = _.extend({}, this.data);
        bagData.textfields = JSON.stringify(bagData.textfields);
        bagData.editMode = null;
        bagData.timestamp = Math.round(new Date().getTime() / 1000);
        
        // use ajax to post tote to db
        $.ajax({
            type: 'POST',
            data: bagData,
            url: '/totes/createtote',
            dataType: 'JSON' 
        }).done(function( response ){
            // Check for successful (blank) response
            if (response.msg === '') {
                // what to do if we did it successfully
                window.location.href = "/";
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
};

function resizeHelper(){
    site.refreshTypeOnTotes();

    if (site.breakpt() !== "sml")
        TweenLite.to("nav", 0, { y : 0 });
    else
        scrollHelper();
}

function scrollHelper(){
    var scroll = $("body").scrollTop();

    if ($("nav").length > 0 && site.breakpt() === "sml"){
        var navIndent = 80
        if (scroll < $("nav .logo").height()){
            navIndent = scroll;
        }
        TweenLite.to("nav", 0, { y : -navIndent });
    }
}

$(document).ready(function(){
    if ($.cookie("likes") === undefined){
        $.cookie("likes", "");
    }

    $(document).hammer().on("tap", ".logo, button.close", function(){
        window.location.href = "/";
    });

    site.refreshTypeOnTotes();
    $(window).resize(function(){
        resizeHelper();
    });

    $(window).scroll(function(){
        scrollHelper();
    });

    ga('send', 'pageview');
});