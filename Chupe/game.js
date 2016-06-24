var blocks = [];

var prizes = [];
var prizemax = 8;
var prizegot = 0;

var foods = []
var max_food = 3;
var food_got = 0;

var sodas = []
var max_soda = 3;
var soda_got = 0;

var actionables = [];
var gravitated = [];

var player_count = 1;

var Game = new Studio.Scene({
	y: .5,
	x: -stage.width,
	width: stage.width*1, 
	height: stage.height*1,
	colorHex: '#00ff00',
	gravity: .78,
	onActivate : function(stage){
		stage.addTween(this,'chillInOut',{x:0},1500)
		stage.logic = GameLogic;
		FOCUS_ENGINE.active = false;
		wind_snd.play();
	},
	build: function (scene){
		this.addChild(new Studio.Clip({
			x:0,
			y:0,
			width: this.width,
			height: this.height,
			anchorX: 0,
			anchorY: 0
		}))
		var patt = new Studio.Pattern({width:this.width,height:256, overflowX:96, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Skyline'}, this);
		this.addChild(patt);

		var water = new Studio.Pattern({
			y:199,
			width:this.width,
			height:58, 
			overflowX:32, 
			overflowY: 0, 
			image: curse, 
			anchorX:0, anchorY:0, 
			slice:'Water',
			onEnterFrame: function(){
				this.x-=.1;
				this.checkOverflow();
			}}, this);

		this.addChild(water);

		var water2 = new Studio.Pattern({y:202,width:this.width,height:58, overflowX:32, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Water2'}, this);
		water2.onEnterFrame = function(){
			this.x-=.2;
			this.checkOverflow();
		}
		this.addChild(water2);

		var water3 = new Studio.Pattern({y:210,width:this.width,height:58, overflowX:32, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Water3'}, this);
		water3.onEnterFrame = function(){
			this.x-=.25;
			this.checkOverflow();
		}
		this.addChild(water3);

		var water4 = new Studio.Pattern({y:216,width:this.width,height:58, overflowX:32, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Water4'}, this);
		water4.onEnterFrame = function(){
			this.x-=.3;
			this.checkOverflow();
		}
		this.addChild(water4);

		var water5 = new Studio.Pattern({y:228,width:this.width,height:58, overflowX:32, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Water5'}, this);
		water5.onEnterFrame = function(){
			this.x-=.4;
			this.checkOverflow();
		}
		this.addChild(water5);

		var water6 = new Studio.Pattern({y:248,width:this.width,height:100, overflowX:32, overflowY: 0, image: curse, anchorX:0, anchorY:0, slice:'Water6'}, this);
		this.addChild(water6);

		var cloud = new Studio.Sprite({x:64,y:16, width:32*7, height:68, image:curse, slice:'Large Cloud', borderlap: true, border: this})
		this.addChild(cloud);
		cloud.onEnterFrame = function(){
			this.x-=.25;
			if(this.x<0){
				this.x = scene.width;
			}
		}

		var small_cloud = new Studio.Sprite({x:400,y:100, width:70, height:24, image:curse, slice:'Small Cloud 1', borderlap: true, border: this})
		this.addChild(small_cloud);
		small_cloud.onEnterFrame = function(){
			this.x-=.35;
			if(this.x<0){
				this.x = scene.width;
			}
		}

		for (var i = 0; i != 2; i++){
			var block = new Studio.Sprite({x: 16+(i*32), y: 32*7, height: 32, width: 32, image:curse, slice:'Floating Rock Center'})
			blocks.push(block);
			this.addChild(block);
		}
		block.slice = 'Floating Rock Right'

		for (var i = 0; i != 22; i++){
			var block = new Studio.Sprite({x: 0+(i*32), y: 32*11, height: 32, width: 32, image:curse, slice:'Rock'})
			blocks.push(block);
			this.addChild(block);
		}


		for (var i = 0; i != 2; i++){
			var block = new Studio.Sprite({x: (this.width-16)-(i*32), y: 32*7, height: 32, width: 32, image:curse, slice:'Floating Rock Center'})
			blocks.push(block);
			this.addChild(block);
		}

		block.slice ='Floating Rock Left'

		for (var i = 0; i != 6; i++){
			var block = new Studio.Sprite({x: (this.width/2)-(i*32)+62, y: 32*10, height: 32, width: 32, image:curse})
			if(i==0) {
				block.slice = 'Rock Last';
			}else if(i==5){
				block.slice = 'Rock First';
			}else{
				block.slice = 'Rock';
			}
			blocks.push(block);
			this.addChild(block);
		}
		for (var i = 0; i != 4; i++){
			var block = new Studio.Sprite({x: (this.width/2)-(i*32)+32, y: 32*9, height: 32, width: 32, image:curse, slice:'Rock'})
			if(i==0) {
				block.slice = 'Rock Last';
			}else if(i==3){
				block.slice = 'Rock First';
			}else{
				block.slice = 'Rock';
			}
			blocks.push(block);
			this.addChild(block);
		}
		for (var i = 0; i != 2; i++){
			var block = new Studio.Sprite({x: (this.width/2)-(i*32), y: 32*8, height: 32, width: 32, image:curse, slice:'Rock'})
			if(i==0) {
				block.slice = 'Rock Last';
			}else if(i==1){
				block.slice = 'Rock First';
			}else{
				block.slice = 'Rock';
			}
			blocks.push(block);
			this.addChild(block);
		}

		var movers = new Studio.DisplayObject();
		movers.x = (this.width/2)-32
		movers.y = 32*5;
		var count = 0;
		movers.onEnterFrame = function(){
			this.velocityX = Math.sin(count)*2;
			this.velocityY = Math.cos(count);
			this.x += this.velocityX;
			this.y += this.velocityY;
			count+=.02;
			for(var i = 0; i!= this._hasChildren; i++){
				this.children[i].velocityX = this.velocityX;
			}
		}

		var block = new Studio.Sprite({x: 0, y: 0, height: 32, width: 32, image:curse, slice:'Floating Rock Left'})
		blocks.push(block);
		movers.addChild(block);
		var block = new Studio.Sprite({x: 32, y: 0, height: 32, width: 32, image:curse, slice:'Floating Rock Center'})
		blocks.push(block);
		movers.addChild(block);
		var block = new Studio.Sprite({x: 64, y: 0, height: 32, width: 32, image:curse, slice:'Floating Rock Right'})
		blocks.push(block);
		movers.addChild(block);
		this.addChild(movers)


		PLAYER_1 = new Player(this);
		PLAYER_1.x =20
		PLAYER_2 = new Player(this);
		PLAYER_2.x=300
		PLAYER_2.offsetY= 4
		PLAYER_3 = new Player(this);
		PLAYER_3.x=150
		PLAYER_3.offsetY= 0
		PLAYER_3.offsetX= 8

		PLAYER_4 = new Player(this);
		PLAYER_4.x=420
		PLAYER_4.offsetY= 4
		PLAYER_4.offsetX= 8
		this.addChild(PLAYER_1)
		this.addChild(PLAYER_2)
		this.addChild(PLAYER_3)
		this.addChild(PLAYER_4)
		actionables.push(PLAYER_1);
		actionables.push(PLAYER_2);
		actionables.push(PLAYER_3);
		actionables.push(PLAYER_4);
		for (var i = 0; i != prizemax; i++){
			var block = new Studio.SpriteAnimation({x: 100+(i*60), loop:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]],y: 64+parseInt(Math.random()*5)*32, height: 16, width: 16, image:coin, rect :{x:0,y:0, width: 16, height: 16}})
			prizes.push(block);
			this.addChild(block);
		}
		for (var i = 0; i != max_food; i++){
			var block = new Studio.Sprite({x: parseInt((Math.random()*18)+3)*32,y: 100, height: 24, width: 24, image:curse, slice: 'food_'+parseInt(Math.random()*2)})
			foods.push(block);
			makePhysicObject(block,this)
			this.addChild(block);
		}

		for (var i = 0; i != max_soda; i++){
			var block = new Studio.Sprite({x: parseInt((Math.random()*18)+3)*32,y: 100, height: 32, width: 16, image:curse, slice: 'soda_'+parseInt(Math.random()*2)})
			foods.push(block);
			makePhysicObject(block,this)
			this.addChild(block);
		}

		this.addChild(new Studio.Restore())
	}
});

stage.gamepadInput = function(t, pad){
	
	if((this.keys[38] || pad["UP"] || pad["A"])){
		if(!t.jumping){
			t.velocityY = -t._world.height/(t._world.height/16);
			t.jumping = true;
			jump_snd.play()
		}
	}

	if(this.keys[37] || pad["LEFT"]){
		t.velocityX -= .51;
		t.dir = left;
	}

	if(this.keys[40] || pad["DOWN"]){

	}

	if(this.keys[39] || pad["RIGHT"]){
		t.velocityX += .51;
		t.dir = right;
	}

	if (t.velocityY < 0){
		t.loop = t.dir.jump;
	}else{
		if (t.velocityX > 1 || t.velocityX < -1){
			t.loop = t.dir.walk;
			t.fps = 12;
		}else{
			t.loop = t.dir.pant;
			t.fps = 6
		}
	}
	
}

var players = [PLAYER_1,PLAYER_2,PLAYER_3,PLAYER_4]

PLAYER_1.height=PLAYER_1.width=16


var GameLogic = function GameLogic(){
	if(PLAYER_1){
		stage.gamepadInput(PLAYER_1, stage.GAMEPAD_1);
	}
	if(PLAYER_2){
		stage.gamepadInput(PLAYER_2, stage.GAMEPAD_2);
	}
	if(PLAYER_3){
		stage.gamepadInput(PLAYER_3, stage.GAMEPAD_3);
	}
	if(PLAYER_4){
		stage.gamepadInput(PLAYER_4, stage.GAMEPAD_4);
	}

	for(var i = 0; i !=players.length; i++){
		for(var j=1; j!=players.length; j++){
			if(j!=i){
				if(players[i]._hit || players[j]._hit){

				}else if(players[i].hitbox.hitTestRect(players[j].hitbox)){
					var dx = players[i].x-players[j].x;
					var dy = players[i].y-players[j].y;
					players[i].height = players[j].height;
					players[i].width = players[j].width;
					if(players[j].velocityY>10){
						players[i]._hit = true;
						players[i].hit();
						players[j].velocityY = -18;
						players[j].jumping = true;
					}
					if(players[i].velocityY>10){
						players[j]._hit = true;
						players[j].hit();
						players[i].velocityY = -18;
						players[i].jumping = true;
					}
				}
			}
		}

	}

	for (var i = 0; i != blocks.length; i++){
		var block = blocks[i];
		for(var j = 0; j!=gravitated.length; j++){
			var t = gravitated[j];
			if(block._world.x>t._world.x+32 || block._world.x<t._world.x-32){

			}else if(block._world.y>t._world.y+32 || block._world.y<t._world.y-32){

			}else if(t.hitbox.hitTestRect(block)){
				var dx = t._world.x-block._world.x;
				var dy = t._world.y-block._world.y;
				var dv = (block._world.height-t._world.height)/4
				t.platform = block;
				if(dy<-10 && t.velocityY>0){
					if(t.y+(t._world.height*t.anchorY) < block._world.y){
						t.velocityY *= t.bounce;
						// t.y = block._world.y-(block._world.height*block.anchorY)-(t._world.height*t.anchorY)-1;
						t.y=(block._world.y-(block._world.height/2))+(dy/2)+dv;
						t._snapback();
						t.jumping = false;
					}
					// return;
				}
			}else{

			}
		}
	}

	for (var i = 0; i != prizes.length; i++){
		var block = prizes[i];
		for(var j = 0; j!=actionables.length; j++){
			var t = actionables[j];
			if(block.got){

			}else if(block.x-32>t.x || block.x+32<t.x){
				
			}else if(block.y-32>t.y || block.y+32<t.y){

			}else if(t.hitbox.hitTestRect(block)){
				block.got = true;
				if(t.scoreUp){
					t.scoreUp(1);
					coin_snd.play();
				}
				prizegot++;
				stage.addTween(block,'quadOut', {scaleX: 2, scaleY: 2 , alpha: 0, rotation: 360}, 300 , function(){
					if(prizegot ==prizemax){
						for(var i = 0; i != prizes.length; i++){
							var block = prizes[i];
							block.y= 64+parseInt(Math.random()*5)*32;
							stage.addTween(block,'quadIn', {scaleX: 1, scaleY: 1 , alpha: 1, rotation: 0}, 300, function(){
								this.got = false;
							});
							prizegot = 0;
						}
					}
				});
			}else{
			}
		}
	}
}


