
var stage = new Studio.Stage("canvas",{fullscreen:0, resolution: 1, dur: 1000/60, interpolate: 1, smoothing: false, webgl: 0});
Studio.DEBUG = true


var textBuffer = new Studio.Cache(512,512,stage)
var buttonCount = 0;
var text_slices = {
	button_1 : {x:0, y:0, width: 120, height: 24},
	button_2 : {x:0, y:24, width: 120, height: 24},
	button_3 : {x:0, y:48, width: 120, height: 24}
}

textBuffer.addSlice(text_slices);




var button3 = new Studio.UIButton({x:160,y:230, height: 24, width: 120, text:'Options'},stage, textBuffer, 'button_3');

button3.hover = button3.focus = function(a){
	stage.stopTween(this.hoverOut_tween)
	stage.playTween(this.hoverIn_tween)
	this.back.color.setFromHex("#FF0080")
	this.textBox.setColor('#FFFF66').finish()
}

button3.reset = function(a){
	stage.stopTween(this.hoverIn_tween);
	stage.playTween(this.hoverOut_tween)
	this.back.color.setFromHex("#FF00FF")
	this.textBox.setColor('#FFFFFF').finish()
}

button3.action = function(a){
	if(stage.activeScene){
		stage.clearScene();
	}else{
		stage.setScene(home);
	}
}



var Paralaxx = {
	init : function(){
		for (var i = 0; i  !== this.children.length; i++) {
			this.children[i]._offsetY = this.children[i].y;
			this.children[i]._offsetX = this.children[i].x;
		}
	},
	frame : function(){
		for (var i = 0; i  !== this.children.length; i++) {
			this.children[i].y = (((this.y) * i )*.1)+this.children[i]._offsetY;
			this.children[i].x = (((this.x) * i )*.1)+this.children[i]._offsetX;
		}
	}
}


var home = new Studio.Scene({
	width: stage.width, 
	height: stage.height, 
	x: 0,
	y: -stage.height,

	build : function(){
		var back = new Studio.DisplayObject();
		var patt = new Studio.Pattern({width:stage.width,height:stage.height,overflowX:96, overflowY: 96, image: background, anchorX:0, anchorY:0, slice:'Sparks'},stage);
		
		var back_clip = new Studio.Clip({width:this.width, height:this.height, anchorX: 0, anchorY: 0})
		this.addChild(back_clip);
		this.addChild(back);
		this.addChild(new Studio.Restore());
		back.addChild(patt);
		var count = 0;
		patt.onEnterFrame = function(){
			this.x-=Math.sin(count);
			count+=.01
			this.y-=2;
			this.checkOverflow();
		}
		var centerH = this.width/2;
		var centerV = this.height/3;
		this.addChild(new Studio.Sprite({image: _parts, slice: 'shadow', width: 276, height: 158, x: 0 +centerH, y: -6+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'down-left', width: 268, height: 78, x: 2+centerH, y: 18+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'break-right', width: 264, height: 74, x: 0+centerH, y: -60+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'ball_large',width: 22, height: 22, x: 3+centerH, y: 94+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'break-left', width: 268, height: 74, x: 2+centerH, y: -60+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'down-right', width: 268, height: 78, x: 2+centerH, y: 20+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'down-glass', width: 268, height: 82, x: 2+centerH, y: 20+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'break-glass', width: 264, height: 74, x: 0+centerH, y: -60+centerV}));
		this.addChild(new Studio.Sprite({image: _parts, slice: 'holder', width: 300, height: 122, x: 2+centerH, y: 40+centerV}));
		
		var button = new Studio.UIButton({x:0+centerH,y:150+centerV, height: 24, width: 120, text:'Scene 1'},stage, textBuffer, 'button_1');

		button.hover = button.focus = function(a){
			stage.stopTween(this.hoverOut_tween)
			stage.playTween(this.hoverIn_tween)
			this.back.color.setFromHex("#FF0080")
			this.textBox.setColor('#FFFF66').finish()
		}

		button.reset = function(a){
			stage.stopTween(this.hoverIn_tween);
			stage.playTween(this.hoverOut_tween)
			this.back.color.setFromHex("#FF00FF")
			this.textBox.setColor('#FFFFFF').finish()
		}

		button.action = function(a){
			stage.setScene(Game)
		}

		this.addChild(button);
		this.addButton(button);


		var button2 = new Studio.UIButton({x:0+centerH,y:190+centerV, height: 24, width: 120, text:'Scene 2'},stage, textBuffer, 'button_2');

		button2.hover = button2.focus = function(a){
			stage.stopTween(this.hoverOut_tween)
			stage.playTween(this.hoverIn_tween)
			this.back.color.setFromHex("#FF0080")
			this.textBox.setColor('#FFFF66').finish()
		}

		button2.reset = function(a){
			stage.stopTween(this.hoverIn_tween);
			stage.playTween(this.hoverOut_tween)
			this.back.color.setFromHex("#FF00FF")
			this.textBox.setColor('#FFFFFF').finish()
		}

		button2.action = function(a){

		}
		this.addChild(button2);
		this.addButton(button2);
		
		this.slideIn = stage.createTween(this,'elasticOut',{y: 0, x:0}, 3600);
		this.slideOut = stage.createTween(this,'chillInOut',{x:-stage.width}, 1500, function(){
			this.close();
			this.y = -stage.height;
			this.x = 0;
		});

		this.menu = [button,button2,button3];

	},
	init : Paralaxx.init,
	onActivate: function(stage){
		stage.stopTween(this.slideOut);
		stage.playTween(this.slideIn);
		FOCUS_ENGINE.setCurrentMenu(this.menu);

	},
	onDeactivate: function(stage){
		stage.stopTween(this.slideIn);
		stage.playTween(this.slideOut);
		FOCUS_ENGINE.setCurrentMenu(global_menu);
	},
	i:0,
	onEnterFrame: Paralaxx.frame
})


stage.setScene(home)

stage.enableTouchEvents();

var global_menu = [button3];

stage.addButton(button3)
stage.addChildren(button3)

stage.addInput(FOCUS_ENGINE,{});
stage.snap=true
Studio.start();