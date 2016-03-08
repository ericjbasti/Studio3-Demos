var STATS=new Studio.Plugin({options:{external:!0,height:100,width:320,show_text:!0,clear_mode:"cover",position:0,refresh:.25},init:function(t){this.active=!0,this.buffer=document.createElement("canvas"),this.buffer.style.position="absolute",this.buffer.style.top="0",this.buffer.id="_stats_buffer",this.buffer.width=this.options.width,this.buffer.height=this.options.height,this.half=this.buffer.height/2,this.old_memory=0,this.options.show_text&&(this.half=this.buffer.height),this.buffer.ctx=this.buffer.getContext("2d"),this.options.external&&document.body.appendChild(this.buffer),"cover"==this.options.clear_mode&&(this.buffer.ctx.fillStyle="rgba(0,0,0,.3)",this.buffer.ctx.fillRect(0,0,this.buffer.width,this.buffer.height)),this.step=0,this._time=0,this._tick=0,this._ratio=0,this._spikes=0,Studio.draws=0,Studio.DisplayObject.prototype._delta=function(t){Studio.draws++,this._dx=this.__delta(this.__x,this._world.x,t),this._dy=this.__delta(this.__y,this._world.y,t),this._world.rotation&&(this._dAngle=this.__delta(this._world.angle,this.angle,t))}},action:function(t){this._time+=Studio.delta,this._tick++,Studio.delta>1e3/15&&this._spikes++,this.options.show_text&&this._time>1e3*this.options.refresh&&(this.displayDraws(this.buffer.ctx),this._time=0,this._tick=0),this.displayFPS(this.buffer.ctx),this.options.external||t.ctx.drawImage(this.buffer,0,this.options.position)},cover:function(t){t.fillStyle="rgba(0,0,0,.5)",t.fillRect(0,12*this.options.show_text,this.buffer.width,this.buffer.height)},erase:function(t){t.clearRect(0,0,this.buffer.width,this.buffer.height)},drawMemory:function(t){t.fillStyle="#FC00DE",this.memory=window.performance.memory.usedJSHeapSize,t.fillRect(this.step,15,2,2*(9.54e-7*this.memory-7))},displayFPS:function(t){Studio.delta>1e3/15?t.fillStyle="rgb(240,0,0)":Studio.delta>1e3/30?t.fillStyle="rgb(240,220,0)":t.fillStyle="rgb(20,245,0)",t.fillRect(this.step,this.half,2,-(Studio.delta/2)),this.step++,this.step>this.buffer.width&&(this.step=0,this[this.options.clear_mode](t)),Studio.draws=0},displayDraws:function(t){t.fillStyle="rgba(0,0,0,.8)",t.fillRect(0,0,this.buffer.width,12),t.fillStyle="rgb(255,255,255)",this.memory?(t.fillText((this._tick/this.options.refresh|0)+" fps / "+Studio.draws+" draw / "+this._spikes+" spikes     MEM: "+(9.54e-7*this.memory).toFixed(3)+"  &  Buildup: "+(this.memory-this.old_memory),2,10),this.old_memory=this.memory):t.fillText((this._tick/this.options.refresh|0)+" fps / "+Studio.draws+" draw / "+this._spikes+" spikes",2,10)}});