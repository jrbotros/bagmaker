var browse={toteBags:null,sort:function(e){var t=e.attr("data-attr"),o=e.attr("data-dir");browse.toteBags=_.sortBy(browse.toteBags,t),"desc"===o&&(browse.toteBags=browse.toteBags.reverse()),browse.animateOut(function(){$(".browse-tote-wrap").empty(),browse.buildBagGrid()}),$("nav .sort .name").html(e.html())},gridOrderHelper:function(e){var t=$(".tote-grid-element").width(),o=Math.round($(window).width()/t),n=e%(2*o);return o>n?e:e+(o-1-2*(n-o))},animateIn:function(e,t){e=e||0,browse.animateInHelper(e,t)},animateInHelper:function(e,t){var o=$(".tote-grid-element").length;return e>=o?void setTimeout(function(){t&&void 0!==t&&t()},20*e):void setTimeout(function(){var o=browse.gridOrderHelper(e);0===$(".tote-grid-element").eq(o).length&&(o=e),$(".tote-grid-element").eq(o).removeClass("start"),browse.animateInHelper(e+1,t)},20*e)},animateOut:function(e){var t=$(".tote-grid-element").length;browse.animateOutHelper(t-1,e)},animateOutHelper:function(e,t){var o=$(".tote-grid-element").length;return 0>e?void setTimeout(function(){t&&void 0!==t&&t()},20*o):void setTimeout(function(){var o=browse.gridOrderHelper(e);$(".tote-grid-element").eq(o).addClass("start"),browse.animateOutHelper(e-1,t)},10*(o-e))},loadBags:function(e){null===browse.toteBags?$.getJSON("/totes",function(t){browse.toteBags=_.sortBy(t,function(e){return e.timestamp}),browse.toteBags=browse.toteBags.reverse(),"undefined"!=typeof e&&e()}):"undefined"!=typeof e&&e()},buildBagGrid:function(){_.each(browse.toteBags,function(e){"string"==typeof e.textfields&&(e.textfields=JSON.parse(e.textfields)),e.swingTimer=null;var t={bags:[e]};$.get("/templates/_bag.html",function(o){var n=Handlebars.compile(o),i=n(t),r="<div class='heart-wrap'>",s=t.bags[0]._id;likes.indexOf(s)>-1&&(r="<div class='heart-wrap favorited'>"),r+="<div class='heart-circle'></div><div class='heart'><div class='inner-heart grey'></div><div class='inner-heart magenta'></div><div class='inner-heart white'></div></div></div>",$("<div />",{"class":"tote-grid-element start "+t.bags[0].color,html:r+i}).appendTo(".browse-page.content .browse-tote-wrap"),e==browse.toteBags[browse.toteBags.length-1]&&($(".browse-page.content .browse-tote-wrap .clearfix").remove(),$(".browse-page.content .browse-tote-wrap").append("<div class='clearfix'></div>"),site.refreshTypeOnTotes(),browse.animateIn())})})},swingOnce:function(e){var t=$(".tote-grid-element").eq(e),o=t.find(".actual-tote"),n=t.find(".tote-shadow");TweenLite.to(n,.5,{rotation:"-4deg",scaleX:.9,ease:gridBagBezier}),TweenLite.to(o,.5,{rotation:"5deg",ease:gridBagBezier,onComplete:function(){TweenLite.to(n,.5,{rotation:"0deg",scaleX:1,ease:gridBagBezier,onComplete:function(){TweenLite.to(n,.5,{rotation:"4deg",scaleX:.9,ease:gridBagBezier})}}),TweenLite.to(o,1,{rotation:"-5deg",ease:gridBagBezier,onComplete:function(){TweenLite.to(n,.5,{rotation:"0deg",scaleX:1,ease:gridBagBezier}),TweenLite.to(o,.5,{rotation:"0deg",ease:gridBagBezier})}})}})},swing:function(e){$(".tote-grid-element").eq(e).hasClass("swinging")?clearTimeout(browse.toteBags[e].stopTimer):(browse.swingOnce(e),$(".tote-grid-element").eq(e).addClass("swinging"),browse.toteBags[e].swingTimer=setInterval(function(){browse.swingOnce(e)},1900))},stopSwing:function(e){browse.toteBags[e].stopTimer=setTimeout(function(){$(".tote-grid-element").eq(e).removeClass("swinging"),clearInterval(browse.toteBags[e].swingTimer)},500)}},gridElement={data:null};$(document).ready(function(){likes.fetchUserLikes(),browse.loadBags(browse.buildBagGrid),$(".sort ul li").hammer().on("tap",function(){browse.sort($(this))}),$(document).hammer().on("tap",".heart-wrap",function(e){e.preventDefault(),e.stopPropagation();var t=$(this).parents(".tote-grid-element"),o=browse.toteBags[t.index()],n=o._id;console.log(n,$(this)),likes.toggleLike(n),$(this).toggleClass("favorited")}),$(document).on("mouseenter",".tote-grid-element",function(){var e=$(this).index();browse.swing(e)}),$(document).on("mouseleave",".tote-grid-element",function(){var e=$(this).index();browse.stopSwing(e)}),$(".tote-grid-element").hover(function(){var e=$(this).index();browse.swing(e)},function(){var e=$(this).index();browse.stopSwing(e)})});