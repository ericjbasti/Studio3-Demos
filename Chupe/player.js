var Player = function(world){
	this.width = 32;
	this.height= 32; 
	this.image = curse;
	this.rect ={x:0,y:0, width: 32, height: 32};
	this.loop = right.walk;
	this.hitbox = new Studio.DisplayObject({height: 32, width: 20});
	this.addChild(this.hitbox);
	this.score = 0;
	makePhysicObject(this,world);
	this.borderlap = true;
	this.border= world;
	this.jumping = false;
	this.dir = right;
	this._hitAnimation = world.createTween(this,'bounceOut',{height: 16, width: 48}, 150);
	this._hitAnimation.then('linear',{},200).then('elasticOut',{height:32,width:32}, 600, function(){this._hit=0}).last();
	this.score_text = new Studio.TextBox(128,32,stage);
	this.score_text.font = new Studio.Font("BigBreak", 16)
	this.score_text.fontColor = '#fff'
	this.score_text.shadowColor = '#777'
	this.score_text.x = 18;
	this.score_text.anchorX = 0
	this.playerName = 'Player '+player_count;
	if(player_count>2){
		this.score_text.x = world.width-18;
		this.score_text.anchorX = 1;
	}
	this.score_text.y = 32;
	if(player_count==2 || player_count==4){
		this.score_text.y = 48;
	}
	this.score_text.setText(this.playerName+': 0').finish();
	player_count++;
	world.addChild(this.score_text)
}
Studio.inherit(Player,Studio.SpriteAnimation)

Player.prototype.scoreUp = function(amount){
	this.score+=amount;
	this.score_text.setText(this.playerName+': '+this.score).finish();
}
Player.prototype.hit = function(){
	Game.playTween(this._hitAnimation);

}


var Coin = function(i){
	this.x = 100+(i*60)
	this.y = 64+parseInt(Math.random()*5)*32
	this.loop = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]]
	this.height = 16
	this.width = 16
	this.image = coin
	this.slice = 0
	this.rect={x:0,y:0, width: 16, height: 15}
}

Studio.inherit(Coin, Studio.SpriteAnimation)

Studio.createPool(Coin, 32)

