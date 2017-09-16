var stage=new Studio.Stage("canvas",{webgl:1,fullscreen:2,resolution:1,dur:1e3/60,interpolate:0,snap:!0}),GAMEPAD=new Studio.Plugin({options:{},init:function t(e){this.gamepad=null;for(var s=1;s<=4;s++)e["GAMEPAD_"+s]={};navigator.getGamepads&&(this.gamepads=navigator.getGamepads(),this.active=!0)},action:function(t){this.gamepads=navigator.getGamepads();for(var e=null,s=0;s!=this.gamepads.length;s++)this.gamepads[s]&&(this.gamepad=this.gamepads[s],e=t["GAMEPAD_"+(s+1)],e.A=this.gamepad.buttons[0].value,e.B=this.gamepad.buttons[1].value,e.X=this.gamepad.buttons[2].value,e.Y=this.gamepad.buttons[3].value,e.L1=this.gamepad.buttons[4].value,e.R1=this.gamepad.buttons[5].value,e.L2=this.gamepad.buttons[6].value,e.R2=this.gamepad.buttons[7].value,e.UP=this.gamepad.buttons[12].value,e.DOWN=this.gamepad.buttons[13].value,e.LEFT=this.gamepad.buttons[14].value,e.RIGHT=this.gamepad.buttons[15].value,e.MENU=this.gamepad.buttons[9].value);this.gamepads[0]&&(t.keys.DOWN=this.gamepads[0].buttons[13].value,t.keys.UP=this.gamepads[0].buttons[12].value,t.keys.A=this.gamepads[0].buttons[0].value,t.keys.B=this.gamepads[0].buttons[1].value,t.keys.LEFT=this.gamepads[0].buttons[14].value,t.keys.RIGHT=this.gamepads[0].buttons[15].value)}});stage.enableKeyboardInput(),stage.addInput(GAMEPAD),Studio.UIButton=function(t,e){this.hovered=!1,this.text="Button",t&&this.apply(t),this.back=new Studio.Rect({height:this.height,width:this.width}),this.back.color.setFromHex("#FF00FF"),this.front=new Studio.Rect({height:this.height-4,width:this.width-4}),this.front.color.set(0,0,0,.8),this.textBox=new Studio.TextBox(this.width-10,this.height,e).apply({x:0,y:0,font:new Studio.Font("BigBreak",16),lineHeight:12,vertical_align:1,horizontal_align:Studio.CENTER,shadowColor:"#FF0080"}),this.front.color.set(0,0,0,.8),this.textBox.setText(this.text).finish(),this.addChildren(this.back,this.front,this.textBox),this.hoverIn_tween=e.createTween(this,"quadInOut",{scaleX:1.2,scaleY:1.2},300).loop(!0).reflect(!0),this.hoverOut_tween=e.createTween(this,"quadOut",{scaleX:1,scaleY:1},300)},Studio.UIButton.prototype=new Studio.Rect,Studio.UIButton.prototype.constructor=Studio.UIButton,Studio.UIButton.prototype.onTap=Studio.UIButton.prototype.onHoverStart=function(t){this.hover&&this.hover(t)},Studio.UIButton.prototype.onTapOutside=Studio.UIButton.prototype.onHoverEnd=function(t){this.reset&&this.reset(t)},Studio.UIButton.prototype.onRelease=function(t){this.action&&this.action(t),this.reset&&this.reset(t)},stage.addInput(FOCUS_ENGINE,{}),stage.enableTouchEvents();var button=new Studio.UIButton({x:stage.width/2,y:stage.height/2,height:24,width:120,text:"Play"},stage);button.hover=button.focus=function(t){stage.stopTween(this.hoverOut_tween),stage.playTween(this.hoverIn_tween),this.back.color.setFromHex("#FF0080"),this.textBox.setColor("#FFFF66").finish()},button.reset=function(t){stage.stopTween(this.hoverIn_tween),stage.playTween(this.hoverOut_tween),this.back.color.setFromHex("#FF00FF"),this.textBox.setColor("#FFFFFF").finish()},button.action=function(t){stage.setScene(Game)};var Intro=new Studio.Scene({width:stage.width,height:stage.height,color:Studio.BLUE,build:function(t){this.y=-this.height,this.addChild(button),this.addButton(button),this.menu=[button]},onActivate:function t(e){e.addTween(this,"bounceOut",{y:0},1500),FOCUS_ENGINE.setCurrentMenu(this.menu)},onDeactivate:function t(e){e.addTween(this,"chillInOut",{y:-this.height},500)}});