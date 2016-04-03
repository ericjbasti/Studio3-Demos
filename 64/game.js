var Game = new Studio.Scene({
	y: 0,
	x: 0,
	width: stage.width*1, 
	height: stage.height*1,
	colorHex: Studio.BLUE,
	onActivate : function(stage){
	},
	build: function (scene){
		this.color.style='rgba(255,255,255,.15)';
		var flag_sprite = new Studio.SpriteAnimation({
			width: 64,
			height: 64,
			x: 32,
			y: 32,
			sheet : flag,
			rect :{x:0,y:0, width: 64, height: 64},
			loop : flagmation.still,
			fps: 33
		});
		this.addChild(flag_sprite);
		flag_sprite.onEnterFrame = function(){
			this.x+=.05
		}
	}
});

