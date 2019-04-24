//All code created by Blake Bowen
//Forked from: http://codepen.io/osublake/pen/RNLdpz/

// GRID OPTIONS
var rowSize   = 100;
var colSize   = 100;
var gutter    = 7;     // Spacing between tiles
var numTiles  = 16;    // Number of tiles to initially populate the grid with
var threshold = "50%"; // This is amount of overlap between tiles needed to detect a collision

var $list = $("#list");
var $wipe = $("#wipe");

// Live node list of tiles
var tiles  = $list[0].getElementsByClassName("tile");
var zIndex = 1000;

var colCount   = null;
var rowCount   = null;
var gutterStep = null;

var shadow1 = "0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)";
var shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";

var tilecolors = {
    0:'rgba(236, 240, 241,1.0)',
    1:'rgba(189, 195, 199,1.0)',
    2:'rgba(149, 165, 166,1.0)',
    3:'rgba(127, 140, 141,1.0)',
    4:'rgba(241, 196, 15,1.0)',
    5:'rgba(243, 156, 18,1.0)',
    6:'rgba(230, 126, 34,1.0)',
    7:'rgba(211, 84, 0,1.0)',
    8:'rgba(231, 76, 60,1.0)',
    9:'rgba(192, 57, 43,1.0)',
};

var bgColor = {
    0:'rgba(22, 160, 133,1.0)',
    1:'rgba(52, 73, 94,1.0)',
    2:'rgba(155, 89, 182,1.0)',
    3:'rgba(52, 152, 219,1.0)',
    4:'rgba(46, 204, 113,1.0)',
    5:'rgba(26, 188, 156,1.0)',
    6:'rgba(44, 62, 80,1.0)',
    7:'rgba(142, 68, 173,1.0)',
    8:'rgba(41, 128, 185,1.0)',
    9:'rgba(39, 174, 96,1.0)',
};
//$(window).resize(resize);

var SIZE = 4;
var board = new Array();
var score = 0;
var maxNum = 0;
var isShaking = false;

init();

// ========================================================================
//  INIT
// ========================================================================
function init() {
    //c logic
    for (var x=0;x<SIZE;x++) {
        board[x] = new Array();
		for (var y=0;y<SIZE;y++) {
			board[x][y]=0;
		}
	}
    addRandom(board);
	addRandom(board);
    score = 0;
    maxNum = 0;
    
  // to draw
  var width = colSize * 4 + gutter * 3;
  $(".tile").remove();

  TweenLite.from($list, 0.2, { width: 0 });
  TweenLite.delayedCall(0.3, populateBoard);

  function populateBoard() {
    //resize();
    for (var x=0;x<SIZE;x++) {
        for (var y=0;y<SIZE;y++) {
                id =  x*SIZE + y;
                var element = $("<div></div>").addClass("tile");
                element.attr('id', 'tile' + id);
                element.append($("<div></div>").attr('id', 'tilenum' + id));
                $list.append(element);
                TweenLite.from(element, 0.5, { opacity:0 });
        }
    }
    drawBoard(board);
  }

/*    function startShake() {
        if(isShaking) {
            for(var i=0; i<tiles.length; i++){
                TweenLite.fromTo(tiles[i], 0.3, {rotation:-2}, {rotation:2, ease:RoughEase.ease.config({strength:4, points:20, template:Linear.easeNone, randomize:true}) , clearProps:"x"})
            }
            TweenLite.delayedCall(0.3, startShake);            
        }
    }*/
  //register control: swipe
    Draggable.create($wipe,{
      zIndexBoost:false,
      type:"x, y",
      lockAxis : true ,
      onDrag:function() {
        //isShaking = true;
        //startShake();
      },
      onDragEnd:function(){
          //isShaking = false;
        TweenLite.to($wipe, 0.0, {
          x : 0,
          y : 0,
          zIndex: 1100,
        });
        var success = false;
        switch(this.getDirection("start")) {
            case 'up':
                success = moveLeft(board);
                break;
            case 'down':
                success = moveRight(board);
                break;
            case 'left':
                success = moveUp(board);
                break;
            case 'right':
                success = moveDown(board);
                break;
        }
        GenerateNum(success);
      },
    });
    //register control: keyboard
    $(document).keyup(function(event){
        var success = false;
        switch(event.which) {
        case 38: //up
            success = moveLeft(board);
            break;
        case 40: //down
            success = moveRight(board);
            break;
        case 37: //left
            success = moveUp(board);
            break;
        case 39: //right
            success = moveDown(board);
            break;
        }
        GenerateNum(success);
    });
}

