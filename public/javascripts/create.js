var totalBags;
var dataText = null;
var dataY = 0;
var dataSize = "small";
var dataColor = "black";
var dataJustify = "left";
var dataFontSize = 5;           //em
var dataKerning = -0.03;        //em
var dataLeading = 1;            //em

// show when a tool is selected  + focus it(textarea/image)
function selectTool($tool){
    deselectAll();
    $tool.addClass('active');
    if ($tool.hasClass("text-wrap")){
        $tool.find('textarea').attr("readonly", false);
        $tool.find('textarea').focus();
    }
}
// deselect a selected tool (textarea/image)
function deselectTool($tool){
    $tool.removeClass("active");
    if ($tool.hasClass("text-wrap")){
        $tool.find('textarea').attr("readonly", true);
    }
}
//deselect all tools
function deselectAll(){
    $(".tool").each(function(){
        deselectTool($(this));
    });
}
//manage textarea sizing based on clone
function updateTextAreaSize(){
    var content = $(".text-wrap textarea").val();
    
    // Size to be saved.
    dataText = content;

    if (content === ""){
        content = "Type Something.";
        dataText = null; // don't count it if its empty
    }
    //content = content.replace(/\n/g, '<br>');
    $(".clone-text").html(content);

    TweenLite.to(".text-wrap", 0.1, { height : $(".clone-text").height() + 10 } );

    var amountMoved = Number($(".text-wrap").attr("data-y"));
    if ((amountMoved + $(".text-wrap").height()) > ($(".tote-wrap").height() * 0.4)){
        console.log('it happened');
    }
}

// loads all the bags into array
function loadBags(){
    $.getJSON('/totes', function( data ){
        totalBags = data.length;
    });
}

// ADD TOTE BAG TO DATABASE
function saveTote(){
    var newTote = {
        'text' : dataText,
        'yAxis' : dataY,
        'size' : dataSize,
        'color' : dataColor,
        'justification' : dataJustify,
        'fontSize' : dataFontSize,
        'kerning' : dataKerning,
        'leading' : dataLeading,
        'likes' : 0,
        'timestamp' : Math.round(new Date().getTime() / 1000),
        'bagNum' : totalBags+1
    };

    // use ajax to post tote to db
    $.ajax({
        type: 'POST',
        data: newTote,
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

$(document).ready(function(){
    updateTextAreaSize();
    loadBags();

    // scroll down
    var scrollAmt = $(document).height() - $(window).height();
    $(window).scrollTop(scrollAmt);

    // list of elements to ignore
    $(document).hammer().on("tap", ".tool, .bag-size-wrap .icon", function(e){
        e.stopPropagation();
    });

    // update textarea size on key entry
    $(document).on("keyup", ".text-wrap textarea", function(){
        updateTextAreaSize();
    });

    //selects tool on tap, deselects on tap out.
    $(document).hammer().on("tap", ".tool", function(){
        selectTool($(this));
    });
    $(document).hammer().on("tap", ".content", function(){
        deselectAll();
    });

    //manages dragging only the text-wrap tool, for Y axis only.
    $(document).hammer().on("drag", ".text-wrap", function(e){
        if ( $(e.target).parents(".text-controls").length === 1 ){
            return;
        }

        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var amountMoved = Number($(this).attr("data-y"));

            // if user is trying to drag above tote, cap at top of tote
            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0){
                dragAmt = 0;
            }
            else if ((dragAmt + $(".text-wrap").height()) > ($(".tote-wrap").height() * 0.4)){
                dragAmt = ($(".tote-wrap").height() * 0.4) - $(".text-wrap").height();
            }

            TweenLite.to(this, 0, { y : dragAmt + "px" });
        }
        
    });
    $(document).hammer().on("dragend", ".text-wrap", function(e){
        if ( $(e.target).parents(".text-controls").length === 1 ){
            return;
        }

        if (e.gesture.direction === "up" || e.gesture.direction === "down"){
            var dragDist = e.gesture.deltaY;
            var amountMoved = Number($(this).attr("data-y"));

            var dragAmt = dragDist + amountMoved;
            if (dragAmt < 0){
                dragAmt = 0;
            }
            else if ((dragAmt + $(".text-wrap").height()) > ($(".tote-wrap").height() * 0.4)){
                dragAmt = ($(".tote-wrap").height() * 0.4) - $(".text-wrap").height();
            }

            $(this).attr("data-y", "" + dragAmt);
            
            // Y to be saved.
            dataY = round(dragAmt, 4);
        }
    });

    // manages color of bag
    $(document).hammer().on("tap", ".color-wrap", function(){
        var selectedColor = $(this).attr("data-color");

        if ($(".color-wrap.checked").attr("data-color") !== selectedColor){
            $(".color-wrap.checked").removeClass("checked");
            $(this).addClass("checked");

            var currColor = $(".tote-wrap").attr("data-color");
            $(".tote-wrap").removeClass(currColor);
            $(".tote-wrap").addClass(selectedColor);
            $(".tote-wrap").attr("data-color", selectedColor);

            // color to be saved.
            dataColor = $(".tote-wrap").attr("data-color");
        }
    });

    // manages type control sliders
    $(document).on("input", ".type-control input", function(){
        if ($(this).parent().hasClass("size")){
            var newSize = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("font-size", newSize);

            //font size to be saved
            dataFontSize = $(this).val();
        }
        else if ($(this).parent().hasClass("kerning")){
            var newKerning = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("letter-spacing", newKerning);

            //kerning to be saved
            dataKerning = $(this).val();
        }
        else if ($(this).parent().hasClass("leading")){
            var newLeading = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("line-height", newLeading);

            //leading to be saved
            dataLeading = $(this).val();
        }
        updateTextAreaSize();
    });
    // this function is only duplicated because earlier browsers
    // don't support the "input" event but support "change".
    $(document).on("change", ".type-control input", function(){
        if ($(this).parent().hasClass("size")){
            var newSize = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("font-size", newSize);

            //font size to be saved
            dataFontSize = $(this).val();
        }
        else if ($(this).parent().hasClass("kerning")){
            var newKerning = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("letter-spacing", newKerning);

            //kerning to be saved
            dataKerning = $(this).val();
        }
        else if ($(this).parent().hasClass("leading")){
            var newLeading = $(this).val() + "em";
            $(".text-wrap, .clone-text").css("line-height", newLeading);

            //leading to be saved
            dataLeading = $(this).val();
        }
        updateTextAreaSize();
    });

    // manages type control's justification
    $(document).hammer().on("tap", ".justification *", function(){
        if ($(this).hasClass("sel")){
            return;
        }
        $(".justification .sel").removeClass("sel");
        $(this).addClass("sel");
        
        var toBeJust = $(this).attr("data-just");
        $(".text-wrap textarea, .clone-text").css("text-align", toBeJust);

        // Justification to be saved
        dataJustify = toBeJust;

        updateTextAreaSize();
    });

    // manages bag size control.
    $(document).hammer().on("tap", ".bag-size-wrap .icon", function(){
        if ($(this).hasClass("sel")){
            return;
        }

        $(".bag-size-wrap .icon.sel").removeClass("sel");
        $(this).addClass("sel");

        if ($(this).attr("data-size") === "big"){
            $(".tote-wrap").removeClass("small").addClass("big");
        }
        else{
            $(".tote-wrap").removeClass("big").addClass("small");    
        }

        // Size to be saved.
        dataSize = $(this).attr("data-size");
        
        updateTextAreaSize();
    });

    $(document).hammer().on("tap", "nav .right-actions .save", function(){
        saveTote();
    });
});