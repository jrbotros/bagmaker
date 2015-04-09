var newBag;

// currently, this function assumes that there is only one bag size toggle tool.
// This seems like a pretty fair assumption to make...
function toggleBagSizeUI( direction ){
    // size of the wrap - size of selector = moveable space.
    var threshold = $(".bag-size-wrap").outerWidth() - $(".bag-size-wrap .selector").outerWidth();

    var $par = $(".bag-size-wrap");
    if ( (typeof direction === "undefined" && $par.hasClass("small")) || direction === "big" ){
        $par.removeClass("small");
        $par.addClass("big");

        TweenLite.to(".bag-size-wrap .selector", 0.3, { x : threshold, ease : cssBezier });
        newBag.toggleSize("big");
    }
    else if ( (typeof direction === "undefined" && $par.hasClass("big")) || direction === "small" ){
        $par.removeClass("big");
        $par.addClass("small");

        TweenLite.to(".bag-size-wrap .selector", 0.3, { x : 0, ease : cssBezier });
        newBag.toggleSize("small");
    }
}

$(document).ready(function(){
    newBag = _.extend({}, bagObject);
    newBag.data.editMode = true;
    newBag.newTextField();

    newBag.draw($(".content.create-page .bag-wrap"), function(){
        $(".editable-field").eq(0).addClass("selected");
        $(".editable-field").eq(0).find("textarea").focus();

        // scroll down
        setTimeout(function(){
            var scrollAmt = $(document).height() - $(window).height();
            $("body").animate({scrollTop : scrollAmt}, "slow");
        }, 100);
    });

    // bag size toggling
    $(document).hammer().on("tap", ".bag-size-wrap > *", function(e){
        e.preventDefault();
        e.stopPropagation();

        toggleBagSizeUI();
    });
    // drag controls for the slider
    $(document).hammer().on("drag", ".bag-size-wrap .selector", function(e){
        e.preventDefault();
        e.stopPropagation();

        // big can only move left. small can only move right
        var isBig = $(this).parents(".bag-size-wrap").hasClass("big");

        if (e.gesture.direction === "left" && isBig){
            // x would default be at all the way to the right... for now, its 50px supposedly at start of every drag
            var dragDist = e.gesture.deltaX;

            // size of the wrap - size of selector = moveable space.
            var threshold = $(".bag-size-wrap").outerWidth() - $(".bag-size-wrap .selector").outerWidth();
            var dragAmt = threshold + dragDist;

            // lowest limit
            if (dragAmt < 0){
                dragAmt = 0;
            }

            TweenLite.to($(this), 0, { x : dragAmt + "px" });
        }
        else if (e.gesture.direction === "right" && !isBig){
            // x would default be at 0 supposedly at start of every drag
            var dragDist = e.gesture.deltaX;

            // highest limit
            var threshold = $(this).parents(".bag-size-wrap").outerWidth() - $(this).outerWidth();
            if (dragDist > threshold){
                dragDist = threshold;
            }

            TweenLite.to($(this), 0, { x : dragDist + "px" });
        }
    });
    // dragend - snapping to one side - controls for the slider
    $(document).hammer().on("dragend", ".bag-size-wrap .selector", function(e){
        e.preventDefault();
        e.stopPropagation();

        var isBig = $(this).parents(".bag-size-wrap").hasClass("big");

        if (e.gesture.direction === "left" && isBig){
            toggleBagSizeUI("small");
        }
        else if (e.gesture.direction === "right" && !isBig){
            toggleBagSizeUI("big");
        }
    });

    // expand and collapse color drawer
    $(document).hammer().on("tap", ".color-control-wrap .color-control", function(e){
        e.preventDefault();
        e.stopPropagation();

        $(this).parents(".color-control-wrap").toggleClass("expand");
    });

    // selecting a color
    $(document).hammer().on("tap", ".color-control-wrap .colors .color-wrap", function(e){
        e.preventDefault();
        e.stopPropagation();

        var color = $(this).parents(".color").attr("rel");
        newBag.changeColor(color);
        $(this).parents(".color-control-wrap").removeClass("expand");
    });

    //add a text field button
    $(document).hammer().on("tap", ".addTextfield:not(.disabled)", function(e){
        e.preventDefault();
        e.stopPropagation();

        if ($(".editable-field.new").length > 0){
            $(".editable-field").removeClass("selected");
            setTimeout( function(){
                $(".editable-field.new").eq(0).addClass("selected");
            }, 100);
        }
        else{
            newBag.newTextField();
            newBag.draw();
        }
    });

    // delete a text field
    $(document).hammer().on("tap", ".editable-field .corner.tr", function(e){
        e.preventDefault();
        e.stopPropagation();

        var id = $(this).parents(".editable-field").attr("id");
        newBag.deleteTextField(id);
    });

    // update the size of the text field in the UI as you type
    $(document).on("keyup", ".editable-field textarea", function(){
        newBag.updateTextAreaSize($(this));
    });

    // select a text field
    $(document).hammer().on("tap", ".editable-field", function(e){
        e.preventDefault();
        e.stopPropagation();

        $(".editable-field").removeClass("selected");
        $(this).addClass("selected");
    });

    // when to deselect a text field
    $(document).hammer().on("tap", ":not(.editable-field, .editable-field *)", function(e){
        e.preventDefault();
        e.stopPropagation();

        $(".editable-field.selected").removeClass("selected");
    });

    // using the justification controls.
    $(document).hammer().on("tap", ".text-controls .justification > *", function(e){
        e.preventDefault();
        e.stopPropagation();
        
        var $field = $(this).parents(".editable-field");
        var tfData = _.findWhere(newBag.data.textfields, { "domid" : $field.attr("id") });
        
        $(this).siblings(".sel").removeClass("sel");

        // set the alignment shiz        
        var alignment = $(this).attr("class").split("-")[1];
        tfData.justify = alignment;
        $(this).parents(".editable-field").css("text-align", alignment);

        // make it selected
        $(this).addClass("sel");
    });

    // Strikethroughs.
    $(document).hammer().on("tap", ".text-controls .strikethrough", function(e){
        e.preventDefault();
        e.stopPropagation();
        
        var $field = $(this).parents(".editable-field");
        var tfData = _.findWhere(newBag.data.textfields, { "domid" : $field.attr("id") });
        
        // make it strikethrough
        if (!$(this).hasClass("sel")){
            $(this).addClass("sel");
            $field.addClass("strikethrough");
            tfData.strikethrough = "strikethrough";
        }
        // make it normal
        else{
            $(this).removeClass("sel");
            $field.removeClass("strikethrough");
            delete tfData.strikethrough;
        }
    });

    // manages type control sliders
    $(document).on("input", ".type-control input", function(e){
        e.preventDefault();
        e.stopPropagation();

        typeSliderHandler($(this));
    });

    function typeSliderHandler($input){
        var $field = $input.parents(".editable-field");
        var tfData = _.findWhere(newBag.data.textfields, { "domid" : $field.attr("id") });
        
        if ($input.parent().hasClass("size")){
            var newSize = $input.val();
            $field.css("font-size", newSize + "em");

            //font size to be saved
            tfData.fontSize = Number(newSize);
        }
        else if ($input.parent().hasClass("kerning")){
            var newKerning = $input.val();
            $field.css("letter-spacing", newKerning + "em");

            //kerning to be saved
            tfData.kerning = Number(newKerning);
        }
        else if ($input.parent().hasClass("leading")){
            var newLeading = $input.val();
            $field.css("line-height", newLeading + "em");

            //leading to be saved
            tfData.leading = Number(newLeading);
        }
        newBag.updateTextAreaSize( $field.find("textarea") );
    }

    // //manages dragging only the text-wrap tool, for Y axis only.
    $(document).hammer().on("drag", ".editable-field, editable-field .corner", function(e){
        if ( $(e.target).parents(".text-controls").length === 1) {
            return;
        }

        var $field = $(this);
        if ($(this).hasClass("corner"))
            $field = $(this).parents(".editable-field");
        
        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var index = $field.attr("id");
            var parentFontSize = parseInt($field.parents(".bag-body").css("font-size"));

            var tf = _.findWhere(newBag.data.textfields, { "domid" : index });
            
            // read it in pixels
            var amountMoved = tf.y * parentFontSize;

            // if user is trying to drag above tote, cap at top of tote
            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0){
                dragAmt = 0;
            }
            else if ((dragAmt + $field.height() > $field.parents(".textfields-wrap").height()) ){
                dragAmt = $field.parents(".textfields-wrap").height() - $field.height();
            }
            TweenLite.to($field, 0, { y : dragAmt + "px" });
        }
        
    });
    $(document).hammer().on("dragend", ".editable-field, editable-field .corner", function(e){
        if ( $(e.target).parents(".text-controls").length === 1) {
            return;
        }

        var $field = $(this);
        if ($(this).parents(".editable-field").length !== 0)
            $field = $(this).parents(".editable-field");

        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var index = $field.attr("id");
            var parentFontSize = parseInt($field.parents(".bag-body").css("font-size"));

            var tf = _.findWhere(newBag.data.textfields, { "domid" : index });
            
            // read it in pixels
            var amountMoved = tf.y * parentFontSize;

            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0) {
                dragAmt = 0;
            }
            else if ((dragAmt + $field.height() > $field.parents(".textfields-wrap").height()) ){
                dragAmt = $field.parents(".textfields-wrap").height() - $field.height();
            }

            // save it in ems
            tf.y = dragAmt / parentFontSize;
        }
    });

    $(document).hammer().on("tap", "button.save", function(){
        newBag.saveAs();
    });
});