function GenerateNum(success) {
    if (success) {
        drawBoard(board);
        addRandom(board);
        drawBoard(board);
        if (gameEnded(board)) {
            $('.cover').css('display', '');
            $('#maxnum').html('最大到：' + formatNum(maxNum));
            $('#score').html('得分：' + score);
        }
    }
}

function formatNum(n) {
    if(n==0) {
        return '';
    } else if(n<20) {
        return 1<<n;
    } else {
        return '2^' + n;
    }
}
function drawBoard(board) {
    var maxChanged = false;
    for (var x=0;x<SIZE;x++) {
        for (var y=0;y<SIZE;y++) {
            id = x*SIZE + y;
            $('#tilenum'+id).html(formatNum(board[x][y]));
            //TweenLite.to($('#tile'+id), 1.0, {'backgroundColor':tilecolors[board[x][y]%10]});
            $('#tile'+id).css('backgroundColor', tilecolors[board[x][y]%10]);
            $('#tile'+id).css('top', 3.2 + 24*x + '%');
            $('#tile'+id).css('left', 3.2 + 24*y + '%');
            resize_to_fit($('#tile'+id), $('#tilenum'+id));
            
            if(maxNum < board[x][y]) {
                maxNum = board[x][y];
                maxChanged = true;
            }
        }
    }
    
    if(maxChanged) {
        TweenLite.to($('body'), 3.0, {'backgroundColor':bgColor[maxNum%10]});
    }
    
    $('h1').html('分数：' + score);
    
    if(maxNum > 2 && maxNum < 11) {
        document.title = '2048有点难，我才打到' + formatNum(maxNum) + '！只得了' + score +'分！求高手帮我灭了它~~~';
    } else if (maxNum >= 11) {
        document.title = '2048是小菜，我打到了' + formatNum(maxNum) + '！拿下' + score +'分！独孤求败的感觉，真是太爽啦~~~';
    }
}

function resize_to_fit(){
    var fontsize = $('div#outer div').css('font-size');
    $('div#outer div').css('fontSize', parseFloat(fontsize) - 1);

    if($('div#outer div').height() >= $('div#outer').height()){
        resize_to_fit();
    }
}

function gameEnded(board) {
	var ended = true;
	if (countEmpty(board)>0) return false;
	if (findPairDown(board)) return false;
	rotateBoard(board);
	if (findPairDown(board)) ended = false;
	rotateBoard(board);
	rotateBoard(board);
	rotateBoard(board);
	return ended;
}

function findPairDown(board) {
	for (var x=0;x<SIZE;x++) {
		for (var y=0;y<SIZE-1;y++) {
			if (board[x][y]==board[x][y+1]) return true;
		}
	}
	return false;
}

function countEmpty(board) {
	var count=0;
	for (var x=0;x<SIZE;x++) {
		for (var y=0;y<SIZE;y++) {
			if (board[x][y]==0) {
				count++;
			}
		}
	}
	return count;
}

function rotateBoard(board) {
	var n=SIZE;
	for (var i=0; i<n/2; i++) {
		for (var j=i; j<n-i-1; j++) {
			var tmp = board[i][j];
			board[i][j] = board[j][n-i-1];
			board[j][n-i-1] = board[n-i-1][n-j-1];
			board[n-i-1][n-j-1] = board[n-j-1][i];
			board[n-j-1][i] = tmp;
		}
	}
}

