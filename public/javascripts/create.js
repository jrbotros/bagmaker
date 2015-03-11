var newBag;

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
    $(document).hammer().on("tap", ".bag-size-wrap .icon", function(e){
        e.preventDefault();
        e.stopPropagation();

        if ($(this).hasClass("small-bag")){
            newBag.toggleSize("small");
        }
        else {
            newBag.toggleSize("big");
        }
     
        $(this).siblings(".sel").removeClass("sel");
        $(this).addClass("sel");
    });

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

    $(document).hammer().on("tap", ".editable-field .corner.tr", function(e){
        e.preventDefault();
        e.stopPropagation();

        var id = $(this).parents(".editable-field").attr("data-id");
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
        var tfData = _.findWhere(newBag.data.textfields, { "_id" : $field.attr("data-id") });
        
        $(this).siblings(".sel").removeClass("sel");

        // set the alignment shiz        
        var alignment = $(this).attr("class").split("-")[1];
        tfData.justify = alignment;
        $(this).parents(".editable-field").css("text-align", alignment);

        // make it selected
        $(this).addClass("sel");
    });

    // manages type control sliders
    $(document).on("input", ".type-control input", function(){
        typeSliderHandler($(this));
    });
    $(document).on("change", ".type-control input", function(){
        typeSliderHandler($(this));
    });

    function typeSliderHandler($input){
        var $field = $input.parents(".editable-field");
        var tfData = _.findWhere(newBag.data.textfields, { "_id" : $field.attr("data-id") });
        
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
    $(document).hammer().on("drag", ".editable-field", function(e){
        if ( $(e.target).parents(".text-controls").length === 1) {
            return;
        }
        
        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var index = $(this).attr("data-id");
            var parentFontSize = parseInt($(this).parents(".bag-body").css("font-size"));

            var tf = _.findWhere(newBag.data.textfields, { "_id" : index });
            
            // read it in pixels
            var amountMoved = tf.y * parentFontSize;

            // if user is trying to drag above tote, cap at top of tote
            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0){
                dragAmt = 0;
            }
            else if ((dragAmt + $(this).height() > $(this).parents(".textfields-wrap").height()) ){
                dragAmt = $(this).parents(".textfields-wrap").height() - $(this).height();
            }
            TweenLite.to($(this), 0, { y : dragAmt + "px" });
        }
        
    });
    $(document).hammer().on("dragend", ".editable-field", function(e){
        if ( $(e.target).parents(".text-controls").length === 1) {
            return;
        }

        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var index = $(this).attr("data-id");
            var parentFontSize = parseInt($(this).parents(".bag-body").css("font-size"));

            var tf = _.findWhere(newBag.data.textfields, { "_id" : index });
            
            // read it in pixels
            var amountMoved = tf.y * parentFontSize;

            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0) {
                dragAmt = 0;
            }
            else if ((dragAmt + $(this).height() > $(this).parents(".textfields-wrap").height()) ){
                dragAmt = $(this).parents(".textfields-wrap").height() - $(this).height();
            }

            // save it in ems
            tf.y = dragAmt / parentFontSize;
        }
    });

    $(document).hammer().on("tap", "nav .right-actions .save", function(){
        newBag.saveAs();
    });
});