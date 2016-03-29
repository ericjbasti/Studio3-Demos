var stage = new Studio.Stage("canvas",{fullscreen:3, resolution: 1, dur: 1000/60, interpolate: 0, snap: true});

	stage.GAMEPAD_1 = {};
	stage.GAMEPAD_2 = {};
	stage.GAMEPAD_3 = {};
	stage.GAMEPAD_4 = {};

stage.gamepadInput = function(t, pad){
	if((this.keys[38] || pad["UP"] || pad["A"])){
		if(!t.jumping){
			t.velocityY = -16;
			t.jumping = true;
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

stage.enableKeyboardInput();

var GAMEPAD = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.gamepads = navigator.getGamepads();
		this.gamepad = null;
		this.active = true;
	},
	action: function(stage) {
		this.gamepads = navigator.getGamepads();
		var pad = null;
	    for(var i = 0; i != this.gamepads.length; i ++){
	        if(this.gamepads[i]){
	            this.gamepad = this.gamepads[i];

	            if(i==0){
	            	pad = stage.GAMEPAD_1;
	            }else if(i==1){
	            	pad = stage.GAMEPAD_2;
	            }

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

	            //stage.keys['MENU'] = this.gamepad.buttons[16].value; // Menu

	            // drawAnalogStick(gamepad.axes[0], gamepad.axes[1], 540, 416); // left stick
	            // drawAnalogStick(gamepad.axes[2], gamepad.axes[3], 736, 416); // right stick
	            // ctx.translate(1200,0)
	        }
	    }
	}
})

if(navigator.getGamepads){
	stage.addInput(GAMEPAD);
}

var intro = new Studio.Scene({width:stage.width,height: stage.height, color: Studio.BLUE})