function findTarget(array, x, stop) {
	// if the position is already on the first, don't evaluate
	if (x==0) {
		return x;
	}
	for(var t=x-1;t>=0;t--) {
		if (array[t]!=0) {
			if (array[t]!=array[x]) {
				// merge is not possible, take next position
				return t+1;
			}
			return t;
		} else {
			// we should not slide further, return this one
			if (t==stop) {
				return t;
			}
		}
	}
	// we did not find a
	return x;
}

function slideArray(array) {
	var success = false;
	var stop=0;

	for (var x=0;x<SIZE;x++) {
		if (array[x]!=0) {
			var t = findTarget(array,x,stop);
			// if target is not original position, then move or merge
			if (t!=x) {
				// if target is zero, this is a move
				if (array[t]==0) {
					array[t]=array[x];
				} else if (array[t]==array[x]) {
					// merge (increase power of two)
					array[t]++;
					// increase score
					score+=1<<array[t];
					// set stop to avoid double merge
					stop = t+1;
				}
				array[x]=0;
				success = true;
			}
		}
	}
	return success;
}

function moveUp(board) {
	var success = false;
	for (var x=0;x<SIZE;x++) {
		success |= slideArray(board[x]);
	}
	return success;
}

function moveLeft(board) {
	rotateBoard(board);
	var success = moveUp(board);
	rotateBoard(board);
	rotateBoard(board);
	rotateBoard(board);
	return success;
}

function moveDown(board) {
	rotateBoard(board);
	rotateBoard(board);
	var success = moveUp(board);
	rotateBoard(board);
	rotateBoard(board);
	return success;
}

function moveRight(board) {
	rotateBoard(board);
	rotateBoard(board);
	rotateBoard(board);
	var success = moveUp(board);
	rotateBoard(board);
	return success;
}

function addRandom(board) {
	var list = new Array();
	for (var x=0;x<SIZE*SIZE;x++) {
		list[x] = new Array();
	}
    
    var len = 0;
	for (var x=0;x<SIZE;x++) {
		for (var y=0;y<SIZE;y++) {
			if (board[x][y]==0) {
				list[len][0]=x;
				list[len][1]=y;
				len++;
			}
		}
	}

	if (len>0) {
		r = Math.floor(Math.random()*len);
		x = list[r][0];
		y = list[r][1];
		board[x][y]=(Math.floor(Math.random()/0.9))+1; // 10%概率产生4，90%概率产生2
        
        /*测试用
        for(var i=0; i<len; i++) {
            x = list[i][0];
            y = list[i][1];
            board[x][y]=20; // 10%概率产生4，90%概率产生2
        }*/
	}
}

function resize_to_fit(outer, inner) {
    while(inner.height() > outer.height()) {
        var fontsize = parseInt(inner.css('font-size')) - 1;
        inner.css('font-size', fontsize);
        // some browsers(chrome) the min font return value is 12px
        if(fontsize <= 1 || parseInt(inner.css('font-size')) >= fontsize+1)
            break;
    }
}

$(document).ready(function(){
    $('.cover').css('display', 'none');
    $('#restart').bind('click', function(){
        init();
        $('.cover').css('display', 'none');
    });

/*    var oReq = new XMLHttpRequest();
    oReq.onload = function() {
        var signature = JSON.parse(this.responseText);
        wx.config({
            debug: true,
            appId: signature['appid'],
            timestamp: signature['timestamp'],
            nonceStr: signature['noncestr'],
            signature: signature['signature'],
            jsApiList: [
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
            ]
        });
        wx.ready(function () {
            wx.onMenuShareTimeline({
                title: document.title, // 分享标题
                link: 'http://huhusleep.com/game/2048/', // 分享链接
                imgUrl: 'http://huhusleep.com/game/2048/img/2048.jpg', // 分享图标
                success: function () { 
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () { 
                    // 用户取消分享后执行的回调函数
                }
            });
        });
    };
    alert("0");
    oReq.open("get", "/we/jssig.php?url="+encodeURIComponent(location.href.split('#')[0]), true);
    oReq.send();*/
});
