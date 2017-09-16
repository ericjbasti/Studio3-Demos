
Studio.UIButton = function(attr, stage, img, id){
	this.hovered = false;
	this.text = 'Button';
	if (attr) {
		this.apply(attr);
	}
	this.back = new Studio.Rect({height: this.height, width: this.width});
	this.back.color.setFromHex("#FF00FF")
	this.front = new Studio.Rect({height: this.height-4, width: this.width-4});
	this.front.color.set(0,0,0,.8);
	this.textBox = new Studio.TextBox(this.width-10, this.height, stage, textBuffer).apply({
		x: 0 , 
		y: 0 , 
		font: new Studio.Font('BigBreak', 16),
		lineHeight: 14 | 0 , 
		vertical_align: Studio.BOTTOM, 
		horizontal_align: 0.5,
		shadowColor: '#FF0080',
		slice: id
	})
	this.front.color.set(0,0,0,.8);
	this.textBox.setText(this.text).finish();
	this.addChildren(this.back,this.front,this.textBox);

	this.hoverIn_tween = stage.createTween(this, 'quadInOut', {scaleX: 1.2, scaleY: 1.2}, 300).loop(true).reflect(true);
	this.hoverOut_tween = stage.createTween(this, 'quadOut', {scaleX: 1, scaleY: 1}, 300);
}
Studio.UIButton.prototype = new Studio.DisplayObject();
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