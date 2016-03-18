var FOCUS_ENGINE = new Studio.Plugin({
	options: {
		waitTime: 12, // frames
		menu : null
	},
	init: function(a) {
		stage.enableKeyboardInput();
		this.wait = this.waitTime;
		this.cur = 0;
		this.wait = 0;
		this.currentMenu = null;
		this.active = true
		this.loop = true;
		if(this.options.menu){
			this.setCurrentMenu(this.options.menu)
		}
	},
	setCurrentMenu : function(menu, id){
		this.currentMenu = menu;
		this.cur = id || 0;
		for(var i =0; i != menu.length; i++){
			if(menu[i].reset) {
				menu[i].reset();
				menu[i]._focused = false;
			}
		}
		if(menu[this.cur].focus){
			menu[this.cur].focus();
		}
	},
	_check_index : function(){
		if(this.cur<0) {
			if(!this.loop) {
				this.cur = 0
			}else{
				this.cur = this.currentMenu.length-1
			}
		}
		if(this.cur>=this.currentMenu.length){
			if(!this.loop) {
				this.cur = this.currentMenu.length-1
			}else{
				this.cur = 0
			}
		}
	},
	action: function(stage) {
		// the action fires at the end of every stage loop. 
		// a = stage
		this.wait--;
		if(this.wait>0) return;

		var old = this.cur;

		if(stage.keys[38] || stage.keys["UP"]){
			this.wait = this.options.waitTime;
			this.cur--;
		}
		if(stage.keys[40] || stage.keys["DOWN"]){
			this.wait = this.options.waitTime;
			this.cur++;
		}
		
		this._check_index()

		if(this.cur != old){
			if(this.currentMenu[old].reset){
				this.currentMenu[old].reset();
				this.currentMenu[old]._focused = false;
			}
			if(this.currentMenu[this.cur].focus){
				this.currentMenu[this.cur].focus();
				this.currentMenu[this.cur]._focused = true;
			}
		}else{
			if(!this.currentMenu[this.cur]._focused && this.currentMenu[this.cur].focus){
				this.currentMenu[this.cur].focus();
				this.currentMenu[this.cur]._focused = true;
			}
		}
		if(stage.keys[13] || stage.keys[32] || stage.keys["A"]){
			this.currentMenu[this.cur].action();
			this.wait = this.options.waitTime*2;
			this.currentMenu[this.cur].reset();
		}
	}

})
