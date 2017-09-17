var marker = function( x, y, number){
	this.x = x + 34
	this.y = y + 34
	this.color = new Studio.Color(255,255,255,.5)
	this.hoverIn_tween = stage.createTween(this, 'quadInOut', {scaleX: 1.2, scaleY: 1.2, rotation: 45}, 300).loop(true).reflect(true);
	this.hoverOut_tween = stage.createTween(this, 'quadOut', {scaleX: 1, scaleY: 1, rotation: 0}, 300);
	this.tap_tween = stage.createTween(this, 'quadOut', {scaleX:.9, scaleY:.9, rotation: 0 }, 100, function(){
		this.color.setFromHex('#135')
	})
}

Studio.inherit( marker, Studio.Rect, {width: 40, height: 40})

marker.prototype.onHoverStart = function(){
	stage.stopTween(this.hoverOut_tween)
	stage.playTween(this.hoverIn_tween)
	this.color.r = 0
}

marker.prototype.onHoverEnd = function(){
	stage.stopTween(this.hoverIn_tween)
	stage.playTween(this.hoverOut_tween)
	this.color.r = 1
}

marker.prototype.onTap = function(){
	stage.stopTween(this.hoverIn_tween)
	stage.playTween(this.tap_tween)
}

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
				var mark = new marker(i*42, j*42)
				this.addChild( mark )
				this.addButton( mark )
			}
		}


	}
});

stage.bitmap.style.imageRendering = 'pixelated';
stage.enableKeyboardInput();
stage.enableTouchEvents();
