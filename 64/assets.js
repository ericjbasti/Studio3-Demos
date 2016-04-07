var sheet_64 = new Studio.Image('images/64.png')

var sheet_motion = {
	ball: [[0,0],[1,0],[2,0],[3,0]],
	fallguy: [[0,1],[1,1],[2,1],[1,1]],
	walkleft: [[0,2],[1,2],[2,2]],
	walkright: [[0,3],[1,3],[2,3]],
	stand: [[0,1]],
	cloud: [[1,0],[2,0],[3,0]],
	splode: [[4,0],[5,0],[4,1],[5,1]],
}

var actionables = [];
var gravitated = [];

var blocks = [];
var prizes = [];


// our really siple physics engine.
var makePhysicObject = function Physics(who, world){
	who.velocityY = 0;
	who.velocityX = 0;
	who.friction  = .9;
	who.bounce = 0;
	if(!who.hitbox){ // if we don't have a unique hitbox, we'll use our own rect as a hitbox
		who.hitbox = who;
	}
	who.maxVelocity = who.height/2;
	who.logic = function(){
		// gravity is a constant force
		this.velocityY += world.gravity;

		if(this.platform && ! this.jumping){
			if(this.platform.velocityX)	this.x+=this.platform.velocityX;
			if(this.platform.velocityY)	this.y+=this.platform.velocityY;
		}
		if(this.velocityY>this.maxVelocity) this.velocityY = this.maxVelocity;
		this.velocityX *= this.friction;
		this.y+=this.velocityY;
		this.x+=this.velocityX;
		if(this.y+this._world.height*this.anchorY>world.height){
			this.y = world.height-(this._world.height*this.anchorX);
			this.velocityY *= this.bounce;
			this.jumping = false;
			this.platform = false;
		}
		if(this.x>world.width){
			this.x-=world.width;
		}
		if(this.x<0){
			this.x+=world.width;
		}
	}
	gravitated.push(who);
}