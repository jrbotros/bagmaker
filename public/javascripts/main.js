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
});