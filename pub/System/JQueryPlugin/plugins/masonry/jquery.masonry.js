;(function($){$.fn.masonry=function(options,callback){function placeBrick($brick,setCount,setY,setSpan,props){var shortCol=0;for(i=0;i<setCount;i++){if(setY[i]<setY[shortCol])shortCol=i;}
$brick.css({top:setY[shortCol],left:props.colW*shortCol+props.posLeft});for(i=0;i<setSpan;i++){props.colY[shortCol+i]=setY[shortCol]+$brick.outerHeight(true);}}
function masonrySetup($wall,opts,props){if(props.masoned&&opts.appendedContent!=undefined){props.$bricks=opts.appendedContent.find(opts.itemSelector);}else{props.$bricks=opts.itemSelector==undefined?$wall.children():$wall.find(opts.itemSelector);}
props.colW=opts.columnWidth==undefined?props.$bricks.outerWidth(true):opts.columnWidth;props.colCount=Math.floor($wall.width()/props.colW);props.colCount=Math.max(props.colCount,1);}
function masonryArrange($wall,opts,props){if(!props.masoned)$wall.css('position','relative');if(!props.masoned||opts.appendedContent!=undefined){props.$bricks.css('position','absolute');}
var cursor=$('<div />');$wall.prepend(cursor);props.posTop=Math.round(cursor.position().top);props.posLeft=Math.round(cursor.position().left);cursor.remove();if(props.masoned&&opts.appendedContent!=undefined){props.colY=$wall.data('masonry').colY;for(var i=$wall.data('masonry').colCount;i<props.colCount;i++){props.colY[i]=props.posTop;};}else{props.colY=[];for(i=0;i<props.colCount;i++){props.colY[i]=props.posTop;}}
if(opts.singleMode){props.$bricks.each(function(){var $brick=$(this);placeBrick($brick,props.colCount,props.colY,1,props);});}else{props.$bricks.each(function(){var $brick=$(this);var colSpan=Math.ceil($brick.outerWidth(true)/props.colW);colSpan=Math.min(colSpan,props.colCount);if(colSpan==1){placeBrick($brick,props.colCount,props.colY,1,props);}else{var groupCount=props.colCount+1-colSpan;var groupY=[0];for(i=0;i<groupCount;i++){groupY[i]=0;for(j=0;j<colSpan;j++){groupY[i]=Math.max(groupY[i],props.colY[i+j]);}}
placeBrick($brick,groupCount,groupY,colSpan,props);}});}
props.wallH=0;for(i=0;i<props.colCount;i++){props.wallH=Math.max(props.wallH,props.colY[i]);}
$wall.height(props.wallH-props.posTop);callback.call(props.$bricks);$wall.data('masonry',props);}
function masonryResize($wall,opts,props){var prevColCount=$wall.data('masonry').colCount;masonrySetup($wall,opts,props);if(props.colCount!=prevColCount)masonryArrange($wall,opts,props);}
return this.each(function(){var $wall=$(this);var props=$.extend({},$.masonry);props.masoned=$wall.data('masonry')!=undefined;var previousOptions=props.masoned?$wall.data('masonry').options:{};var opts=$.extend({},props.defaults,previousOptions,options);props.options=opts.saveOptions?opts:previousOptions;callback=callback||function(){};if($wall.children().length>0){masonrySetup($wall,opts,props);masonryArrange($wall,opts,props);var resizeOn=previousOptions.resizeable;if(!resizeOn&&opts.resizeable){$(window).bind('resize.masonry',function(){masonryResize($wall,opts,props);});}
if(resizeOn&&!opts.resizeable)$(window).unbind('resize.masonry');}});};$.masonry={defaults:{singleMode:false,columnWidth:undefined,itemSelector:undefined,appendedContent:undefined,saveOptions:true,resizeable:true},colW:undefined,colCount:undefined,colY:undefined,wallH:undefined,masoned:undefined,posTop:0,posLeft:0,options:undefined,$bricks:undefined};})(jQuery);