var marker = function( x, y, number){
	this.x = x + 34
	this.y = y + 34
}

Studio.inherit( marker, Studio.Rect, {width: 40, height: 40})



var Game = new Studio.Scene({
	y: 0,
	x: 0,
	width: stage.width*1, 
	height: stage.height*1,

	onActivate : function(stage){
	},
	gravity: .5,
	build: function (scene){
		
		for(var i = 0; i!= 7; i++){
			for(var j = 0; j!= 7; j++){
				this.addChild( new marker(i*42, j*42) )
			}
		}


	}
});

stage.bitmap.style.imageRendering = 'pixelated';
stage.enableKeyboardInput();
stage.enableTouchEvents();
