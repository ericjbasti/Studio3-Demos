var stage = new Studio.Stage("canvas",{webgl:1, fullscreen:0, resolution: 1, dur: 1000/60, interpolate: 0, snap: true});

var GAMEPAD = new Studio.Plugin({
	options: {
	},
	init: function GamePad_init(a) {
		this.gamepad = null;
		for(var i = 1; i<= 4; i++){ // we create the objects for gamepads even if we can't use them.
			a['GAMEPAD_'+i] = {};
		}
		if(navigator.getGamepads){ // if we can use the Gamepads api, lets activate the plugin.
			this.gamepads = navigator.getGamepads();
			this.active = true;
		}
	},
	action: function(stage) {
		this.gamepads = navigator.getGamepads();
		var pad = null;
	    for(var i = 0; i != this.gamepads.length; i ++){
	        
	        // If we actually have a gamepad connected at this index lets use it.
	        // its very possible to not have one at some point in the index.

	        if(this.gamepads[i]){ 
	        	// console.log(this.gamepads[i])
	            this.gamepad = this.gamepads[i];
	            
	            pad = stage['GAMEPAD_'+(i+1)];

	            pad['A'] = this.gamepad.buttons[0].value; // A
	            pad['B'] = this.gamepad.buttons[1].value; // B
	            pad['X'] = this.gamepad.buttons[2].value; // X
	            pad['Y'] = this.gamepad.buttons[3].value; // Y

	            pad['L1'] = this.gamepad.buttons[4].value; // L1
	            pad['R1'] = this.gamepad.buttons[5].value; // R1
	            pad['L2'] = this.gamepad.buttons[6].value; // L2
	            pad['R2'] = this.gamepad.buttons[7].value; // R2

	            pad['UP'] = this.gamepad.buttons[12].value; // Up
	            pad['DOWN'] = this.gamepad.buttons[13].value; // Down
	            pad['LEFT'] = this.gamepad.buttons[14].value; // Left
	            pad['RIGHT'] = this.gamepad.buttons[15].value; // Right

	            pad['MENU'] = this.gamepad.buttons[9].value; // Menu

	            // drawAnalogStick(gamepad.axes[0], gamepad.axes[1], 540, 416); // left stick
	            // drawAnalogStick(gamepad.axes[2], gamepad.axes[3], 736, 416); // right stick
	            // ctx.translate(1200,0)
	        }
	    }
	    if(this.gamepads[0]){
	    	stage.keys['DOWN'] = this.gamepads[0].buttons[13].value;
	    	stage.keys['UP'] = this.gamepads[0].buttons[12].value;
	    	stage.keys['A'] = this.gamepads[0].buttons[0].value;
	    	stage.keys['B'] = this.gamepads[0].buttons[1].value;
	    	stage.keys['LEFT'] = this.gamepads[0].buttons[14].value;
	    	stage.keys['RIGHT'] = this.gamepads[0].buttons[15].value;
	    }
	}
})

stage.enableKeyboardInput();
stage.addInput(GAMEPAD);


Studio.UIButton = function(attr, stage){
	this.hovered = false;
	this.text = 'Button';
	if (attr) {
		this.apply(attr);
	}
	this.back = new Studio.Rect({height: this.height, width: this.width});
	this.back.color.setFromHex("#FF00FF")
	this.front = new Studio.Rect({height: this.height-4, width: this.width-4});
	this.front.color.set(0,0,0,.8);
	this.textBox = new Studio.TextBox(this.width-10, this.height, stage).apply({
		x: 0 , 
		y: 0 , 
		font: '16px BigBreak',
		lineHeight: 14 | 0 , 
		vertical_align: Studio.MIDDLE, 
		horizontal_align: 0.5,
		shadowColor: '#FF0080'
	})
	this.front.color.set(0,0,0,.8);
	this.textBox.setText(this.text).finish();
	this.addChildren(this.back,this.front,this.textBox);

	this.hoverIn_tween = stage.createTween(this, 'quadInOut', {scaleX: 1.2, scaleY: 1.2}, 300).loop(true).reflect(true);
	this.hoverOut_tween = stage.createTween(this, 'quadOut', {scaleX: 1, scaleY: 1}, 300);
}
Studio.UIButton.prototype = new Studio.Rect();
Studio.UIButton.prototype.constructor = Studio.UIButton;

Studio.UIButton.prototype.onTap = Studio.UIButton.prototype.onHoverStart = function(a){
	if(this.hover){
		this.hover(a);
	}
}
Studio.UIButton.prototype.onTapOutside = Studio.UIButton.prototype.onHoverEnd = function(a){
	if(this.reset){
		this.reset(a);
	}
}

Studio.UIButton.prototype.onRelease = function(a){
	if(this.action){
		this.action(a);
	}
	if(this.reset){
		this.reset(a);
	}
}


stage.addInput(FOCUS_ENGINE,{});
stage.enableTouchEvents();
var button = new Studio.UIButton({x:stage.width/2,y:stage.height/2, height: 24, width: 120, text:'Play'},stage);

button.hover = button.focus = function(a){
	stage.stopTween(this.hoverOut_tween)
	stage.playTween(this.hoverIn_tween)
	this.back.color.setFromHex("#FF0080")
	this.textBox.setColor('#FFFF66').finish()
	console.log('button')
}

button.reset = function(a){
	stage.stopTween(this.hoverIn_tween);
	stage.playTween(this.hoverOut_tween)
	this.back.color.setFromHex("#FF00FF")
	this.textBox.setColor('#FFFFFF').finish()
}

button.action = function(a){
	stage.setScene(Game);
}

var Intro = new Studio.Scene({width:stage.width,height: stage.height, color: Studio.BLUE,
	build : function(stage){
		this.y = -this.height;
		this.addChild(button);
		this.addButton(button);
		this.menu = [button];
	},
	onActivate : function Intro_onActivate(stage){
		stage.addTween(this,'bounceOut',{y:0},1500);
		FOCUS_ENGINE.setCurrentMenu(this.menu);
	},
	onDeactivate : function Intro_onDeactivate(stage){
		stage.addTween(this,'chillInOut',{y:-this.height},500)
	}
})
