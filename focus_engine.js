var FOCUS_ENGINE = new Studio.Plugin({
	options: {
		waitTime: 12, // frames
		menu : null
	},
	init: function(a) {
		stage.enableKeyboardInput();
		this.wait = this.waitTime;
		this.cur = null;
		this.wait = 0;
		this.currentMenu = null;
		this.active = true
		if(this.options.menu){
			this.setCurrentMenu(this.options.menu)
		}
	},
	setCurrentMenu : function(menu){
		this.currentMenu = menu;
		this.cur = this.currentMenu.first;
		if(this.cur.hover){
			this.cur.hover();
		}
	},
	action: function(stage) {
		// the action fires at the end of every stage loop. 
		// a = stage
		this.wait--;
		if(this.wait>0) return;

		if(stage.keys[38] || stage.keys["UP"]){
			if(this.cur.prev){
				this.cur.reset();
				this.cur = this.cur.prev;
				this.cur.hover();
			}
			this.wait = this.options.waitTime;
		}
		if(stage.keys[40] || stage.keys["DOWN"]){
			if(this.cur.next){
				this.cur.reset();
				this.cur = this.cur.next;
				this.cur.hover();
			}
			this.wait = this.options.waitTime;
		}
		if(stage.keys[13] || stage.keys[32] || stage.keys["A"]){
			this.cur.action();
			this.wait = this.options.waitTime*2;
		}
	}

})
