var cloud = function(x,y,speed){
	this.x = x;
	this.y = y;
	this.velocity = speed;
}

cloud.prototype = new Studio.SpriteAnimation({
	borderlap : 1,
	border: stage,
	width: 16,
	height: 8,
	x: 32,
	y: 16,
	sheet : sheet_64,
	rect :{x:0,y:0, width: 16, height: 8},
	loop : sheet_motion.cloud,
	fps: 44
});

cloud.prototype.onEnterFrame = function(){
	this.x-=this.velocity;
	if(this.x<0){
		this.x=stage.width;
	}
}

splosion = function(x){
	this.x=x;	
}
splosion.prototype = new Studio.SpriteAnimation({
	width: 16,
	height: 8,
	x: 0,
	y: 60,
	sheet : sheet_64,
	rect :{x:0,y:0, width: 16, height: 8},
	loop : sheet_motion.splode,
	fps: 12
});
splosion.prototype.constructor = splosion;
splosion.prototype.onLoopComplete= function(){
	this.frame = 0;
	Game.removeChild(this);
	this.intoPool();
}
Studio.createPool(splosion);

var Game = new Studio.Scene({
	y: 0,
	x: 0,
	width: stage.width*1, 
	height: stage.height*1,
	color: Studio.BLUE,
	colorHex: Studio.BLUE,
	onActivate : function(stage){
	},
	gravity: .5,
	build: function (scene){
		this.color.style='rgba(225,225,225,.4)';
		var astroid = function(vx,vy){
			this.velocityX = vx;
			this.velocityY = vy;
		};


		astroid.prototype = new Studio.SpriteAnimation({
			borderlap : 1,
			border: stage,
			width: 4,
			height: 4,
			x: 32,
			y: -2,
			sheet : sheet_64,
			rect :{x:0,y:0, width: 4, height: 4},
			loop : sheet_motion.ball,
			fps: 12,
			velocityX: 1,
			velocityY: 1
		});
		astroid.prototype.onEnterFrame = function(){
			this.x+=this.velocityX;
			this.y+=this.velocityY;
			if(this.x>stage.width){
				this.x=0;
			}
			if(this.x<0){
				this.x=stage.width;
			}
			if(this.y>stage.height){
				Game.addChild(splosion.fromPool({x:this.x}))
				this.y=0;
				this.velocityX= 1.5-(Math.random()*3)
				// this.velocityY= this.velocityX;
			}
		}
		faller = new Studio.SpriteAnimation({
			width: 8,
			height: 8,
			x: 16,
			y: 16,
			sheet : sheet_64,
			rect :{x:0,y:0, width: 8, height: 8},
			loop : sheet_motion.fallguy,
			fps: 15,
			borderlap : 1,
			border: stage,
			jumping: false,
		});
		this.addChild(new astroid(0,3));
		this.addChild(new astroid(2,2));
		this.addChild(new astroid(1,-2));
		this.addChild(new astroid(-1,3));
		this.addChild(faller)
		this.addChild(new cloud(5,5,1))
		this.addChild(new cloud(45,15,1))
		makePhysicObject(faller,this)
		stage.logic = function GameLogic(){
			stage.gamepadInput(faller);
		}
	}
});

stage.canvas.style.imageRendering = 'pixelated';
stage.enableKeyboardInput();
stage.gamepadInput = function(t, pad){
	
	if(this.keys[38]){
		if(!t.jumping){
			t.velocityY = -6
			t.jumping = true;
		}
	}

	if(this.keys[37]){
		t.velocityX -= .51;
		t.loop = sheet_motion.walkleft;
	}

	if(this.keys[40]){

	}

	if(this.keys[39]){
		t.velocityX += .51;
		t.loop = sheet_motion.walkright;
	}

	if (t.velocityY < 0){
		t.loop = sheet_motion.fallguy;
	}else{
		if (t.velocityX > 1 || t.velocityX < -1){
		}else{
			t.loop = sheet_motion.stand;
			t.fps = 6
		}
		
	}
	
}