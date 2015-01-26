//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-58975311-1', 'auto');

//rounding method
function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

// Sort Json
function sortByKey(array, key, direction) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if (direction === "asc"){
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        else if (direction === "desc"){
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
        else{
            return;
        }
    });
}

// Likes API
function userLikesToArray(){
    var userLikes = $.cookie("likes");
    return userLikes.split(',');
}

function addLike(toteId){
    var userLikes = userLikesToArray();

    if (hasLike(toteId)){
        return false;
    }
    else{
        userLikes.push(toteId);
        $.cookie("likes", userLikes);
    }
}

function removeLike(toteId){
    var userLikes = userLikesToArray();
    var toteIndex = userLikes.indexOf(toteId);

    if (hasLike(toteId)){
        userLikes.splice(toteIndex, 1);
        $.cookie("likes", userLikes);
    }
    else{
        return false;
    }
}
function hasLike(toteId){
    var userLikes = userLikesToArray();
    var toteIndex = userLikes.indexOf(toteId);
    return (toteIndex !== -1);
}

$(document).ready(function(){
    if ($.cookie("likes") === undefined){
        $.cookie("likes", "");
    }

    $(document).hammer().on("tap", ".logo", function(){
        window.location.href = "/";
    });

    ga('send', 'pageview');
});