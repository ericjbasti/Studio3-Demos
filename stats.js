var STATS = new Studio.Plugin({
	options: {
		external: true,
		height: 100,
		width: 320,
		show_text: true,
		clear_mode: 'cover', // modes : cover, erase
		position: 0,
		refresh: .25,
	},
	init: function(a) { // lets build out a canvas for the stats
		this.buffer = document.createElement('canvas');
		this.buffer.style.position = 'absolute';
		this.buffer.style.top = '0';
		this.buffer.id = '_stats_buffer'
		this.buffer.width = this.options.width;
		this.buffer.height = this.options.height;
		this.half = this.buffer.height / 2;
		this.old_memory = 0;
		if (this.options.show_text) {
			this.half = this.buffer.height
		}

		this.buffer.ctx = this.buffer.getContext('2d');
		if (this.options.external) {
			document.body.appendChild(this.buffer);
		}

		if (this.options.clear_mode == 'cover') {
			this.buffer.ctx.fillStyle = 'rgba(0,0,0,.3)';
			this.buffer.ctx.fillRect(0, 0, this.buffer.width, this.buffer.height);
		}

		this.step = 0;
		this._time = 0;
		this._tick = 0;
		this._ratio = 0;
		this._spikes = 0;
		// we rewrite these function just so we can track the draw count
		Studio.draws = 0;
		Studio.DisplayObject.prototype._delta = function(ratio) {
			Studio.draws++;
			this._dx = this.__delta(this.__x, this._world.x, ratio);
			this._dy = this.__delta(this.__y, this._world.y, ratio);
			if (this._world.rotation) {
				this._dAngle = this.__delta(this._world.angle, this.angle, ratio);
			}
		};
	},
	action: function(a) {
		this._time += Studio.delta;
		this._tick++;
		if (Studio.delta > 1000/15) {
			this._spikes++;
		}
		if(this.options.show_text && this._time>this.options.refresh*1000){
			this.displayDraws(this.buffer.ctx);
			this._time = 0;
			this._tick = 0;
		}
		this.displayFPS(this.buffer.ctx);
		// if(window.performance){
		// 	if(window.performance.memory){
		// 		this.drawMemory(this.buffer.ctx);
		// 	}
		// }
		if (!this.options.external) {
			a.ctx.drawImage(this.buffer, 0, this.options.position);
		}
	},
	cover: function(ctx) {
		ctx.fillStyle = 'rgba(0,0,0,.5)';
		ctx.fillRect(0, 12 * this.options.show_text, this.buffer.width, this.buffer.height);
	},
	erase: function(ctx) {
		ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);
	},
	drawMemory: function(ctx){
		ctx.fillStyle = '#FC00DE';
		this.memory = window.performance.memory.usedJSHeapSize;
		ctx.fillRect(this.step,15,2, ((this.memory* 0.000000954)-7)*2);
	},
	displayFPS: function(ctx) {
		if (Studio.delta > 1000/15) {
			ctx.fillStyle = 'rgb(240,0,0)';
		} else if (Studio.delta > 1000/30) {
			ctx.fillStyle = 'rgb(240,220,0)';
		} else {
			ctx.fillStyle = 'rgb(20,245,0)';
		}
		
		ctx.fillRect(this.step,this.half,2,-(Studio.delta/2));
		this.step++;
		if (this.step > this.buffer.width) {
			this.step = 0;
			this[this.options.clear_mode](ctx);
		}
		Studio.draws = 0;
	},
	displayDraws: function(ctx) {
		ctx.fillStyle = 'rgba(0,0,0,.8)';
		ctx.fillRect(0, 0, this.buffer.width, 12);
		ctx.fillStyle = 'rgb(255,255,255)';
		if(this.memory){
			ctx.fillText((this._tick/this.options.refresh | 0) + ' fps / ' + Studio.draws + ' draw / ' + this._spikes + ' spikes     MEM: '+(this.memory* 0.000000954).toFixed(3)+'  &  Buildup: '+(this.memory-this.old_memory), 2, 10);
			this.old_memory = this.memory;
		}else{
			ctx.fillText((this._tick/this.options.refresh | 0) + ' fps / ' + Studio.draws + ' draw / ' + this._spikes + ' spikes', 2, 10);
		}
	}

})

