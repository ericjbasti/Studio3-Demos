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
	image : sheet_64,
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

splosion = function(x,y){
	this.x=x;
	this.y=y;
}
splosion.prototype = new Studio.SpriteAnimation({
	width: 16,
	height: 8,
	x: 0,
	y: 60,
	image : sheet_64,
	rect :{x:0,y:0, width: 16, height: 8},
	loop : sheet_motion.splode,
	fps: 12
});
splosion.prototype.constructor = splosion;
splosion.prototype.onLoopComplete = function(){
	this.frame = 0;
	Game.removeChild(this);
	this.intoPool();
}
Studio.createPool(splosion);

splosionME = function(x,y){
	this.x=x;
	this.y=y;
}
splosionME.prototype = new Studio.SpriteAnimation({
	width: 16,
	height: 16,
	velocityX: 0,
	velocityY: 1,
	image : sheet_64,
	rect :{x:0,y:0, width: 16, height: 16},
	loop : sheet_motion.splodeME,
	fps: 12
});
splosionME.prototype.constructor = splosionME;
splosionME.prototype.onEnterFrame = function(){
	this.y+=this.velocityY;
	this.x+=this.velocityX;
}
splosionME.prototype.onLoopComplete = function(){
	this.frame = 0;
	Game.removeChild(this);
	this.intoPool();
}
Studio.createPool(splosionME);


var Game = new Studio.Scene({
	y: 0,
	x: 0,
	width: stage.width*1, 
	height: stage.height*1,

	onActivate : function(stage){
	},
	gravity: .5,
	build: function (scene){
		this.color.style='rgba(225,225,225,.4)';
		this.color.r=1;
		this.color.g=1;
		this.color.b=1;
		this.color.a=.4;
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
			image : sheet_64,
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
				Game.addChild(splosion.fromPool({x:this.x, y:60}))
				this.y=0;
				this.velocityX= 1.5-(Math.random()*3)
				// this.velocityY= this.velocityX;
			}
			if(this.hitTestRect(faller)){
				faller.velocityY *= -1
				faller.velocityX = this.velocityX;
				Game.addChild(splosionME.fromPool({x:faller.x, y:faller.y, velocityX:faller.velocityX, velocityY: faller.velocityY}))
				this.y=0;
				this.velocityX= 1.5-(Math.random()*3)
				
			}
		}
		faller = new Studio.SpriteAnimation({
			width: 8,
			height: 8,
			x: 16,
			y: 16,
			image : sheet_64,
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




stage.bitmap.style.imageRendering = 'pixelated';
stage.enableKeyboardInput();
stage.enableTouchEvents();

Game.addControl = function(num,scene){
	var button = stage.keys.onScreen[num]
	scene.addChild(button)

	button.keydown = function(){
		this.color = Studio.BLUE;
	}
	button.keyup = function(){
		this.color = Studio.RED;
	}
	button.onTap = function(){
		stage.keys[num] = 1;
		this.keydown();
	}
	button.onRelease = button.onReleaseOutside = function(){
		stage.keys[num] = 0;
		this.keyup();
	}
	scene.addButton(button)
}

stage.keys.onScreen[38] = new Studio.Rect({width:10, height:10, color: Studio.RED, x:5, y:5})
Game.addControl(38,Game);

stage.keys.onScreen[37] = new Studio.Rect({width:10, height:10, color: Studio.RED, x:40, y: 5})
Game.addControl(37,Game);

stage.keys.onScreen[39] = new Studio.Rect({width:10, height:10, color: Studio.RED, x:51, y: 5})
Game.addControl(39,Game);


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