'use strict';

// These are used to enable compatablity with older browsers.
// The canvas rendering engine will even work on an original iPhone running iOS 3.1 (13 sprites / 24 fps)
//

if (!window.console) {
	var console = {
		log: function() {},
		warn: function() {},
	}
}

if ('Float32Array' in window ) {
}else{
	console.log('no float32')
	window.Float32Array = window.Array;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	console.warn('This browser does not support Object.keys() . Using polyfill instead.')
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length

		return function(obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
			throw new TypeError('Object.keys called on non-object')
		}

		var result = [], prop, i

		for (prop in obj) {
			if (hasOwnProperty.call(obj, prop)) {
				result.push(prop)
			}
		}

		if (hasDontEnumBug) {
			for (i = 0; i < dontEnumsLength; i++) {
				if (hasOwnProperty.call(obj, dontEnums[i])) {
					result.push(dontEnums[i])
				}
			}
		}
		return result
	}
	}())
}

if (typeof Object.create !== 'function') {
	console.warn('This browser does not support Object.create() . Using polyfill instead.')
	Object.create = (function() {
		var Temp = function() {}
		return function(prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported')
			}
			if (typeof prototype !== 'object') {
				throw new TypeError('Argument must be an object')
			}
			Temp.prototype = prototype
			var result = new Temp()
			Temp.prototype = null
			return result
		}
	})()
}

(function() {
	var vendors = ['ms', 'moz', 'webkit', 'o']
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
	}
	if (!window.requestAnimationFrame) {
		console.warn('This browser does not support requestAnimationFrame() . Using setTimeout() instead.')
		window.requestAnimationFrame = function(callback) {
			var id = window.setTimeout(function() {
				callback(Date.now())
			}, 1000 / 60)
			return id
		}
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id)
		}
	}
}())


// @codekit-prepend "Studio/Requirements.js"

// @codekit-append "Studio/Components/Box.js"
// @codekit-append "Studio/Components/Color.js"
// @codekit-append "Studio/Components/DisplayProperty.js"

// @codekit-append "Studio/Components/Messenger.js"
// @codekit-append "Studio/Components/LinkedList.js"
// @codekit-append "Studio/Components/Plugin.js"
// @codekit-append "Studio/Components/Image.js"
// @codekit-append "Studio/Components/Cache.js"
// @codekit-append "Studio/Components/Ease.js"
// @codekit-append "Studio/Components/Pool.js"

// @codekit-append "Studio/DisplayObjects/DisplayObject.js"

// @codekit-append "Studio/DisplayObjects/DisplayList.js"
// @codekit-append "Studio/DisplayObjects/Rect.js"
// @codekit-append "Studio/DisplayObjects/Clip.js"
// @codekit-append "Studio/DisplayObjects/CircleClip.js"
// @codekit-append "Studio/DisplayObjects/Restore.js"
// @codekit-append "Studio/DisplayObjects/Circle.js"
// @codekit-append "Studio/DisplayObjects/Sprite.js"
// @codekit-append "Studio/DisplayObjects/Camera.js"
// @codekit-append "Studio/DisplayObjects/Scene.js"
// @codekit-append "Studio/DisplayObjects/Stage.js"
// @codekit-append "Studio/DisplayObjects/TextBox.js"
// @codekit-append "Studio/DisplayObjects/Tween.js"
// @codekit-append "Studio/DisplayObjects/Pattern.js"
// @codekit-append "Studio/DisplayObjects/TileMap.js"

// @codekit-append "Studio/Effects/Standards.js"

// @codekit-append "Studio/engines/TimeStep.js"
// @codekit-append "Studio/engines/WebGL.js"
// @codekit-append "Studio/engines/Canvas.js"

// @codekit-append "Studio/Input/Keyboard.js"
// @codekit-append "Studio/Input/Touch.js"

// @codekit-append "Studio/Components/Sound.js"
// @codekit-append "Studio/Input/Gamepad.js"
// @codekit-append "Studio/DisplayObjects/DOMElement.js"

var getWebGLContextType = function(){
	var canvas = document.createElement('canvas');
	if(canvas.getContext('webgl')){
		return 'webgl';
	}
	if(canvas.getContext('experimental-webgl')){
		return 'experimental-webgl';
	}
	return false;

}

var Studio = Studio || {
	stages: [],
	_current_stage: null,
	assets: {
		length: 0
	},
	asset_count: 0,
	queue: 0,
	progress: 0,
	active: true,
	cap: 1000 / 20, // don't let the true frame rate go below 20fps, prevent huge frame skips
	draws: 0,
	loaded: true,
	version: '0.5.1',
	now: 0, // to get around Safari not supporting performance.now() you can pull in the timestap with this property.
	delta: 0,
	time: 1,
	RAF: null,
	browser_info: {
		type: navigator.userAgent.toLowerCase(),
		webGL: getWebGLContextType(),
		iOS : (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
	},
	_temp: {}
}

Studio.updateProgress = function() {
	this.progress = this.queue / this.assets.length
}

Studio._continue = function(time_stamp){
	if (Studio.stages.length > 1) {
		Studio.RAF = requestAnimationFrame(Studio.loopAll)
	} else {
		Studio._current_stage = Studio.stages[0]
		Studio.RAF = requestAnimationFrame(Studio.loop)
	}
}


// this function starts the entire engine. It also checks to see if it will be drawing multiple stages.
// if stages.length > 1 it will loop through all the stages, otherwise it just renders the one it has.
// by doing this check we can avoid an aditional for loop, when we don't need it.
Studio.start = function(time_stamp) {
	if (Studio.queue === Studio.assets.length) {
		Studio.progress = 1
	}
	if (time_stamp) {
		Studio.now = time_stamp
		Studio.time = time_stamp
		Studio._continue()

	} else {
		Studio.RAF = requestAnimationFrame(Studio.start)
	}
}

// this function renders the _current_stage.
Studio._loop = function() {
	if (Studio._current_stage.active) {
		Studio._current_stage.loop(Studio.delta)
	}
}

Studio.loop = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0
	Studio._loop();
	Studio.RAF = requestAnimationFrame(Studio.loop)
}

Studio.loopAll = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0
	for (var m = 0; m !== Studio.stages.length; m++) {
		Studio._current_stage = Studio.stages[m]
		Studio._loop()
	}
	Studio.RAF = requestAnimationFrame(Studio.loopAll)
}

Studio._tick = {
	console: function(time_stamp) { // slows down, when the processor can't handle it.
		this.delta = 16.6666666
		this.now += this.delta
	},
	capped: function(time_stamp) { // never lets us skip too many frames
		this.delta = time_stamp - this.now
		this.now = time_stamp
		this.delta = this.cap > this.delta ? this.delta : this.cap
	},
	uncapped: function(time_stamp) {
		this.delta = time_stamp - this.now
		this.now = time_stamp
	}
}

Studio.tick = Studio._tick.capped

Studio._addingAsset = function() {
	this.assets.length++
	this.updateProgress()
}
Studio._loadedAsset = function() {
	this.queue++
	this.updateProgress()
	this.asset_count++
}
Studio.handleVisibilityChange = function() {
	if (document.hidden) {
		console.log('%cStudio Paused (visibilitychange)', Studio.statStyle)
		cancelAnimationFrame(Studio.RAF)
	} else {
		console.log('%cStudio Play (visibilitychange)', Studio.statStyle)
		Studio.RAF = requestAnimationFrame(Studio._continue)
	}
}

document.addEventListener('visibilitychange', Studio.handleVisibilityChange, false)

Studio.z_index = function(a, b) {
	if (a.z < b.z) {
		return -1
	}
	if (a.z > b.z) {
		return 1
	}
	return 0
}

Studio.round = function(x) {
	return x + 0.5 | 0
}

// apply(obj:Object)
// this will modify or add the current object to contain the contents of the object (obj) being passed in.

Studio.apply = function(obj) { // Display Object and a few others share this function. All children of displayObject inherit this function.
	Studio._temp.keys = Object.keys(obj) // we use Studio._temp.keys to avoid creating more garbage.
	Studio._temp.keys_i = Studio._temp.keys.length
	while (Studio._temp.keys_i) {

		if (Studio._temp.key === 'color_hex' && this['color']) {
			this['color'].setFromHex(obj[Studio._temp.key])
		}
		Studio._temp.key = Studio._temp.keys[Studio._temp.keys_i - 1]
		this[Studio._temp.key] = obj[Studio._temp.key]
		Studio._temp.keys_i--
	}
	return this
}

// addTo()

Studio.addTo = function(a) {
	for (var i = 1; i < arguments.length; i++){
		var b = arguments[i]
		for (var attr in b) {
			if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
				a[attr] = b[attr]
			}
		}
	}
	return a
}

// Studio.inherit(a,b)
// A : the New Class
// B : Class to inherit attributes from.

Studio.inherit = function(A, B, properties) {
	if (properties) {
		A.prototype = new B(properties)
	} else {
		A.prototype = new B()
	}
	A.prototype.constructor = A
}

Studio.windowResize = function(){
	for (var m = 0; m !== Studio.stages.length; m++) {
		if(Studio.stages[m].resize){
			Studio.stages[m].resize();
		}
	}
}

window.addEventListener('resize', Studio.windowResize);

Studio.TOP = Studio.LEFT = 0
Studio.MIDDLE = Studio.CENTER = 0.5
Studio.BOTTOM = Studio.RIGHT = 1

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff'
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;'
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;'
Studio.statStyle = 'background-color: #eee; padding: 2px 4px; color: #555; font-size: 10px'
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af'



Studio.Point = function(x,y){
	this.x = x || 0
	this.y = y || 0
	this.temp = 0
	return this
}

Studio.Point.prototype = {
	constructor: Studio.Point,
	translate : function(x,y){
		this.x += x
		this.y += y
	},
	scale : function(x,y){
		this.x *= x
		this.y *= y
	},
	rotate : function(sin,cos){
		this.temp = (this.x * cos) - (this.y * sin)
		this.y = (this.x * sin) + (this.y * cos)
		this.x = this.temp;
	},
	set : function(x,y){
		this.x = x
		this.y = y
	}
}

Studio.Box = function(left, top, width, height) {
	this.TL = new Studio.Point(left, top)
	this.TR = new Studio.Point(left + width, top)
	this.BR = new Studio.Point(left, top + height)
	this.BL = new Studio.Point(left + width, top + height)

	this.left = 0
	this.right = 0
	this.top = 0
	this.bottom = 0
	this.sin = 0
	this.cos = 0
	return this
}

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.TL.set(left, top)
		this.TR.set(left + width, top)
		this.BL.set(left, top + height)
		this.BR.set(left + width, top)
	},
	get_bounds: function(who) {
		if (who._world.rotation) {
			if(who.skews){
				this.get_rotated_bounds_w_skew(who)
			}else{
				this.get_rotated_bounds(who)
			}
		} else {
			this.get_straight_bounds(who)
		}
	},
	get_straight_bounds: function(who) {
		this.TL.set(who._dx - who._world.width * who.anchorX, who._dy - who._world.height * who.anchorY)
		this.TR.set(this.TL.x + who._world.width, this.TL.y)
		this.BR.set(this.TR.x, this.TR.y + who._world.height)
		this.BL.set(this.TL.x, this.BR.y)

	},
	_shift : function(x,y){
		this.TL.translate(x,y)
		this.TR.translate(x,y)
		this.BR.translate(x,y)
		this.BL.translate(x,y)
	},
	_scale : function(x,y){
		this.TL.scale(x,y)
		this.TR.scale(x,y)
		this.BR.scale(x,y)
		this.BL.scale(x,y)
	},
	_set_orbit_xy : function(sin,cos){
		this.TL.x = ((this.left * cos) - (this.top * sin))
		this.TL.y = ((this.left * sin) + (this.top * cos))
		this.TR.x = ((this.right * cos) - (this.top * sin))
		this.TR.y = ((this.right * sin) + (this.top * cos))
		this.BR.x = ((this.right * cos) - (this.bottom * sin))
		this.BR.y = ((this.right * sin) + (this.bottom * cos))
		this.BL.x = ((this.left * cos) - (this.bottom * sin))
		this.BL.y = ((this.left * sin) + (this.bottom * cos))
	},
	_set_bounds : function( a, b , width, height){
		this.left 	= -a
		this.right 	= this.left + width
		this.top 	= -b
		this.bottom = this.top + height
	},
	get_rotated_bounds_w_skew: function(who) {
		this.sin = Math.sin(who._dAngle)
		this.cos = Math.cos(who._dAngle)

		this._set_bounds(who.width * who.anchorX, who.height * who.anchorY, who.width, who.height)
		this._set_orbit_xy(this.sin,this.cos);
		this._scale(who._world.scaleX,who._world.scaleY)
		this._shift(who._dx, who._dy)
	},
	get_rotated_bounds: function(who) {
		this.sin = Math.sin(who._dAngle)
		this.cos = Math.cos(who._dAngle)

		this._set_bounds(who._world.width * who.anchorX, who._world.height * who.anchorY, who._world.width, who._world.height)
		this._set_orbit_xy(this.sin,this.cos);
		this._shift(who._dx, who._dy)
	},
}

Studio.RECT_BOX = new Studio.Box(10,0,0,0);

Studio.Color = function(r, g, b, a) {
	this.r = r / 255 || 0
	this.g = g / 255 || 0
	this.b = b / 255 || 0
	this.a = a || 1
	this.style = 'rgba(255,255,255,1)'

	this._build_style()
	return this
}

Studio.Color.prototype = {
	constructor: Studio.Color,
	set: function(r, g, b, a) {
		this.r = r / 255
		this.g = g / 255
		this.b = b / 255
		this.a = a
		this._build_style()
		return this
	},
	red: function(v) {
		this.r = v
		return this
	},
	green: function(v) {
		this.g = v
		return this
	},
	blue: function(v) {
		this.b = v
		return this
	},
	alpha: function(v) {
		this.a = v
		return this
	},
	build: function() {
		this._build_style()
		return this
	},
	setFromHex: function(hex) {
		if (!hex) return
		// if the hex value comes in as shorthand '#333', we should double the values.
		if (hex.length === 4) {
			hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + 'ff'
		}
		// if the hex doesn't contain an alpha value lets assume its 'ff'.
		if (hex.length === 7) {
			hex += 'ff'
		}
		// take each value besides [0] an convert it to RGBA since that works for both Canvas and WebGL
		this.set('0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0, ('0x' + hex[7] + hex[8] | 0) / 255)
		return this
	},
	_build_style: function() {
		this.style = 'rgba(' + parseInt(this.r * 255) + ',' + parseInt(this.g * 255) + ',' + parseInt(this.b * 255) + ',' + this.a + ')'
	},
	dirty: false
}



Studio.RED = new Studio.Color(204, 0, 17, 1)
Studio.ORANGE = new Studio.Color(255, 150, 0)
Studio.YELLOW = new Studio.Color(255, 221, 34, 1)
Studio.GREEN = new Studio.Color(0, 200, 0, 1)
Studio.BLUE = new Studio.Color(51, 170, 255, 1)
Studio.PURPLE = new Studio.Color(128, 0, 255, 1)
Studio.WHITE = new Studio.Color(255, 255, 255, 1)
Studio.BLACK = new Studio.Color(0, 0, 0, 1)
Studio.TRANSPARENT = Studio.TRANS = new Studio.Color(0, 0, 0, 0)


/**
 * DisplayProperty
 */

Studio.DisplayProperty = function() {
	this.x        = 0
	this.y        = 0
	this.z        = 0
	this.height   = 1
	this.width    = 1
	this.scaleX   = 1
	this.scaleY   = 1
	this.rotation = 0
	this.angle 	  = 0
	this.alpha 	  = 1
	this.speed 	  = 1
}

Studio.DisplayProperty.prototype = {
	constructor: Studio.DisplayProperty,
	apply: Studio.apply
}


Studio.Messenger = function() {
	this.listeners = {}
	this.message = 0
}
Studio.Messenger.constructor = Studio.Messenger;
Studio.Messenger.prototype.addListener = function(type,callback) {
	if(!this.listeners[type]){
		this.listeners[type]=[];
	}
	this.listeners[type].push({callback: callback})
}

Studio.Messenger.prototype.addListenerTo = function(type,callback, who) {

	if(!this.listeners[type]){
		this.listeners[type]=[];
	}
	
	this.listeners[type].push({callback: callback,who: who})
}

Studio.Messenger.prototype.sendMessage = function(type, message) {
	this.message = message
	// now lets tell everyone that listens.
	
	var who = null

	if(!this.listeners[type]){
		return
	}

	for (var i = 0; i < this.listeners[type].length; i++) {
		who = this.listeners[type][i].who
		if (who) {
			who[this.listeners[type][i].callback].call(who,this.message,type)
		} else {
			this.listeners[type][i].callback(this.message,type)
		}
	}
}

var LinkedList = function() {
	this.first 	= 	null
	this.last	= 	null
	this.length = 	0
}

LinkedList.prototype = {
	add: function(who) {
		// who._parent = this._parent;

		this.length++ // add to our length so we can easily tell how big our list is.
		if (this.length <= 1 && this.first === null && this.last === null) {
			this.first = who
			this.last = who
			who.prev = null
			this.length = 1
			return who
		}
		// this.first.prev = who;
		this.last.next = who // we add the new item to the previously last item.
		who.prev = this.last // we mark the new items previous to be the last item in the list.
		this.last = who // we have a new last item now.
		return who
	},
	addItems: function(who) {
		for (var i = 0; i !== arguments.length; i++) {
			this.add(arguments[i])
		}
	},
	insert: function(a, b) {
		this.length++
		a.prev = b
		if (b !== this.last) {
			b.next = a
		} else {
			this.last = a
			a.next = this.first
		}
	},
	init: function() {
		this.next	=	null
		this.prev	=	null
		this.first 	= 	null
		this.last	= 	null
		this.length = 	0
	},
	remove: function(who) {
		if (this.length === 1) {
			this.init()
			who.next = null
			who.prev = null
			return // nothing to see here lets move on.
		}
		// check for the begining or the end of the list
		if (this.first === who) {
			this.first = this.first.next
		} else if (this.last === who) {
			this.last = this.last.prev
		}

		// debugger;
		if (who.prev) {
			who.prev.next = who.next
		}
		if (who.next) {
			who.next.prev = who.prev
		}

		who.next = null
		who.prev = null

		if (this.first === null) {
			this.last = null
		}
		this.length--
	},
	update: function(r, d) {
		var listItem = this.first
		while (listItem) {
			// while we still have a list item lets do some fun stuff.

			this.next = listItem.next
			// we need to hold on to the next in line.
			// WHY: I've been known to delete an object in the list
			// thus causing listItem.next to return null.
			// By saving this reference we can always continue on
			// through the list.

			listItem.update(r, d)
			// lets perform the objects update function.

			listItem = listItem.next || this.next
			// if the item has a next lets use it. otherwise lets use the one we saved
			// just for this occassion. If both are null thats fine to.
			// we really are at the end of the list.
		}
	},
	render: function(e, f) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			listItem._delta(f)
			listItem.render(e, f)
			listItem = listItem.next || this.next
		}
	},
	action: function(what) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			listItem[what]()
			listItem = listItem.next || this.next
		}
	},
	removeAll: function(exception) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			if (this.pdispose) {
				this.pdispose()
			}
			this.remove(listItem)
			listItem = listItem.next || this.next
		}
		listItem = null
		if (exception) {
			this.add(exception)
		}
	},
	toString: function() {
		var listItem = this.first
		var toString = 'linked list : ['
		while (listItem) {
			toString += listItem
			listItem = listItem.next
		}
		toString += '];'
	},
	constructor: LinkedList
}


Studio.Plugin = function(attr) {
	this.init = null
	this.options = {}
	this.action = null

	this.apply(attr)
}

Studio.Plugin.constructor = Studio.Plugin

Studio.Plugin.prototype.apply = Studio.apply

Studio.Plugin.prototype._options = function(a) {
	for (var i in a) {
		this.options[i] = a[i]
	}
}


Studio.Image = function studio_image(path, slices) {
	this.path = path + '_'+ parseInt(Math.random()*100000).toString(16)
	this.bitmap = null
	this.width = 1
	this.height = 1

	this.slice = {
		'Full': {
			x: 0,
			y: 0,
			width: 1,
			height: 1
		}
	}

	this.sliceGL = {}

	// this.status = new Studio.Messenger()
	if (slices) {
		this.addSlice(slices)
	}

	if (path) {
		this.loadImage(path)
	}
	return this
}

Studio.inherit(Studio.Image,Studio.Messenger)

Studio.Image.prototype.ready = false
Studio.Image.prototype.height = 1
Studio.Image.prototype.width = 1

Studio.Image.prototype._onImageLoad = function image_onload(image) { // could have Event passed in
	Studio.progress = Studio.queue / Studio.assets.length
	Studio._loadedAsset();
	this._setWidthHeights(image)
	return image
}
Studio.Image.prototype._setWidthHeights = function(image){
	this.slice['Full'].height = image.height
	this.slice['Full'].width = image.width
	this.width = image.width
	this.height = image.height
	this.addSlice(this.slice)
	this.ready = true
	this.sendMessage('ready',this.ready)
}

Studio.Image.prototype.loadImage = function studio_image_loadImage(who) {
	var image = this;
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who])
		this.bitmap = Studio.assets[who]
		if(Studio.assets.width){
			this.ready = true
			this.sendMessage('ready',this.ready)
		}else{
			Studio.assets[who].addEventListener("load", function(e){
				image._setWidthHeights(e.target)
			} )
		}
		return this
	} else {
		Studio.assets[who] = new Image()
		Studio._addingAsset();
		Studio.assets[who].addEventListener("load", function(e){
			image._onImageLoad(e.target)
		} )
		
		Studio.assets[who].src = who
		this.bitmap = Studio.assets[who]
	}
}
Studio.Image.prototype.buildSliceForGL = function studio_buildSliceForGL(slice) {
	var x = slice.x / this.width
	var y = slice.y / this.height
	return {
		x: x,
		y: y,
		width: slice.width / this.width + x,
		height: slice.height / this.height + y
	}
}

Studio.Image.prototype.addSlice = function studio_image_addSlice(slices) {
	for (var i in slices) {
		this.slice[i] = slices[i]
		this.sliceGL[i] = this.buildSliceForGL(slices[i])
	}
}

Studio.Image.prototype._rebuildGLSlices = function(){
	for (var i in this.slice) {
		this.sliceGL[i] = this.buildSliceForGL(this.slice[i])
	}
}


Studio.Cache = function(width, height, resolution) {
	this.resolution = resolution || 1
	this.path = 'cache_' + parseInt(Math.random()*100000).toString(16)
	this.bitmap = document.createElement('canvas')
	this.bitmap.width = width * this.resolution || 512
	this.bitmap.height = height * this.resolution || 512
	this.width = width
	this.height = height
	this.ready = false
	this.ctx = this.bitmap.getContext('2d')
	this.ctx.scale(resolution, resolution)
	this.slice.Full = {x: 0,y: 0,width: this.bitmap.width,height: this.bitmap.height}
	this.sliceGL.Full = {x:0,y:0,width:1, height: 1}

	if(Studio.DEBUG){
		document.body.appendChild(this.bitmap)
	}
}

Studio.inherit(Studio.Cache, Studio.Image)


Studio.Cache.prototype.applyEffect = function(effect){
	effect.action(this)
}

Studio.Ease = {}

Studio.Ease.linear = function(t) {
	return t
}

Studio.Ease.snap = function(t) {
	return t + 0.5 | 0
}

Studio.Ease.chillInOut = function(t) {
	var s = 0.75
	if ((t *= 2) < 1) {
		return 0.5 * (t * t * ((s + 1) * t - s))
	}
	return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2)
}

Studio.Ease.backOut = function(t) {
	var s = 1.70158
	return --t * t * ((s + 1) * t + s) + 1
}

Studio.Ease.bounceOut = function(t) {
	if (t < (0.363636)) {
		return 7.5625 * t * t
	} else if (t < 0.727272) {
		return 7.5625 * (t -= (0.545454)) * t + 0.75
	} else if (t < 0.909090) {
		return 7.5625 * (t -= (0.818181)) * t + 0.9375
	} else {
		return 7.5625 * (t -= (0.959595)) * t + 0.984375
	}
}

Studio.Ease.elasticOut = function(t) {
	var s, a = 0.1, p = 0.4
	if (t === 0) {
		return 0
	}
	if (t === 1) {
		return 1
	}
	if (!a || a < 1) {
		a = 1; s = p / 4
	} else {
		s = p * Math.asin(1 / a) / (6.283)
	}
	return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (6.283) / p) + 1)
}

Studio.Ease.linearRandom = function(t) {
	return Math.random() * t
}

Studio.Ease.random = function() {
	return Math.random()
}

Studio.Ease.shake = function() {
	return Math.random() - .5
}

Studio.Ease.quadIn = function(t) {
	return t * t
}

Studio.Ease.quadOut = function(t) {
	return t * (2 - t)
}

Studio.Ease.quadInOut = function(t) {
	if ((t *= 2) < 1) {
		return 0.5 * t * t
	}
	return -0.5 * (--t * (t - 2) - 1)
}


// A really simply pooling stystem.
// Opt-in
// to create a pool run: Studio.createPool (Object_Type, Initial_Size )
// to retreive from the pool run: Object_Type.fromPool()
// which will return an Object_Type from the pool if one is avalible, otherwise it will create a new one, and increase the size of the pool
// to send an item back into the pool. Just run .intoPool on the object. It will put it back into the Object_Type's pool.
//
// the pool and poolSize are private variables, however you can get access to the pool with a couple helper functions.
// Object_Type.getPoolCapacity() will return the .length of the pool array.
// Object_Type.getPool() will return the pool array itself, helpful for debugging.
// Object_Type.isPoolEmpty() will return true is the poolSize === 0. This can be helpful if you want to limit size of the pool.
//
// 		if(!Object_Type.isPoolEmpty){
//			... pull from the pool ...
//		}else{
//			... lets leave the pool alone ...
//		}
//

Studio.createPool = function(who, size) {
	var pool = []
	var poolSize = size || 0

	// we double check to make sure the constructor is set to ourself
	if (who.constructor != who) {
		who.constructor = who
	}

	for (var i = 0; i != poolSize; i++) {
		pool[i] = new who()
		if (pool[i].init) {
			pool[i].init()
		}
	}

	who.fromPool = function(properties) {
		var poolObject = pool[--poolSize]
		if (!poolObject) {
			poolObject = new who()
			poolSize++
		}
		pool[poolSize] = null
		if (properties) {
			poolObject.apply(properties)
		}
		return poolObject
	}

	who.prototype.intoPool = function() {
		pool[poolSize] = this
		poolSize++
	}
	who.getPoolCapacity = function() {
		return pool.length
	}
	who.getPool = function() {
		return pool
	}
	who.isPoolEmpty = function() {
		return poolSize === 0
	}
}

/**
 * DisplayObject
 * The base for all visual objects in the studio.
 */

Studio.DisplayObject = function(attr) {
	// Dimensional Settings:
	this.x        = 0
	this.y        = 0
	this.z        = 0
	this.height   = 1
	this.width    = 1
	this.scaleX   = 1
	this.scaleY   = 1
	this.anchorX  = 0.5
	this.anchorY  = 0.5
	this.rotation = 0
	this.skews 	  = 0
	// Display Settings:
	this.alpha   = 1 // sets the opacity/alpha of an object
	this.visible = 1 // invisible items are ignored when rendering
	this.speed   = 1 // the local speed of an object
	this.active  = 1 // set as inactive, and we never try to render
	// or update this or its children. Use this to
	// manually pool objects

	// Rotation Settings:
	this.orbits = true
	this.orbit = 0
	this.inheritRotation = true
	this.inheritScale = true
	this.orbitSpeed = 1

	// set attributes if provided.
	if (attr) {
		this.apply(attr)
	}
	this._boundingBox = new Studio.Box()
	//this._alpha = this.alpha;
	//this._visible = this.alpha * this.visible; // if either value = 0 we wont draw it to the screen... save some cycles.
	// Children Information
	// to save memory we don't include a default child container. This will be
	// created if one is need.
	this._parent = null
	this._hasChildren = 0 
	// we use this as a quick flag to let us know if we
	// should even think about looking for children
	// objects. It also stores our length.

	// set any of these to false if you know they will never be needed.
	// this will increase performace, by reducing calculations done per object per frame.

	// for interpolating fixed time steps
	this.__x = this._world.x
	this.__y = this._world.y
	this._dx = this._world.x
	this._dy = this._world.y
}

Studio.difference = {}

Studio.DisplayObject.prototype = {
	constructor: Studio.DisplayObject,
	_world: new Studio.DisplayProperty(),
	blendmode: 'source-over',
	// apply takes an object
	apply: Studio.apply,
	__update_XY: true,
	__update_SCALE: true,
	__update_DIMENSIONS: true,
	__update_SPEED: true,
	__update_ALPHA: true,
	__update_ROTATION: true,
	addChild: function(child) {
		// Adds a child to this object
		if (!this.hasOwnProperty('children')) {
			this.children = [] // if we didn't use 'hasOwnProperty', we would learn that JS treats [] like pointers and in this particular case will cause a crash.
		}
		if (!this.hasOwnProperty('_world')) {
			this._world = new Studio.DisplayProperty()
			this._initWorld()
		}
		if (!child.hasOwnProperty('_world')) {
			// This child is missing _world = new Studio.DisplayProperty(); the code will still run, but it is very likely to act in unexpected ways. Lets fix this.
			child._world = new Studio.DisplayProperty()
		}
		child._parent = this._world
		child._parent_box = this._boundingBox
		this.children[this._hasChildren] = child
		this._hasChildren++
		// child.z = child._world.z = -this._hasChildren*.000001;
		child.force_update()
		child._dset()
		// if(this.constructor == Studio.Stage){

		// }else{
		// 	child._world.z = (this.z*.000001)-(child.z*.000001)
		// }
		
		if (child._hasChildren) {
			child.force_update_children()
		}

		return this
	},
	removeChildAtIndex: function(child_index) {
		var length = this.children.length - 1
		for (var i = child_index; i < length; i++) {
			this.children[i] = this.children[i + 1]
		}
		this.children.length = length
		this._hasChildren = length
	},
	removeChild: function(child) {
		var length = this.children.length - 1
		for (var i = 0; i <= length; i++) {
			if (this.children[i] == child) {
				this.removeChildAtIndex(i)
				return
			}
		}
		console.log('child not found.')
	},
	_initWorld: function() {
		this._world.x = this.x
		this._world.y = this.y
		this._world.y = this.y
		this._world.z = this.z
		this._world.height = this.height
		this._world.width = this.width
		this._world.scaleX = this.scaleX
		this._world.scaleY = this.scaleY
		this._world.rotation = this.rotation
		this._world.angle = this.angle
		this._world.alpha = this.alpha
		this._world.speed = this.speed
	},
	addChildren: function() {
		// This will take a series of objects and add them to this object
		// as children. We simply call the addChild function multiple times.
		for (var i = 0; i !== arguments.length; i++) {
			this.addChild(arguments[i])
		}
		return this
	},
	getChildByName: function(name) {
		// this will look for a named object and return it. If your using
		// names (names are not required).
		for (var i = 0; i !== this._hasChildren; i++) {
			if (this.children[i].name === name) {
				return this.children[i]
			}
		}
		return null
	},
	_destroy: function() {
		for (var i in this) {
			if (!this.hasOwnProperty(i)) {
				delete this[i]
			}
		}
	},
	_order: function() {
		this.children.sort(Studio.z_index)
	},
	draw: function() {
	},
	snapPixels: function() {
		this._dx = this._dx + 0 | 0
		this._dy = this._dy + 0 | 0
		this._world.height = this._world.height + 0 | 0
		this._world.width = this._world.width + 0 | 0
	},
	hitTestPoint: function(x, y) {
		this._relativeX = x - this._world.x
		this._relativeY = y - this._world.y
		this.anchoredX = this.anchorX * this._world.width
		this.anchoredY = this.anchorY * this._world.height
		if (this._relativeX < -this.anchoredX && this._relativeY < -this.anchoredY) {
			return false
		}
		if (this._relativeX > this.width && this._relativeY > this.height) {
			return false
		}
		if (this._world.rotation) {
			x = (this._relativeX * Math.cos(-this.angle)) - (this._relativeY * Math.sin(-this.angle))
			y = (this._relativeX * Math.sin(-this.angle)) + (this._relativeY * Math.cos(-this.angle))
			this._relativeX = x
			this._relativeY = y
		}

		if ((this._relativeX > -this.anchoredX && this._relativeY > -this.anchoredY) && (this._relativeX < (this._world.width) - this.anchoredX && this._relativeY < (this._world.height) - this.anchoredY)) {
			return true
		}
		return false
	},
	hitTestRect: function(b) {
		Studio.difference.height = this._world.height + b._world.height
		Studio.difference.width = this._world.width + b._world.width
		Studio.difference.x = this._world.x - (this._world.width * this.anchorX) - b._world.x - (b._world.width * b.anchorX)
		Studio.difference.y = this._world.y - (this._world.height * this.anchorY) - b._world.y - (b._world.height * b.anchorY)

		// stage.ctx.strokeRect(Studio.difference.x,Studio.difference.y,Studio.difference.width,Studio.difference.height)

		if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
			return true
		}
		return false
	},
	vertex_children: function(stage, ratio, interpolate) {
		if (this._hasChildren) {
			for (var i = 0; i < this._hasChildren; i++) {
				if(!this.children[i].buildElement){
					console.log('no build', this.children[i])
					return
				}else{
					this.children[i].buildElement(stage, ratio, interpolate)
					if(this.children[i]) {
						this.children[i].vertex_children(stage, ratio, interpolate)
					}
				}
			}
		}
	},
	buildElement : function(stage, ratio, interpolate) {
		
	},
	render_children: function(stage, ratio, interpolate) {
		if (this._hasChildren) {
			for (var i = 0; i < this._hasChildren; i++) {
				this.children[i].render(stage, ratio, interpolate)
			}
		}
	},
	render: function(stage, ratio, interpolate) {
		if (this._visible) {
			// Studio.objectDraw++;
			// if((this._x + (this._width*this.anchorX) >= 0) ||
			// 	(this._x - (this._width*this.anchorX) <= stage.width) ||
			// 	(this._y + (this._height*this.anchorY) >= 0) ||
			// 	(this._y - (this._height*this.anchorY) <= stage.height)
			// 	){
			if (interpolate) {
				this._delta(ratio)
			} else {
				this._dset()
			}
			if (stage.snap) {
				this.snapPixels()
			}
			this.draw(stage.ctx)
			// }
			this.render_children(stage, ratio, interpolate)
		}
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	update_visibility: function() {
		this._world.alpha = this.alpha * this._parent.alpha
		//if(this._alpha > 0){
		this._visible = this._world.alpha * this.visible
		// }else{
		// 	this._visible = false;
		// }

	},
	setAlpha: function(ctx) {
		if (this._world.alpha !== ctx.globalAlpha && this._visible) {
			ctx.globalAlpha = this._world.alpha
		}
		if (this.blendmode !== ctx.globalCompositeOperation && this._visible) {
			ctx.globalCompositeOperation = this.blendmode
		}
	},
	update_scale: function() {
		if (this.inheritScale) {
			this._world.scaleX  = this._parent.scaleX * this.scaleX
			this._world.scaleY  = this._parent.scaleY * this.scaleY
		}else{
			this._world.scaleX  = this.scaleX
			this._world.scaleY  = this.scaleY
		}
	},
	update_dimensions: function() {
		this._world.width = this.width * this._world.scaleX
		this._world.height = this.height * this._world.scaleY
	},
	update_angle: function() {
		this.angle = (this._world.rotation / 180 * 3.14159265)
	},
	update_speed: function() {
		this._world.speed = this.speed * this._parent.speed
	},
	orbitXY: function() {
		var x = this.x * this._world.scaleX
		var y = this.y * this._world.scaleY
		var sin = Math.sin((this._parent.angle + this.orbit) * this.orbitSpeed)
		var cos = Math.cos((this._parent.angle + this.orbit) * this.orbitSpeed)
		this._orbitX = (x * cos) - (y * sin)
		this._orbitY = (x * sin) + (y * cos)
	},
	update_rotation: function() {
		if (this.inheritRotation) {
			this._world.rotation = this._parent.rotation + this.rotation
		} else {
			this._world.rotation = this.rotation
		}
		if (this._world.rotation) {
			this.update_angle()
		} else {
			this.angle = 0
		}
	},
	update_orbit_xy: function() {
		this.orbitXY()
		this._world.x = this._orbitX + this._parent.x
		this._world.y = this._orbitY + this._parent.y
	},
	update_xy: function() {
		if (this.orbits && this._parent.angle) {
			this.update_orbit_xy()
		} else {
			this._world.x  = (this.x * this._parent.scaleX) + this._parent.x
			this._world.y  = (this.y * this._parent.scaleY) + this._parent.y
		}
	},
	snapshot: function() {
		this.__x = this._world.x
		this.__y = this._world.y
		if (this.__update_DIMENSIONS) {
			this.__width = this._world.width
			this.__height = this._world.height
		}
		if (this._world.rotation) {
			this._world.angle = this.angle
		}
	},
	__deltaXY: function(ratio) {
		if (this.__update_XY) {
			this._dx = this.__delta(this.__x, this._world.x, ratio)
			this._dy = this.__delta(this.__y, this._world.y, ratio)
		}
	},
	__deltaHW: function(ratio) {
		if (this.__update_DIMENSIONS) {
			this._dwidth = this.__delta(this.__width, this._world.width, ratio)
			this._dheight = this.__delta(this.__height, this._world.height, ratio)
		}
	},
	__deltaRotation: function(ratio) {
		if (this._world.rotation) {
			this._dAngle = this.__delta(this._world.angle, this.angle, ratio)
		}
	},
	__delta: function(snap, cur, ratio) {
		return snap + ((cur - snap) * ratio)
	},
	_delta: function(ratio) {
		this.__deltaXY(ratio)
		this.__deltaHW(ratio)
		this.__deltaRotation(ratio)
	},
	__dsetXY: function() {
		if (this.__update_XY) {
			this._dx = this._world.x
			this._dy = this._world.y
		}
	},
	__dsetHW: function() {
		this._dwidth = this._world.width
		this._dheight = this._world.height
	},
	__dsetRotation: function() {
		if (this._world.rotation) {
			// this._dAngle = this._parent.angle + this.angle
			this._dAngle = this._world.angle + this.angle
			// console.log(this._parent.angle )
		}
	},
	_dset: function() {
		this.__dsetXY()
		this.__dsetHW()
		this.__dsetRotation()
	},
	_snapback: function() {
		this.force_update()
	},
	force_update: function() {
		this.update_visibility()
		this.update_scale()
		this.update_speed()
		this.update_dimensions()
		this.update_rotation()
		this.update_xy()
		this.snapshot()
	},
	force_update_children: function(interpolate) {
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i].force_update()
		}
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i]._dset()
		}
	},
	_update: function(interpolate) {
		if (this.__update_ALPHA) {
			this.update_visibility()
		}
		if (this._visible) {
			if (this.__update_SCALE) {
				this.update_scale()
			}
			if (this.__update_SPEED) {
				this.update_speed()
			}
			if (this.__update_DIMENSIONS) {
				this.update_dimensions()
			}
			if (this.__update_ROTATION) {
				this.update_rotation()
			}
			if (this.__update_XY) {
				this.update_xy()
			}
			this.update_children(interpolate)
		}
	},
	update_children: function(interpolate) {
		if (!this._hasChildren) {
			return
		}
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i].update(interpolate)
		}
	},
	_logic: function() {
		if (this.logic) {
			this.logic()
		}

		if (this.onEnterFrame) {
			this.onEnterFrame()
		}
	},
	setAnchor: function(x, y) {
		this.anchorX = x
		this.anchorY = y || x
	},
	update: function(interpolate) {
		if (interpolate) {
			this.snapshot()
		}
		this._logic()
		this._update(interpolate)
	}
}


Studio.DisplayList = function(attr) {
	this.cache = null;
	this.ctx = null;
	this.cached = false;
	this.first 	= null;
	this.last	= null;
	this.length = 0;
	this.marked = [];
	this.autoCache = true;
	if (attr) {
		this.apply(attr);
	}
};

Studio.inherit(Studio.DisplayList, Studio.DisplayObject);


Studio.DisplayList.prototype.cacheAsBitmap = function(stage) {
	this.cache = document.createElement('canvas');
	this.cache.height = this.height * stage.resolution;
	this.cache.width = this.width * stage.resolution;
	this.ctx = this.cache.getContext('2d');
	this.ctx.scale(stage.resolution, stage.resolution);
	// document.body.appendChild(this.cache);
};

Studio.DisplayList.prototype.updateCache = function() {
	this.cached = false;
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.render(this, 1);
	this.cached = true;
};
Studio.DisplayList.prototype._cacheIt = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.render(this, 1);
};
Studio.DisplayList.prototype.updateElement = function(who) {
	who.render(this);
};

Studio.DisplayList.prototype.clearCachedElement = function(who) {
	this.ctx.clearRect(who._world.x - who.width / 2, who._world.y - who.height / 2, who.width, who.height);
};

Studio.DisplayList.prototype.markedForRemoval = function(who) {
	this.marked[this.marked.length] = who;
	// this.marked.length++;
};

Studio.DisplayList.prototype.removeMarked = function() {
	for (var i = 0; i !== this.marked.length; i++) {
		if (this.marked[i]) {
			this.clearCachedElement(this.marked[i]);
		}
		this.marked[i] = null;
	}
	this.marked.lengh = 0;
};

Studio.DisplayList.prototype.deactivateCache = function() {
	this.cached = false;
};

Studio.DisplayList.prototype.update = function() {
	if (this.marked.length) {
		this.removeMarked();
	}
	//if(this.cache){
	this.update_visibility();
	this.update_scale();
	this.update_dimensions();
	this.update_xy();
	this.update_speed();
	//}
	var listItem = this.first;
	while (listItem) {
		this.next = listItem.next;
		listItem.update();
		listItem = listItem.next || this.next;
	}
	if (!this.cached && this.autoCache && this.ctx) {
		this.updateCache();
	}
};

Studio.DisplayList.prototype.render = function(stage, ratio) {
	if (this.cached) {
		if (this._world.alpha !== stage.ctx.globalAlpha) {
			stage.ctx.globalAlpha = this._world.alpha;
		}
		this.draw(stage.ctx);
	} else {

		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem._delta(ratio);
			listItem.render(stage, ratio);
			listItem = listItem.next || this.next;
		}
	}
};

Studio.DisplayList.prototype.add = function(who) {
	who._parent = this;

	this.length++; // add to our length so we can easily tell how big our list is.
	if (this.length <= 1 && this.first === null && this.last === null) {
		this.first = who;
		this.last = who;
		who.prev = null;
		this.length = 1;
		return who;
	}
	this.last.next = who; // we add the new item to the previously last item.
	who.prev = this.last; // we mark the new items previous to be the last item in the list.
	this.last = who; // we have a new last item now.
	return who;
};

Studio.DisplayList.prototype.draw = function(ctx) {
	ctx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, this._world.x, this._world.y, this._world.width, this._world.height);
};

Studio.addTo(Studio.DisplayList.prototype, LinkedList.prototype);



/**
 * Rect
 */

Studio.Rect = function(attr) {
	this.color = new Studio.Color(255, 255, 255, 1)
	// this.subBuffer = new Float32Array(8)
	this.dirty = 0;
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Rect, Studio.DisplayObject)


Studio.DefaultImage = new Studio.Cache(1,1,1)
Studio.DefaultImage.ctx.fillStyle = '#fff';
Studio.DefaultImage.ctx.fillRect(0,0,1,1)

Studio.BufferGL = function(image,size,stage){
	this.bytes = 36;
	this.size = size || stage._maxCount;
	this.data = new Float32Array(this.size * this.bytes)
	this.count = 0
	this.texture = image || Studio.DefaultImage;
}
Studio.BufferGL.prototype.constructor = Studio.BufferGL

Studio.BufferGL.prototype.draw = function(gl){
	if(!this.count){
		return;
	}
	if(!this._texture && this.texture){
		this.setTexture(gl, 1)
	}
	if(this.texture){
		gl.bindTexture(gl.TEXTURE_2D, this._texture)
		if(this.texture.dirty){
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.bitmap);
			this.texture.dirty = false
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW)
	gl.drawElements(gl.TRIANGLES, this.count/6, gl.UNSIGNED_SHORT, 0)
	this.count = 0
}

Studio.BufferGL.prototype.prepTexture = function GL_prepTexture(gl) {
	this._texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, this._texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)


	this.buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
	gl.vertexAttribPointer(gl.positionLocation, 3, gl.FLOAT, gl.FALSE, this.bytes, 0)
	gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, gl.FALSE, this.bytes, (3)*4)
	gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, gl.FALSE, this.bytes, (3+4)*4)
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW)
}

Studio.BufferGL.prototype.setTexture = function GL_setTexture(gl, mipmap) {
	if (!this._texture) {
		this.prepTexture(gl)
	}
	if(this.texture){
		if(this.texture.updateGlTexture){
			this.texture.updateGlTexture(gl)
		}
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.bitmap)
		if (mipmap) {
			gl.generateMipmap(gl.TEXTURE_2D)
		}
	}
}



Studio.Rect.prototype.addXYZ = function(buffer,point,stage){
	buffer.data[buffer.count++] = point.x
	buffer.data[buffer.count++] = point.y
	buffer.data[buffer.count++] = stage.draws*-.000001
}

Studio.Rect.prototype.addRGBA = function(buffer,color){
	buffer.data[buffer.count++] = color.r
	buffer.data[buffer.count++] = color.g
	buffer.data[buffer.count++] = color.b
	buffer.data[buffer.count++] = color.a*this._world.alpha
}
Studio.Rect.prototype.addTX = function(buffer,x,y){
	buffer.data[buffer.count++] = x
	buffer.data[buffer.count++] = y
}

Studio.Rect.prototype.addVert = function(buffer, point, tx,ty,stage) {
	this.addXYZ(buffer,point,stage)
	this.addRGBA(buffer,this.color)
	this.addTX(buffer,tx,ty)
}

Studio.Rect.prototype.verts = function(box, stage){
	var buffer = stage.rect_buffer;
	this.addVert(buffer,box.TL,0,0,stage)
	this.addVert(buffer,box.TR,0,0,stage)
	this.addVert(buffer,box.BL,0,0,stage)
	this.addVert(buffer,box.BR,0,0,stage)
}


Studio.Rect.prototype.buildElement = function(stage, ratio, interpolate) {
	stage.draws++
	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)
	
	this.verts(this._boundingBox, stage)
}

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio)
	this._boundingBox.get_bounds(this)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.bounds.left, this.bounds.top)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.bounds.right, this.bounds.top)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.bounds.left, this.bounds.bottom)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.bounds.right, this.bounds.top)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.bounds.left, this.bounds.bottom)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.bounds.right, this.bounds.bottom)
}

Studio.Rect.prototype.setStyle = function(ctx) {
	if (this.color.dirty){
		this.color._build_style();
	}
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style
	}
}

Studio.Rect.prototype.prepAngled = function(ctx) {
	if (this._dx || this._dy) {
		ctx.translate(this._dx, this._dy)
	}
	if(!this.skews){
		ctx.rotate(this._dAngle || 0)
	}
	if (this._world.scaleX !== 1 || this._world.scaleY !== 1) {
		ctx.scale(this._world.scaleX, this._world.scaleY)
	}
	if(this.skews){
		ctx.rotate(this._dAngle || 0)
	}
}

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height)
	// ctx.strokeRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore()
}

Studio.Rect.prototype.draw = function(ctx) {
	this.setStyle(ctx)
	this.setAlpha(ctx)
	ctx.strokeStyle = '#fff'
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		// ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
		ctx.fillRect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
}


Studio.Clip = function(attr) {
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Clip, Studio.Rect)

Studio.Clip.prototype.draw = function(ctx) {
	ctx.save()
	ctx.beginPath()
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.rect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
	// ctx.stroke();
	ctx.clip()
}
Studio.Clip.prototype.drawAngled = function(ctx) {
	this.prepAngled(ctx)
	ctx.rect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height)
}


Studio.CircleClip = function(attr) {
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.CircleClip, Studio.Rect)

Studio.CircleClip.prototype.draw = function(ctx) {
	ctx.save()
	ctx.beginPath()
	ctx.arc(this._dx, this._dy , this._world.width / 2, 0, 2 * Math.PI)
	ctx.clip()
}


Studio.Restore = function() {
}

Studio.Restore.prototype = new Studio.Rect()
Studio.Restore.prototype.constructor = Studio.Restore

Studio.Restore.prototype.draw = function(ctx) {
	ctx.restore()
}


Studio.Circle = function(attr) {
	this.color = new Studio.Color(1, 0, 0, 0)
	if (attr) {
		this.apply(attr)
	}
	this.height = this.width;
}

Studio.inherit(Studio.Circle, Studio.Rect)

Studio.Circle.prototype.draw = function(ctx) {
	this.setStyle(ctx)
	this.setAlpha(ctx)
	ctx.beginPath()

	ctx.arc(this._world.x, this._world.y, this._world.width/2, 0, 2 * Math.PI)
	ctx.fill()
}


/**
 * Sprite
 */

Studio.Sprite = function(attr) {
	this.image = null
	this.slice = 'Full'
	this.color = Studio.WHITE

	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Sprite, Studio.Rect)

Studio.Sprite.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.image.bitmap,
		this.image.slice[this.slice].x,
		this.image.slice[this.slice].y,
		this.image.slice[this.slice].width,
		this.image.slice[this.slice].height,
		-(this.width * this.anchorX),
		-(this.height * this.anchorY),
		this.width,
		this.height
	)
	ctx.restore()
}

Studio.Sprite.prototype.verts = function(box, buffer, texture, stage) {
	this.addVert(buffer, box.TL, texture.x, texture.y, stage)
	this.addVert(buffer, box.TR, texture.width, texture.y, stage)
	this.addVert(buffer, box.BL, texture.x, texture.height, stage)
	this.addVert(buffer, box.BR, texture.width, texture.height, stage)

	if (this.borderlap && this.border) {
		if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
			this._boundingBox.TL.x += this.border.width
			this._boundingBox.TR.x += this.border.width
			this._boundingBox.BR.x += this.border.width
			this._boundingBox.BL.x += this.border.width
		}
		if ((this._dx + this._world.width) > this.border.width) {
			this._boundingBox.TL.x -= this.border.width
			this._boundingBox.TR.x -= this.border.width
			this._boundingBox.BR.x -= this.border.width
			this._boundingBox.BL.x -= this.border.width
		}
		this.addVert(buffer, box.TL, texture.x, texture.y, stage)
		this.addVert(buffer, box.TR, texture.width, texture.y, stage)
		this.addVert(buffer, box.BL, texture.x, texture.height, stage)
		this.addVert(buffer, box.BR, texture.width, texture.height, stage)
	}
}

Studio.Sprite.prototype.buildElement = function(stage, ratio, interpolate) {
	if (!stage.buffers[this.image.path]) {
		stage.buffers[this.image.path] = new Studio.BufferGL(this.image,0,stage)
	}
	stage.draws++

	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)

	this.verts(this._boundingBox, stage.buffers[this.image.path], this.image.sliceGL[this.slice], stage)
}

Studio.Sprite.prototype.draw = function Studio_Sprite_draw(ctx) {
	if (!this.image) {
		return
	}
	if (!this.image.ready) {
		return
	}
	this.setAlpha(ctx)
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(
			this.image.bitmap,
			this.image.slice[this.slice].x,
			this.image.slice[this.slice].y,
			this.image.slice[this.slice].width,
			this.image.slice[this.slice].height,
			this._dx - (this._dwidth * this.anchorX),
			this._dy - (this._dheight * this.anchorY),
			this._dwidth,
			this._dheight
		)
		if (this.borderlap && this.border) {
			if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
				ctx.drawImage(
					this.image.bitmap,
					this.image.slice[this.slice].x,
					this.image.slice[this.slice].y,
					this.image.slice[this.slice].width,
					this.image.slice[this.slice].height,
					this.border.width + this._dx - (this._dwidth * this.anchorX),
					this._dy - (this._dheight * this.anchorY),
					this._dwidth,
					this._dheight
				)
			}
			if ((this._dx + this._world.width) > this.border.width) {
				ctx.drawImage(
					this.image.bitmap,
					this.image.slice[this.slice].x,
					this.image.slice[this.slice].y,
					this.image.slice[this.slice].width,
					this.image.slice[this.slice].height,
					this._dx - (this._dwidth * this.anchorX) - this.border.width,
					this._dy - (this._dheight * this.anchorY),
					this._dwidth,
					this._dheight
				)
			}
		}
	}
}

/**
 * SpriteAnimation --- just like a Sprite but uses a Spriteimage to render, and as such has frames, framerates etc...
 */ 

Studio.SpriteAnimation = function(attr) {
	this.image = null
	this.loop = [[0, 0]]
	this.fps = 12
	this.frame = 0
	this.sliceX = 0
	this.sliceY = 0
	this.offsetY = 0
	this.offsetX = 0
	this.repeat = true
	this.startTime = 0
	if (attr) {
		this.apply(attr)
	}
	this.setStartingFrame(this.frame)
}

Studio.inherit(Studio.SpriteAnimation, Studio.Sprite)

Studio.SpriteAnimation.prototype.setStartingFrame = function(a) {
	this.frame = a
	this.startTime = Studio.time
	this.myTime = this.startTime + (a * (1000 / this.fps))
}

Studio.SpriteAnimation.prototype.draw = function(ctx) {
	if (!this.image) {
		return
	}
	if (!this.image.ready) {
		return
	}
	this.setAlpha(ctx)

	ctx.drawImage(this.image.bitmap, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorX), this._dwidth, this._dheight)

	if (this.borderlap && this.border) {
		if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
			ctx.drawImage(this.image.bitmap, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this.border.width + this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
		}
		if ((this._dx + this._world.width) > this.border.width) {
			ctx.drawImage(this.image.bitmap, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this._dx - (this._dwidth * this.anchorX) - this.border.width, this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
		}
	}
	if (this.loop.length) {
		this.updateFrame()
	}
}

Studio.SpriteAnimation.prototype.setSlice = function() {
	this.sliceX = this.loop[this.frame][0] + this.offsetX
	this.sliceY = this.loop[this.frame][1] + this.offsetY
}

Studio.SpriteAnimation.prototype.updateFrame = function() {
	this.myTime += Studio.delta

	this.frame = (((this.myTime - this.startTime) * this._world.speed) / (1000 / this.fps)) | 0

	if (this.frame >= this.loop.length) {
		this.startTime = this.myTime
		this.frame = 0
		if (this.onLoopComplete) {
			this.onLoopComplete.call(this)
		}
	}
	this.setSlice()
}

Studio.SpriteAnimation.prototype.verts = function(box, buffer, texture, stage) {
	var width = (this.rect.width / this.image.width)
	var height = (this.rect.height / this.image.height)

	var left = this.sliceX * width
	var top  = this.sliceY * height

	this.addVert(buffer, box.TL, left, top, stage)
	this.addVert(buffer, box.TR, left + width, top, stage)
	this.addVert(buffer, box.BL, left, top + height, stage)
	this.addVert(buffer, box.BR, left + width, top + height, stage)

	if (this.borderlap && this.border) {
		if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
			this._boundingBox.TL.x += this.border.width
			this._boundingBox.TR.x += this.border.width
			this._boundingBox.BR.x += this.border.width
			this._boundingBox.BL.x += this.border.width
		}
		if ((this._dx + this._world.width) > this.border.width) {
			this._boundingBox.TL.x -= this.border.width
			this._boundingBox.TR.x -= this.border.width
			this._boundingBox.BR.x -= this.border.width
			this._boundingBox.BL.x -= this.border.width
		}
		this.addVert(buffer, box.TL, left, top, stage)
		this.addVert(buffer, box.TR, left + width, top, stage)
		this.addVert(buffer, box.BL, left, top + height, stage)
		this.addVert(buffer, box.BR, left + width, top + height, stage)
	}

	if (this.loop.length) {
		this.updateFrame()
	}
}



/**
* Camera
* This sets what parts we should see, and how we should see them.
*/

Studio.Camera = function(stage) {
	this.stage 		= {width: stage.width, height: stage.height}
	this.tracking 	= null
	this.focus		= {x: 0, y: 0}
	this.bound 		= null
	this.active		= true
	// this.visibleArea = new Studio.Rect({x: 0, y: 0, width: stage.width, height: stage.height, color: new Studio.Color(200, 0, 255, .4)})
	// stage.addChild(this.visibleArea);
	this.matrix 	= 	new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
}

Studio.inherit(Studio.Camera, Studio.DisplayObject)

Studio.Camera.prototype.updateRect = function() {
	this.left	= (this.bound._dx * this.scaleX) + this.focus.x
	this.top	= (this.bound._dy * this.scaleY) + this.focus.y
	this.right	= (this.bound._dwidth * this.scaleX) - this.focus.x
	this.bottom	= (this.bound._dheight * this.scaleY) - this.focus.y
}
Studio.Camera.prototype.update_visbile_area = function() {
	if (this.tracking) {
		this.visibleArea.x = this.x
		this.visibleArea.y = this.y
	} else {
		this.visibleArea.x = this.x + stage.width / 2
		this.visibleArea.y = this.y + stage.height / 2
	}
	this.visibleArea.width = (this.stage.width / this.scaleX) - 10
	this.visibleArea.height = (this.stage.height / this.scaleY) - 10
}
Studio.Camera.prototype.update = function(stage, ratio, webgl) {
	if (this.tracking) { // are we following a DisplayObject?
		if (!webgl) this.tracking._delta(ratio)
		this.x = (this.tracking._dx)
		this.y = (this.tracking._dy)
	}
	if (this.bound) { // are we bound to a DisplayObject? this can be the main stage if you want.
		this.updateRect()
		if (this.x < this.left) { // checking the bounds of the X coord.
			this.x = this.left
		} else if (this.x > this.right) {
			this.x = this.right
		}
		if (this.y <  this.top) { // checking the bounds of the Y coord.
			this.y = this.top
		} else if (this.y > this.bottom) {
			this.y = this.bottom
		}
	}
	if(this.visibleArea) this.update_visbile_area();
}

Studio.Camera.prototype.render = function(stage, ratio, webgl) {
	this.update(stage, ratio, webgl)
	// if (this.x || this.y || this.scaleX !== this.matrix[0] || this.scaleY !== this.matrix[4]) { // we only need to update this if its different
	this.matrix[0] = this.scaleX
	this.matrix[4] = this.scaleY
	this.matrix[6] = this.focus.x - (this.x * this.scaleX)
	this.matrix[7] = this.focus.y - (this.y * this.scaleY)
	if (!webgl) {
		stage.ctx.setTransform(this.matrix[0] * stage.resolution, 0, 0, this.matrix[4] * stage.resolution, this.matrix[6] * stage.resolution, this.matrix[7] * stage.resolution)
	}
	// }
	if (webgl) { // webgl needs up to send this information.
		stage.ctx.uniformMatrix3fv(stage.ctx.matrixLocation, false, this.matrix)
	}
}

Studio.Camera.prototype.track = function(who) {
	this.tracking = who
	this.focus.x = stage.width / 2
	this.focus.y = stage.height / 2
}

Studio.Camera.prototype.bindTo = function(who) {
	this.bound = who
}

Studio.Camera.prototype.unBind = function() {
	this.bindTo(null)
}

Studio.Camera.prototype.stopTracking = function() {
	this.track(null)
	this.focus.x = 0
	this.focus.y = 0
	this.matrix[6] = this.x * this.scaleX
	this.matrix[7] = this.y * this.scaleY
}


/**
 * Scene
 */

Studio.Scene = function(attr) {
	this.color = new Studio.Color(0,1,0,.5)
	this.active = false
	this.image = null
	this.loader = null
	this.assets = []
	this.children = []
	this.buttons = []
	this.tweens = Object.create(null)
	this.tween_length = 0
	this.trails = true
	this.anchorX = 0
	this.anchorY = 0
	if (attr) {
		this.apply(attr)
	}
	if (this.build) {
		this.build.call(this,this)
	}
	if (this.init) {
		this.init.call(this,this)
	}
}

Studio.inherit(Studio.Scene, Studio.Rect)

Studio.Scene.prototype.loadAssets = function() {
	for (var i = 0; i !== arguments.length; i++) {
		this.assets.push(new Studio.Image(arguments[i]))
	}
}

Studio.Scene.prototype.addButton = function(who) {
	this.buttons.unshift(who)
}

Studio.Scene.prototype.render_children = function(stage, lag) {
	for (this.i = 0; this.i < this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(stage, lag, stage.interpolate)
		}
	}
}

Studio.Scene.prototype.close = function(stage) {
	this.active = false
}
Studio.Scene.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style
	}
}

Studio.Scene.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// return;
	if (this.image) {
		ctx.drawImage(this.image.image, this._dx, this._dy, this.width, this.height)
		return
	}
	if (this.color) {
		if (this.color.a === 0) {
			ctx.clearRect(this._dx, this._dy, this.width, this.height)
			return
		}
		if (this.color.a < 1 && !this.trails) {
			ctx.clearRect(this._dx, this._dy, this.width, this.height)
		}
		this.setStyle(ctx)
		ctx.fillRect(this._dx, this._dy,  this.width, this.height)
		return
	}
}


/**
 * Stage
 * Where everything plays out.
 */

Studio.Stage = function(domID, attr) {

	// a very basic check for webgl support.
	// this will probably change later.
	this.webgl = !!window.WebGLRenderingContext;
	this.fullscreen = 0
	this.color = new Studio.Color(0, 0, 0, 1) // defaults to black
	this.snap = false
	// Before we do anything we should apply any attached attributes.
	// to disable webgl even if the browser supports it:
	// you would send an object like this { webgl : false }
	// That will force the 2d context.
	if (attr) {
		this.apply(attr)
	}
	this.tweens = Object.create(null)
	this._getCanvasElement(domID)
	this._count = 0
	this._maxCount = 16383
	this.dur = 1000 / 60
	this._d = this.dur / 2
	this.resolution = window.devicePixelRatio // defaults to device setting.
	this.interpolate = true
	this.smoothing = true

	if (attr) {
		this.apply(attr)
	}

	this._sizeCanvas(this.fullscreen)
	this.setPixelRatio()
	if (this.webgl && Studio.browser_info.webGL) {
		this.engine = Studio.Stage.prototype.WEBGL
	} else {
		this.webgl = false
	}
	this.allowPlugins()

	// We need to prepare the canvas element for use.
	// First we need to grab the appropriate context based on the engine type
	this.engine.getContext.call(this)

	// Once the context is obtained we need to fire some actions on it
	// this is mainly for webgl, since it needs shaders and programs created
	this.engine.init.call(this, this.ctx)

	// One the basic are competed by the init we can apply more changes through
	// a prep call. Again mainly used by webgl to create holders for buffers and such.
	this.engine.prep.call(this, this.ctx)
	Studio.stages.push(this)
	this.render = this.engine.render
	// This is a universal init. These are items that need to be attached to the stage
	// regardless of engine type. These include items like buttons, cameras, scenes etc...
	this._init()
	console.log('%cStudio3 v' + Studio.version + '%c' + this.engine.type, Studio.infoStyle, Studio.engineStyle)
	this.verts = 0
	return this
}

Studio.inherit(Studio.Stage, Studio.Scene)

Studio.Stage.prototype._getCanvasElement = function(domElementID) {
	if (domElementID) {
		if (domElementID.toLowerCase() === 'build') {
			this.bitmap = document.createElement('canvas')
			document.body.appendChild(this.bitmap)
			return
		}
		this.bitmap = document.getElementById(domElementID)
	} else {
		// If an ID is not passed to us.
		// We will find the first Canvas element and use that.
		var temp = document.body.getElementsByTagName('canvas')
		if (!temp[0]) {
			// If we can't find a Canvas element on the page, we create one.
			this.bitmap = document.createElement('canvas')
			document.body.appendChild(this.bitmap)
		} else {
			// Otherwise we use the first one we see.
			this.bitmap = temp[0]
		}
	}
}

Studio.Stage.prototype.setColor = function(r, g, b, a) {
	this.color.set(r, g, b, a)
	if (this.ctx.clearColor) {
		this.ctx.clearColor(this.color.r, this.color.g, this.color.b, this.color.a)
	}
}

Studio.Stage.prototype._init = function() {
	this.ready = false
	this.autoPause = false
	this._watching = false
	this.children = []
	this.buttons = []
	this.activeScene = null
	this.previousScene = null
	this.camera = new Studio.Camera(this)
	this.nextID = 0
	this.anchorX = 0
	this.anchorY = 0
	this.active = true
	this._pause_buttons = false

	// Studio.stages.push(this);
	Studio.stage = this
	return this
}

Studio.Scene.prototype.allowPlugins = function() {
	this.plugins = Object.create(null)
	this.plugins.input = []
	this.plugins.effect = []
	this._effects = 0
	this._inputs = 0
}

Studio.Stage.prototype._sizeCanvas = function(fullscreen) {
	this.height = this.bitmap.height || this.height
	this.width = this.bitmap.width || this.width
	this.bitmap.style.height = this.height + 'px'
	this.bitmap.style.width = this.width + 'px'
	this._scaleRatio = 1
	if (fullscreen == 1) {
		this.width = window.innerWidth
		this.height = window.innerHeight
		this.bitmap.style.height = '100%'
		this.bitmap.style.width = '100%'
	}
	if (fullscreen >= 2) {
		var innerWidth = window.innerWidth
		if (this.maxwidth && innerWidth > this.maxwidth) {
			innerWidth = this.maxwidth
		}
		this.bitmap.style.width = innerWidth + 'px'
		this.bitmap.style.height = 'auto'
		this._scaleRatio = innerWidth / this.width
		if (fullscreen == 3) {
			this.bitmap.style.height = window.innerHeight + 'px'
		}
	}

}

Studio.Stage.prototype.pauseButtons = function(a) {
	this._pause_buttons = a
}

Studio.Stage.prototype.setPixelRatio = function() {
	this.bitmap.width = this.width * this.resolution
	this.bitmap.height = this.height * this.resolution
}
Studio.Stage.prototype.fillScreen = function() {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

}
Studio.Stage.prototype.addInput = function(fn, options) {
	if (options) {
		fn._options(options)
	}
	fn.init(this)
	this.plugins.input.push(fn)
	this._inputs++
}

Studio.Stage.prototype.addEffect = function(fn, options) {
	if (options) {
		fn._options(options)
	}
	fn.init(this)
	this.plugins.effect.push(fn)
	this._effects++
}

Studio.Stage.prototype.checkDataAttributes = function() {
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
}

Studio.Stage.prototype.setScene = function(who) {
	who._parent = this
	if (this.activeScene && Studio.progress === 2) {
		if (this.activeScene.onDeactivate) {
			this.activeScene.onDeactivate(this)
		}
	}
	this.previousScene = this.activeScene
	this.activeScene = who
	this.activeScene.active = true
	if (who.onActivate) {
		who.onActivate(this)
	}
}

Studio.Stage.prototype.clearScene = function() {
	if (this.activeScene) {
		this.previousScene = this.activeScene
		this.activeScene = null
		if (this.previousScene.onDeactivate) {
			this.previousScene.onDeactivate(this)
		} else {
			this.previousScene.active = false
		}
	}
}

Studio.Stage.prototype.watch = function(who) {
	this._watching = who
	// this.children = who.children
	// this._hasChildren = who._hasChildren
}

// Studio.Stage.prototype.update_children = function(ratio, delta, interpolate) {
// 	for (this.i = 0; this.i < this._hasChildren; this.i++) {
// 		if (this.children[this.i].active) {
// 			this.children[this.i].update(ratio, delta, interpolate)
// 		}
// 	}
// }

Studio.Stage.prototype.update_visibility = function() {
	this._alpha = this.alpha
}

/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a _parent.
 * Yet it should still update its private variables.
 */
Studio.Stage.prototype._timebased_updates = function(delta) {
	if (this.activeScene) {
		this.activeScene.update_tweens(delta)
	}
	this.update_tweens(delta)
}

Studio.Stage.prototype.update = function(ratio, delta) {
	if (this.onEnterFrame) {
		this.onEnterFrame()
	}
	this._width = this.width
	this._height = this.height
	this._scaleX  = this.scaleX
	this._scaleY  = this.scaleY
	this._speed = this.camera.speed
	this.update_visibility()

	if (Studio.progress === 2) {

		if (this._inputs) {
			this.runInputs(delta)
		}
		this.updateScenes()

		if (this.beforeDraw) {
			this.beforeDraw()
		}
	}
	// if (this.logic) {
	// 	this.logic();
	// }
	this._logic()
}

Studio.Stage.prototype._update_scene = function(scene) {
	if (!scene) return
	if (scene.active) {
		scene.update(this.interpolate)
	}
}

Studio.Stage.prototype.updateScenes = function() {
	this._update_scene(this.activeScene)
	this._update_scene(this.previousScene)
	if (this._hasChildren) {
		this.update_children(this.interpolate)
	}
}

Studio.Stage.prototype.runEffects = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		if (this.plugins.effect[this.i].active) {
			this.plugins.effect[this.i].action(this)
		}
	}
}

Studio.Stage.prototype.runInputs = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._inputs; this.i++) {
		if (this.plugins.input[this.i].active) {
			this.plugins.input[this.i].action(this)
		}
	}
}

Studio.Stage.prototype.loading = function(delta) {

	if (Studio.loaded === true) { // BAD DESIGN! This should be based on each stage.
		// as it stands loading an image for one canvas will cause all to pause. oops.
		this.loop = this.activeloop
	}
}

Studio.Stage.prototype.activeloop = function(delta) {
	if (Studio.progress === 2) {
		this.timeStep(delta)
		return
	} else {
		// if(this.overlay_progress){
		// 	this.update_children();
		// 	this.draw(this.ctx);
		// 	this.timeStep(delta);
		// }

		if (!this.webgl) this.drawProgress(this.ctx, delta)

		if (Studio.progress === 1) {
			if (this.onReady) {
				this.onReady(delta)
			}
			
			Studio.progress = 2 // we set this to 2 so we can fire this event once.
			if (!this.activeScene) {
				return // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if (this.activeScene.onActivate) {
				this.activeScene.onActivate(this)
			}
		}
	}
}

Studio.Stage.prototype.loop = Studio.Stage.prototype.loading

Studio.Scene.prototype.drawProgress = function(ctx) {
	this.progressBar(ctx, Studio.progress)
	ctx.restore()
}

// default progress bar. overwire this to create your own.
Studio.Scene.prototype.progressBar = function(ctx, progress) {
	ctx.fillStyle = 'rgba(255,255,255,.8)'
	ctx.fillRect((this.width - 202) / 2, (this.height - 22) / 2, 202, 22)
	ctx.fillStyle = 'rgba(0,0,0,1)'
	ctx.fillRect(2 + (this.width - 202) / 2, 2 + (this.height - 22) / 2, progress * 198, 18)
}



Studio.Font = function(family,size,weight,style,varient){
	this.size = size || 16
	this.family = family || 'Arial'
	this.weight = weight || ''
	this.style = style || ''
	this.varient = varient || ''
	this.lineHeight = 20
	this.color = '#fff'
	this.shadow = 0
}

Studio.Font.prototype = {
	constructor : Studio.Font,
	build: function(){
		return (this.varient +' '+ this.style +' '+ this.weight +' '+ this.size +'px '+ this.family)
	},
	set: Studio.apply,
	modify: function(attr){
		if(!attr){
			return this.build()
		}
		var varient = attr.varient || this.varient
		var style = attr.style || this.style
		var weight = attr.weight || this.weight
		var size = attr.size || this.size
		var family = attr.family || this.family
		return (varient +' '+ style +' '+ weight +' '+ size +'px '+ family)
	}
}




Studio.TextBox = function(width, height, stage, image) {
	this.height = height
	this.width = width

	this.font = new Studio.Font()
	this._lastfont = this.font.build()
	this.shadow = 1
	this.offsetY = 0
	this._offsetY = this.offsetY;
	this.shadowColor = 'rgba(0,0,0,0.5)'
	if(!image){
		this.image = new Studio.Cache(width,height, stage.resolution)
	}else{
		this.image = image;
	}
	this.image.ctx.textBaseline = 'top'
	this.text = ''
	this._wrap_height = this.lineHeight
	this.horizontal_align = Studio.LEFT
	this.justify = false
	this.vertical_align = Studio.TOP
	this._vertical_align = 0
	this.columns = 1
	this.gutter = 20
	this.live = false

	this.styles = {
		'b': {
			color: "#FFD000",
			weight: 'bold',
		},
		'i':{
			style: 'italic',
			color: 'green'
		},
		'h1': {
			height: 'bold',
			size: 32,
			lineHeight: 40,
		},
		'h2': {
			height: 'bold',
			size: 24,
			lineHeight: 30,
		},
	}
	// document.body.appendChild(this.image.bitmap)
	return this
}

Studio.inherit(Studio.TextBox, Studio.Sprite)


Studio.TextBox.prototype.setFont = function(font) {
	this.font = font
	return this
}

Studio.TextBox.prototype.setText = function(text) {
	this.text = text
	return this
}

Studio.TextBox.prototype.setColor = function(color) {
	// this.color = color
	return this
}

Studio.TextBox.prototype.setFont = function(font) {
	this.image.ctx.font = this.font = font
	return this
}

Studio.TextBox.prototype.finish = function() {
	this.reset()
	this.wrapText()
	this.image.ready = true
	this.image.dirty = true
}

Studio.TextBox.prototype.reset = function() {
	var slice = this.image.slice[this.slice];
	this.image.ctx.clearRect(slice.x, slice.y, slice.width, slice.height)
	this.image.ctx.font = this.font
}

Studio.TextBox.prototype.writeLine = function(styles, x, y, vx) {
	var style = styles.split(' ')
	var nx = 0 
	var vx = vx || 0
	this.image.ctx.font = this._lastfont

	for(var i = 0; i!= style.length ; i++){
		var word = style[i]
		if(word[0]==='<' && word[word.length-1]==='>'){
			if(word=='</>'){
				this._lastfont = this.font.build()
				this.image.ctx.font = this._lastfont
				this.image.ctx.fillStyle = this.font.color;
				this._offsetY = this.offsetY
			}else{
				var tag = this.styles[word.slice(1,word.length-1)];
				if(tag){
					this._lastfont = this.font.modify(tag)
					this.image.ctx.font = this._lastfont
					this.image.ctx.fillStyle = tag.color
					if(tag.offsetY){
						this._offsetY = tag.offsetY
					}
				}
			}
			
		}else{
			if(this.shadow){
				var front_color = this.image.ctx.fillStyle;
				this.image.ctx.fillStyle = this.shadowColor
			 	for(var s = 1; s<= this.shadow; s+=.5){
			 		this.image.ctx.globalAlpha = this.shadow/s
			 		this.image.ctx.fillText(word, nx + x + 1 + s + (vx* i), y + s + this._offsetY)
			 	}
			 	this.image.ctx.fillStyle=front_color
			}
			this.image.ctx.fillText(word, nx + x + (vx* i), y + this._offsetY)
			nx += this.image.ctx.measureText(word+' ').width
		}
	}

	// if (this.shadow) {
	// 	this.image.ctx.fillStyle = this.shadowColor
	// 	for(var i = 1; i<= this.shadow; i+=.5){
	// 		this.image.ctx.globalAlpha = this.shadow/i
	// 		this.image.ctx.fillText(text, x + 1 + i, y + i)
	// 	}
	// }
	// this.image.ctx.fillStyle = this.color
	// this.image.ctx.fillText(text, x + 1, y)
}

Studio.TextBox.prototype.wrapText = function() {
	this.image.ctx.fillStyle = this.font.color;
	this._lastfont = this.font.build();
	this.image.ctx.font = this._lastfont
	var slice = this.image.slice[this.slice];

	var width = ((this.width)-(this.gutter*(this.columns-1)))/this.columns
	var start = slice.x+1
	var paragraphs = this.text.split('\n')
	var y = slice.y
	for (var i = 0; i !== paragraphs.length; i++) {
		var words = paragraphs[i].split(' ')
		var line = ''
		var styleline = ''
		var testWidth = 0
		var metrics = 0
		var lineHeight = this.font.lineHeight
		var just = slice.x
		for (var n = 0; n < words.length; n++) {
			var word = words[n];
			if(word[0]==='<' && word[word.length-1]==='>'){
				if(word=='</>'){
					this.image.ctx.font = this.font.build()
				}else{
					var tag = this.styles[word.slice(1,word.length-1)];
					if(tag){
						this.image.ctx.font = this.font.modify(tag)
						if(tag.lineHeight){
							lineHeight = tag.lineHeight
						}
					}
				}
				
				metrics = 0
			}else{
				metrics = this.image.ctx.measureText(word +' ').width
			}

			testWidth += metrics
			if (testWidth > width && n > 0) {
				testWidth -= metrics
				// testWidth = this.image.ctx.measureText(line).width
				// We want to avoid any off pixel font rendering so we use | 0 to prevent floats
				// also offset everything by 1px because it helps with the centering of text
				if(y+lineHeight>=slice.height/this.image.resolution){
					y = slice.y
					start += width+this.gutter
					if(start>=slice.width) return
				}
				if(this.justify==true){
					this.writeLine( styleline, start, y , (width - testWidth)/(just))
				}else{
					this.writeLine( styleline, start + ((width - testWidth) * this.horizontal_align) | 0 , y, 0)
				}
				just = slice.x
				styleline = word +' '
				y += lineHeight
				testWidth = metrics
			} else {
				styleline = styleline + word + ' '
				just++
			}
		}
		if(y+lineHeight>=slice.height/this.image.resolution){
			y = slice.y
			start += width+this.gutter
			console.log('move me over outside')
		}

		this.writeLine( styleline, start + ((width - testWidth) * this.horizontal_align) | 0, y , .25)
		
		
		this._wrap_height = y + lineHeight
		if (i !== paragraphs.length - 1) {
			y += lineHeight
		}
	}
	// this._wrap_height += (this.shadow * 2) + 1;
	if (this._wrap_height > this.height) {
		this._wrap_height = this.height
	}
	this._vertical_align = (this._wrap_height * this.vertical_align - this.height * this.vertical_align) | 0
}

Studio.TextBox.prototype.fit = function() {
	this.image.height = this._wrap_height
	this.wrapText()
}
Studio.TextBox.prototype.update_xy= function() {
	if (this.orbits && this._parent.angle) {
		this.update_orbit_xy()
	} else {
		this._world.x  = ((this.x * this._parent.scaleX) + this._parent.x)
		this._world.y  = ((this.y * this._parent.scaleY) + this._parent.y) - this._vertical_align 
	}
	if(this.live){
		this.finish()
	}
}



Studio.Scene.prototype.update_tweens = function(global_delta) {
	var i,j = 0
	var tween, key, delta
	for (i in this.tweens) {
		tween = this.tweens[i]
		if (tween.actor._world) {
			tween.cur += global_delta * tween.actor._world.speed
		} else {
			tween.cur += global_delta
		}
		if (!tween.active && tween.onStart) {
			tween.onStart.call(tween.actor)
			tween.active = 1
		}
		if (!tween.dir) {
			delta = tween.cur / tween.duration
		} else {
			delta = 1 - tween.cur / tween.duration
		}
		if (delta < 1 && delta > 0) {
			for (j = 0; j !== tween.keys.length; j++) {
				key = tween.keys[j]
				this.update_property(tween,key, delta)
			}
		} else {
			if (tween.next) {
				tween.next._snapshot()
				tween.next.cur = tween.cur - tween.duration
				this.tweens[i] = tween.next

				// return;
			} else {
				if (tween._loop) {
					tween.cur = 0
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor)
					}
					if (tween._reflect) {
						if (!tween.dir) {
							tween.dir = 1
						} else {
							tween.dir = 0
						}
					} else {
						tween.actor.apply(tween.original)
						tween.active = 0
					}
					return
				} else {
					if (tween.reset) {
						tween.actor.apply(tween.original)
					} else {
						// tween.actor.apply(tween.to)
						for(j=0;j!==tween.keys.length;j++){
							key = tween.keys[j];
							tween.actor[key] = tween.to[key];
						}
					}
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor)
					}
					tween = null
					this.tweens[i] = null
					delete this.tweens[i]
				}
			}
		}
	}
}

Studio.Scene.prototype.update_property = function(tween, key, delta) {
	tween.actor[key] = tween.original[key] + (Studio.Ease[tween.ease](delta) * (tween.to[key] - tween.original[key]))
}

Studio._tween_object = function(who, ease, to, duration, onEnd, onStart) {
	this.actor = who
	this.ease = ease
	this.original = {}
	this.to = to
	this.cur = 0
	this.duration = duration
	this.onStart = onStart
	this.onEnd = onEnd
	this._loop = false
	this._reflect = true
	this.reset = false
	this.dir = 0
	this.active = 0
	this.id = null
	this.keys = Object.keys(to)
	this.next = null
	this.prev = null
}

Studio._tween_object.prototype.constructor = Studio._tween_object

Studio._tween_object.prototype.loop = function() {
	this._loop = true
	return this
}

Studio._tween_object.prototype.apply = function(a) {
	for (var key in a) {
		this[key] = a[key]
	}
	return this
}

Studio._tween_object.prototype.reflect = function(status) {
	this._reflect = status
	return this
}

Studio._tween_object.prototype.setActor = function(actor) {
	this.actor = actor
	return this
}

Studio.Scene.prototype.createTween = function(who, ease, to, duration, callback, onstart) {
	var temp = new Studio._tween_object(who, ease, to, duration, callback, onstart)
	temp.id = this.nextID

	for (var key in to) {
		temp.original[key] = who[key]
	}

	this.nextID++
	return temp
}

Studio._tween_object.prototype._snapshot = function() {
	for (var key in this.to) {
		this.original[key] = this.actor[key]
	}
}

Studio._tween_object.prototype.then = function(ease, to, duration, callback, onstart) {
	this.next = new Studio._tween_object(this.actor, ease, to, duration, callback, onstart)
	this.next.prev = this
	return this.next
}

Studio._tween_object.prototype.last = function() {
	var next = this.next
	var prev = this
	while (next !== null) {
		prev = next
		next = next.next
	}
	return prev
}

Studio._tween_object.prototype.completeLoop = function(who) {
	this.next = who
	who.prev = this
	return this.next
}


Studio.Scene.prototype.createLoop = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback)
	this.tweens[this.nextID - 1].loop = true
	return this.tweens[this.nextID - 1]
}

Studio.Scene.prototype.addTween = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback)
	return this.tweens[this.nextID - 1]
}

Studio.Scene.prototype.playTween = function(who) {
	who.cur = 0
	for (var j = 0; j !== who.keys.length; j++) {
		who.original[who.keys[j]] = who.actor[who.keys[j]]
	}
	this.tweens[who.id] = who
}

Studio.Scene.prototype.stopTween = function(who, snap, original) {
	if (this.tweens[who.id]) { // lets make sure the tween is active first
		who.cur = 0
		who.dir = 0
		if (snap) {
			var j
			if (original) {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.original[who.keys[j]]
				}
			} else {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.to[who.keys[j]]
				}
			}
		}
		this.tweens[who.id] = null
		delete this.tweens[who.id]
	}
}


/*
	Studio.Pattern(
		attr : {} || null 		(defaults to { height: 512, width: 512, resolution: 1})
	)
	Studio.Pattern is an extention of Studio.Rect.
	It contains a Studio.Cache to store the pattern once created.
	ex. var pattern = new Studio.Pattern({
			x:20,
			y:20,
			width: 256,
			height: 128,
			resolution: 2
		});
*/

Studio.Pattern = function(attr) {
	this.height = 512
	this.width = 512
	this.overflowX = 0
	this.overflowY = 0
	this.resolution = 1
	this.image = null
	this.offsetX = 0
	this.offsetY = 0
	this.stretchY = false
	// this.pattern = [{0,0,96,96}]
	if (attr) {
		this.apply(attr)
	}
	this.base_image = this.image;
	this.base_image.addListenerTo('ready','onImageReady', this)
	this.width = this.width + this.overflowX
	this.height = this.height + this.overflowY
	this.image = new Studio.Cache(this.width, this.height, this.resolution)
	this._imaged = false
	return this
}

Studio.inherit(Studio.Pattern, Studio.Sprite)

/*
	setPattern
*/

Studio.Pattern.prototype.setPattern = function() {
	var slice = this.base_image.slice[this.slice]

	var width = slice.width * this.scaleX || 0
	var height = slice.height * this.scaleY  || 0
	var x = 0;
	var y = 0;
	if(!this.stretchX && !this.stretchY){
		for ( x = 0; x < this.width; x += width ) {
			for ( y = 0; y < this.height; y += height ) {
				if (this.offsetX + width > width) {
					this.offsetX -= width
				}
				if (this.offsetY + height > height) {
					this.offsetY -= height
				}
				this.image.ctx.drawImage(this.base_image.bitmap, slice.x, slice.y, slice.width, slice.height, x + this.offsetX,y + this.offsetY, width, height)
			}
		}
	}else{
		if(this.stretchY){
			for ( x = 0; x < this.width; x += width ) {
				if (this.offsetX + width > width) {
					this.offsetX -= width
				}
				this.image.ctx.drawImage(this.base_image.bitmap, slice.x, slice.y, slice.width, slice.height, x + this.offsetX,y + this.offsetY, width, this.height)
			}
		}else{
			for ( y = 0; y < this.height; y += height ) {
				if (this.offsetY + height > height) {
					this.offsetY -= height
				}
				this.image.ctx.drawImage(this.base_image.bitmap, slice.x, slice.y, slice.width, slice.height, x + this.offsetX,y + this.offsetY, this.width, height)
			}
		}
	}
	
	return this
}

Studio.Pattern.prototype.checkOverflow = function() {
	if (this.x > 0) {
		this.x -= this.overflowX
	}
	if (this.y > 0) {
		this.y -= this.overflowY
	}
	if (this.x < -this.overflowX) {
		this.x += this.overflowX
	}
	if (this.y < -this.overflowY) {
		this.y += this.overflowY
	}
}
/*
	onImageReady(
		ready : Boolean		// value returned by image object
	)

	Once the image for this pattern is loaded we can create the pattern.
	Otherwise the image is never auto populated.
*/

Studio.Pattern.prototype.onImageReady = function(ready) {
	if (ready) {
		this.setPattern()
	}
}

Studio.Pattern.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height)
}

Studio.Pattern.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.image.bitmap, 0, 0, this.image.bitmap.width, this.image.bitmap.height, -(this._dwidth * this.anchorX), -(this._dheight * this.anchorY), this._dwidth, this._dheight)
	ctx.restore()
}

Studio.Pattern.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(this.image.bitmap, 0, 0, this.image.bitmap.width, this.image.bitmap.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
}

Studio.Pattern.prototype.buildElement = function(stage, ratio, interpolate) {
	if (!stage.buffers[this.image.path]) {
		stage.buffers[this.image.path] = new Studio.BufferGL(this.image,0,stage)
	}
	stage.draws++

	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)

	this.verts(this._boundingBox, stage.buffers[this.image.path], this.base_image.sliceGL['Full'], stage)
}


Studio.load = function(path, type, callback, who) {

	var request = new XMLHttpRequest()

	request.onload = function studio_load_onload() {
		var data = null
		if ((request.status >= 200 && request.status < 400) || request.status == 0) {
			console.log('%cStudio loaded file : ' + path, Studio.statStyle)

			if (type.toLowerCase() == 'json') {
				data = JSON.parse(request.responseText)
			}
			if (callback) {
				if (who) {
					callback.call(who,data)
				} else {
					callback(data)
				}
			}
		} else {
			this.onerror()
		}
	}

	request.onerror = function() {
		console.log('%cStudio failed to load file : ' + path, Studio.errorStyle)
	}
	request.open('GET', path, true)
	request.send()
}

Studio.TileMap = function(width, height, resolution, attr) {
	this.cache = new Studio.Cache(width, height, resolution)
	this.buffer = new Studio.Cache(width, height, resolution)
	this.offsetX = 0
	this.offsetY = 0
	this.maxWidth = 0
	this.resolution = resolution || 1
	this.repeat =
	this.data = null
	if (attr) {
		this.apply(attr)
	}
}

Studio.TileMap.prototype = {
	apply: Studio.apply,
	constructor: Studio.TileMap,
	build: function(data, set, sx, sy, mx, my) {
		var map = data
		var buffer = this.cache.ctx
		var width = set.tileWidth
		var height = set.tileHeight
		this.maxWidth = Math.floor(this.cache.width / width) / this.resolution
		var sx = sx || 0
		var sy = sy || 0
		var mX = mx || this.maxWidth
		var mY = my || map.height - sy
		if(map.data){
			for (var y = 0; y != mY; y++) {
				for (var x = 0; x != mX; x++) {
					var flip_X = 0
					var flip_Y = 0

					var i = (map.data[parseInt((y + sy) * map.width) + (x + sx)]) - set.firstgid
					var width = set.tileWidth
					var height = set.tileHeight

					if(i> 0x80000000){
						i-=0x80000000;
						flip_X = -1
						// width *=-1
					}
					if(i>0x40000000){
						i-=0x40000000
						flip_Y = -1
						// height *=-1
					}
					if(i>0x20000000){
						i-=0x20000000
						// flip_X = 1
					}

					var _y = parseInt(i / set.across)
					var _x = i - (_y * set.across)

					
					// if(flip_X || flip_Y){
						buffer.drawImage(
							set.set.bitmap, 
							_x * set.tileWidth + (set.tileWidth * flip_X), 
							_y * set.tileHeight + (set.tileHeight * flip_Y), 
							width, 
							height, 
							x * set.tileWidth, 
							y * set.tileHeight, 
							set.tileWidth , 
							set.tileHeight
						)
					// }else{
					// 	buffer.drawImage(set.set.bitmap, _x * set.tileWidth, _y * set.tileHeight, set.tileWidth, set.tileHeight, x * set.tileWidth, y * set.tileHeight, set.tileWidth, set.tileHeight)
					// }
					
				}
			}
		}

		this.buffer.ctx.clearRect(0,0,this.cache.width,this.cache.height)
		this.buffer.ctx.drawImage(this.cache.bitmap,0,0)
		this.cache.ready = true
	},
	offsetMap: function(x, y) {
		this.offsetX += x

		if (this.offsetX < 0) {
			this.offsetX = 0
		}
		if (this.offsetX + this.maxWidth > this.data.width) {
			this.offsetX = this.data.width - this.maxWidth
		}
		this.cache.ctx.clearRect(0,0,this.cache.width,this.cache.height)

		for (var i in this.data.layers) {
			this.build(this.data.layers[i], this.tileset, this.offsetX, this.offsetY, this.maxWidth)
		}

	},
	_onLoad: function test(result) {
		console.log(result)
		if (!result) {
			console.log('The image isn\'t ready so we need to wait.')
			return
		}
		if (result == true) {
			// map  = new Studio.TileMap();
			console.log('The Image is ready, we can now create the tileset from the information provided, and then build the map from the data layer.')
			this.offsetMap(0,0)
		}
	},
	onMapLoad: function(data) {
		this.data = data
		this.set = data.tilesets[0]
		var setimage = new Studio.Image('assets/' + this.set.image)
		this.tileset =  new Studio.TileSet(setimage, this.set.tilewidth, this.set.tileheight, this.set.imagewidth)
		// change to addListenerFunction( function ) ... this explains what the variable needs to be.
		setimage.addListenerTo('ready','_onLoad', this)
	},
	load: function(asset, type) {
		Studio.load(asset, type, this.onMapLoad, this)
	}
}

Studio.TileSet = function(image, width, height, imagewidth) {
	this.firstgid = 1
	this.tileWidth = width || 32
	this.tileHeight = height || 32
	this.across = imagewidth / width | 0
	this.set = image || null
}

Studio.TileSet.prototype = {
	constructor: Studio.TileSet,
	onLoadComplete: function(data) {
		data.across = data.set.width / data.tileWidth
	}
}


Studio.Effect = {}

Studio.Effect.BillAtkinsonDither_BW = new Studio.Plugin({
	options: {

	},
	init: function(a) {
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
		this.active = true;
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.bitmap.width,a.bitmap.height);
		var pixeldata = pixels.data;
		var width = parseInt(a.bitmap.width*4)
		var length = pixeldata.length;

		for (var i=0; i < length; i+=4) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = pixeldata[i+1] = pixeldata[i+2] = this.newpixel;
			if(pixeldata[i+3]>20){
				pixeldata[i+3] = 255;
			}else{
				pixeldata[i+3] = 0
			}

			this.qerror = (this.oldpixel - this.newpixel) * .15;

			if((i % width === 0) && (i+4 % width === 0) && (i+8 % width === 0)){

			}else{
				pixeldata[i+5] = pixeldata[i+6] = pixeldata[i+4]+= this.qerror;
				pixeldata[i+9] = pixeldata[i+10] = pixeldata[i+8]+= this.qerror;
				pixeldata[i+5+width] = pixeldata[i+6+width] = pixeldata[i+4+width] += this.qerror;
				pixeldata[i+1+width] = pixeldata[i+2+width] = pixeldata[i+width] += this.qerror;
				pixeldata[i+width-3] = pixeldata[i+width-2] = pixeldata[i+width-4] += this.qerror;
				pixeldata[i+width*2] = pixeldata[i+(width*2)] = pixeldata[i+(width*2)] += this.qerror;
			}
		}
		a.ctx.putImageData(pixels,0,0);
	}
})

Studio.Effect.Posterize = new Studio.Plugin({
	options: {

	},
	init: function(a) { // lets build out a canvas for the stats
		// this.cache = new Studio.Cache(a.width,a.height,a.resolution);
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
		this.active = true
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.bitmap.width,a.bitmap.height);
		var pixeldata = pixels.data;
		var width = a.bitmap.width*4;
		var length = pixeldata.length;

		for (var i=0; i < length; i++) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = this.newpixel;
		}
		a.ctx.putImageData(pixels,0,0);
	}
})


Studio.Effect.Replicator = new Studio.Plugin({
	options: {
		x: 3,
		y: 3,
	},
	init: function(a) {
		this.cache = new Studio.Cache();
	},
	action: function(a) {
		var width = a.canvas.width/this.options.x;
		var height = a.canvas.height/this.options.y;
		this.cache.image.width = width;
		this.cache.image.height = height;
		this.cache.buffer.drawImage(a.canvas,0,0, width, height);
		for(var i = 0; i!= this.options.x; i++){
			for(var j = 0; j!= this.options.y; j++){
				a.ctx.drawImage(this.cache.image, i * width , j * height, width ,height)
			}
		}
	}
})


Studio.Effect.Blur = new Studio.Plugin({
	options: {
		x: 3,
		y: 3,
	},
	init: function(a) {
		this.cache = new Studio.Cache();
		this.active = true
	},
	action: function(a) {
		var width = a.bitmap.width/2;
		var height = a.bitmap.height/2;
		console.log(this.cache)
		this.cache.bitmap.width = width;
		this.cache.bitmap.height = height;
		this.cache.ctx.drawImage(a.bitmap,0,0, width, height);
		a.ctx.drawImage(this.cache.bitmap, 0 , 0, a.width ,a.height)
	}
})

Studio.Effect.Cursor = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.cursor = new Studio.Image('assets/cursor.png');
		a.bitmap.style.cursor = 'none';
	},
	action: function(a) {
		a.ctx.drawImage(this.cursor.image, a.mouse.x-8, a.mouse.y-8, 48, 48)
	}
})


Studio.Effect.Red = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.active = true
	},
	action: function(a) {
		var myGetImageData = a.ctx.getImageData(0,0,a.bitmap.width, a.bitmap.height);
		var buffer = myGetImageData.data.buffer;
		var sourceBuffer8 = new Uint8Array(buffer);
		var sourceBuffer32 = new Uint32Array(buffer);
		var length = sourceBuffer32.length;
		for (var i = 0 ; i!=length; i++){
			var temp = myGetImageData.data[i*4+1];
			sourceBuffer32[i]= (255 << 24) |
                (255-temp << 16) | 
                (temp <<  8) |
                 255-temp
		}
		myGetImageData.data.set(sourceBuffer8);
		a.ctx.putImageData(myGetImageData, 0, 0);
	}
})


Studio.timeStep = {
	fixed: function(delta) {
		this.fixedStep(delta)
		this.step(delta)
		this._timebased_updates(delta)
		this.render(this._lag)
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	simple: function(delta) {
		this.update(this.interpolate)
		this._timebased_updates(delta)
		this.render(1)
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	static_fixed: function(delta) {
		this.step(delta)
		if (this._d >= this.dur) {
			this._d -= this.dur
			this.update(false)
			this._timebased_updates(delta)
			this.render(1)
		}
		if (this._d < 1) {
			this._d = 1.5
		}
	}
}

Studio.Stage.prototype.timeStep = Studio.timeStep.fixed

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur
		this.update(this.interpolate) // update by a fixed amount.
	}
	if (this._d < 1) {
		this._d = 1.5
	}
}

Studio.Stage.prototype.step = function(delta) {
	this._d += delta

	this._lag = this._d / this.dur
	if (this._lag > 1) {
		this._lag = 1
	}
	if (this._lag < 0) {
		this._lag = 0
	}
}

var FRAGMENTSHADER = ['precision lowp float;',
						'uniform sampler2D u_image;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'	gl_FragColor = texture2D(u_image, v_texture) * v_color;',
						'}'].join('\n')

var VERTEXSHADER = ['attribute vec3 a_position;',
						'attribute vec4 a_color;',
						'attribute vec2 a_texture;',
						'uniform vec2 u_resolution;',
						'uniform mat3 u_matrix;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   vec2 canvas_coords = (u_matrix * vec3(a_position.xy,1)).xy;',
						'   vec2 clipSpace = ((canvas_coords / u_resolution)*2.0) - 1.0;',
						'	gl_Position = vec4(clipSpace * vec2(1, -1), a_position.z, 1);',
						'	v_color = a_color;',
						'	v_texture = a_texture;',
						'}'].join('\n')

Studio.Stage.prototype.loadShader = function(who, shader) {
	this.ctx.shaderSource(who, shader)
}

Studio.Stage.prototype.WEBGL = {

	type: 'webgl',

	antialias: false,
	premultipliedAlpha: false,
	stencil: true,

	getContext: function() {
		if (Studio.browser_info.iOS) {
			this.WEBGL.antialias = true
		} else {
			this.WEBGL.antialias = false
		}
		this.ctx = this.bitmap.getContext(Studio.browser_info.webGL, {
			antialias: this.WEBGL.antialias ,
			premultipliedAlpha: this.WEBGL.premultipliedAlpha ,
			stencil: this.WEBGL.stencil
		})
	},
	newBatch: function(gl, name) {
		// gl._rects = new Float32Array(this._maxCount)
	},
	init: function(gl) {
		this._max_textures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		this._count = 0
		this.rect_buffer = new Studio.BufferGL(null,0,this)
		gl.clearColor(0,0,0,1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
		this.loadShader(this.vertexShader , VERTEXSHADER)

		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
		this.loadShader(this.fragmentShader , FRAGMENTSHADER)

		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LESS)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.enable(gl.BLEND)
		// gl.disable(gl.DEPTH_TEST);

		this.program = gl.createProgram()
		gl.attachShader(this.program, this.vertexShader)
		gl.attachShader(this.program, this.fragmentShader)

		gl.compileShader(this.vertexShader)
		gl.compileShader(this.fragmentShader)

		gl.linkProgram(this.program)

		gl.useProgram(this.program)
	},

	prep: function(gl) {
		this.buffers = {}

		gl.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution')
		gl.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		// gl.scaleLocation = gl.getUniformLocation(this.program, 'u_scale')
		gl.enableVertexAttribArray(0)

		gl.positionLocation = gl.getAttribLocation(this.program, 'a_position')

		gl.bindAttribLocation(this.program, 0, 'a_position')



		gl.colorLocation = gl.getAttribLocation(this.program, 'a_color')

		gl.textureLocation = gl.getAttribLocation(this.program, 'a_texture')

		gl.uniform2f(gl.resolutionLocation, this.width, this.height)

		this.buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

		gl.enableVertexAttribArray(gl.positionLocation)
		gl.enableVertexAttribArray(gl.colorLocation)
		gl.enableVertexAttribArray(gl.textureLocation)

		gl.vertexAttribPointer(gl.positionLocation, 3, gl.FLOAT, false, 36, 0)
		gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 36, (3) * 4)
		gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 36, (3 + 4) * 4)

		this._rect_index_buffer = gl.createBuffer()
		this._rect_index = new Uint16Array(this._maxCount*7)

		for (var i = 0, j = 0; i < this._maxCount*7; i += 6, j += 4) {
			this._rect_index[i + 0] = j + 0
			this._rect_index[i + 1] = j + 1
			this._rect_index[i + 2] = j + 2
			this._rect_index[i + 3] = j + 1
			this._rect_index[i + 4] = j + 2
			this._rect_index[i + 5] = j + 3
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._rect_index, gl.STATIC_DRAW)
	},
	render:  function(lag) {
		this._count = 0
		this.draws = 0
		this.ctx.clearColor(this.color.r,this.color.g,this.color.b,this.color.a)
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT)
		if (this.previousScene) {
			this.previousScene.buildElement(this, lag, this.interpolate)
			this.previousScene.vertex_children(this, lag, this.interpolate)
		}
		if (this.activeScene) {
			this.activeScene.buildElement(this, lag, this.interpolate)
			this.activeScene.vertex_children(this, lag, this.interpolate)
		}
		this.vertex_children(this, lag, this.interpolate)
		this.rect_buffer.draw(this.ctx)
		this.camera.render(this, lag, 1);
		for (var i in this.buffers) {
			this.buffers[i].draw(this.ctx)
		}
		if (this._effects) {
			this.runEffects();
		}
	}
}


Studio.Stage.prototype.CANVAS = {
	type: '2dContext',
	getContext: function() {
		this.ctx = this.bitmap.getContext('2d')
	},
	init: function() {
		this.ctx.webkitImageSmoothingEnabled = this.smoothing
		this.ctx.mozImageSmoothingEnabled = this.smoothing
		this.ctx.imageSmoothingEnabled = this.smoothing
	},
	prep: function() {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0)
		this.draw(this.ctx)
		this.camera.render(this,lag)

		if (this.previousScene) {
			this._renderScene(this.previousScene , lag)
		}
		if (this.activeScene) {
			this._renderScene(this.activeScene , lag)
		}
		if (this._hasChildren) {
			this.render_children(this, lag)
			if (this._effects) {
				this.runEffects()
			}
			return
		}
		if(this._watching){
			this._watching.render_children(this,lag)
			if (this._effects) {
				this.runEffects()
			}
		}
	},
}

Studio.Stage.prototype._renderScene = function(scene, lag) {
	if (scene.active) {
		scene.render(this , lag, this.interpolate)
	}
}

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS

Studio.Stage.prototype.enableKeyboardInput = function() {
	// if we've already enabled keys we should abort.
	if(this.keys) {
		console.warn('Keyboard events are already enabled.');
		return;
	}
	var me = this;

	this.keys = {};
	this.keys.onScreen = {};
	var keydown = function(e) {
		e.preventDefault();
		me.keys[e.keyCode] = 1;
		if(me.keys.onScreen[e.keyCode]){
			me.keys.onScreen[e.keyCode].keydown()
		}
	};

	var keyup = function(e)  {
		e.preventDefault();
		me.keys[e.keyCode] = 0;
		if(me.keys.onScreen[e.keyCode]){
			me.keys.onScreen[e.keyCode].keyup()
		}
	};

	document.addEventListener('keydown', keydown, false);
	document.addEventListener('keyup', keyup, false);
};



Studio.Stage.prototype.enableTouchEvents = function() {
	var me = this;

	// TYPES of EVENTS
	// finger also == mouse cursor
	// onTap : finger touch inside button
	// onTapOutside : finger touch anywhere besides button.
	// onDragStart : finger starts dragging a draggable button
	// onDragEnd : finger stops dragging a draggable button
	// // dragable is a state of a button... does not fire event while dragging.
	// onRelease : finger is released inside button
	// onReleaseOutside : finger in relased outside button
	// onHover : when over a button but not pressed. *mouse only?

	var mouse = { 
					x: 0, 
					y: 0, 
					dx: 0, 
					dy: 0, 
					id: 0
				}

	/* MOUSE EVENTS*/

	this.mouse_onDown = function(touch, scene) {
		if (scene.buttons && !scene._pause_buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i]._touchID) {
					// already tapped by someone so lets leave it alone
				} else {
					if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
						scene.buttons[i]._touchID = touch.id;
						if (scene.buttons[i].onTap) {
							scene.buttons[i].onTap(touch); // cool we just clicked the button
						}
						if (scene.buttons[i].preventBubble) {
							return;
						}
					} else {
						if (scene.buttons[i].onTapOutside) {
							scene.buttons[i].onTapOutside(touch);
						}
					}
				}
			}
		}
	}

	this.mouse_onMove = function(touch, scene) {
		if (scene.buttons && !scene._pause_buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
					if (scene.buttons[i].draggable && touch.id) {
						if ((scene.buttons[i]._touchID == touch.id)) {
							if (!scene.buttons[i]._activeDrag) {
								if (scene.buttons[i].onDragStart) {
									scene.buttons[i].onDragStart(touch); // we check to see if a drag has ever occured
								}
								scene.buttons[i]._activeDrag = true;
							} else {
								if (scene.buttons[i].onDrag) {
									scene.buttons[i].onDrag(touch);
								}
							}
						}
					}
					if (scene.buttons[i].onHoverStart && !scene.buttons[i].hovering) {
						scene.buttons[i].onHoverStart(touch);
					} else if (scene.buttons[i].onHover) {
						scene.buttons[i].onHover(touch);
					}
					scene.buttons[i].hovering = true;
				} else {
					if (scene.buttons[i].hovering) {
						scene.buttons[i].hovering = false;
						if (scene.buttons[i].onHoverEnd) {
							scene.buttons[i].onHoverEnd();
						}
					}
				}
				if ((scene.buttons[i].draggable && scene.buttons[i]._activeDrag) && (scene.buttons[i]._touchID == touch.id)) {
					scene.relativeX = touch.dx;
					scene.relativeY = touch.dy;
					if (scene.buttons[i].angle  && (scene.buttons[i].orbits || scene.buttons[i].inheritRotation)) {
						scene.relativeX = (touch.dx * Math.cos(-scene.buttons[i].angle)) - (touch.dy * Math.sin(-scene.buttons[i].angle));
						scene.relativeY = (touch.dx * Math.sin(-scene.buttons[i].angle)) + (touch.dy * Math.cos(-scene.buttons[i].angle));
						touch.dx = scene.relativeX;
						touch.dy = scene.relativeY;
					}
					if (scene.buttons[i].onDrag) {
						scene.buttons[i].onDrag(touch);
					}
				}
				if (scene.buttons[i].onTouchMove) {
					scene.buttons[i].onTouchMove(touch);
				}
			}
		}
	}

	this.mouse_onUp = function(touch, scene) {
		if (scene.buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i]._touchID == touch.id) {
					
					if (scene.buttons[i]._activeDrag) {
						if (scene.buttons[i].onDragEnd) {
							scene.buttons[i].onDragEnd(touch); // we can end the drag if its active.
						}
					}
					if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
						if (scene.buttons[i].onRelease) {
							scene.buttons[i].onRelease(touch); // cool we just let go of the button
						}
					} else {
						if (scene.buttons[i].onReleaseOutside) {
							scene.buttons[i].onReleaseOutside(touch);
						}
					}
					scene.buttons[i]._activeDrag = false;
					scene.buttons[i]._touchID = 0;
				}
			}
		}
	}
	var scaledMouse = {clientX: 0, clientY: 0}

	var ratioEvent = function(event) {
		scaledMouse.clientX = (event.clientX - me.bitmap.getBoundingClientRect().left) / me._scaleRatio;
		scaledMouse.clientY = (event.clientY - me.bitmap.getBoundingClientRect().top) / me._scaleRatio;
		// return me.scaledMouse;
	}

	var mouse_down = function(event) {
		ratioEvent(event);
		mouse.id = 1;
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		mouse.dx = mouse.dy = 0;
		me.mouse_onDown(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onDown(mouse, me.activeScene);
			}
		}
	}
	var mouse_move = function(event) {
		ratioEvent(event);
		mouse.dx = mouse.x - (scaledMouse.clientX + me.camera.x);
		mouse.dy = mouse.y - (scaledMouse.clientY + me.camera.y);
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onMove(mouse, me.activeScene);
			}
		}

	}
	var mouse_release = function(event) {
		me.mouse_onUp(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onUp(mouse, me.activeScene);
			}
		}
		mouse.id = 0;
	}
	if (this._mouseWindow) {
		document.addEventListener("mousedown", mouse_down, false);
		document.addEventListener("mousemove", mouse_move, false);
		document.addEventListener("mouseup", mouse_release, false);
		document.addEventListener("mouseout", mouse_release, false);
	} else {
		this.bitmap.addEventListener("mousedown", mouse_down, false);
		this.bitmap.addEventListener("mousemove", mouse_move, false);
		this.bitmap.addEventListener("mouseup", mouse_release, false);
		this.bitmap.addEventListener("mouseout", mouse_release, false);
	}

	/* touch events*/
	
	var touches = {}
	var touchID = 0;
	var events = [];
	var Event = {};
	var length = 0;

	var finger_press = function(event) {
		event.preventDefault();
		length =  event.targetTouches.length
		for (var i = 0; i != length; i++) {
			touchID = event.targetTouches[i].identifier;
			ratioEvent(event.targetTouches[i]);
			touches[touchID] = {};
			touches[touchID].id = touchID; // so we can allow multiple drags at once, without requiring a hit (for fast drags that cause the user to outrun the button)
			touches[touchID].x = scaledMouse.clientX + me.camera.x;
			touches[touchID].y = scaledMouse.clientY + me.camera.y;
			touches[touchID].dx = 0;
			touches[touchID].dy = 0;
			me.mouse_onDown(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onDown(touches[touchID], me.activeScene);
				}
			}
		}
	}

	var finger_move = function(event) {
		event.preventDefault();
		length =  event.targetTouches.length
		for (var i = 0; i != length; i++) {
			touchID = event.targetTouches[i].identifier;
			ratioEvent(event.targetTouches[i]);
			touches[touchID].dx = touches[touchID].x - scaledMouse.clientX;
			touches[touchID].dy = touches[touchID].y - scaledMouse.clientY;
			touches[touchID].x = scaledMouse.clientX + me.camera.x;
			touches[touchID].y = scaledMouse.clientY + me.camera.y;
			me.mouse_onMove(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onMove(touches[touchID], me.activeScene);
				}
			}
		}
	}
	
	var finger_release = function(event) {
		event.preventDefault();
		length =  event.changedTouches.length
		for (var i = 0; i != length; i++) {
			touchID = event.changedTouches[i].identifier;
			me.mouse_onUp(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onUp(touches[touchID], me.activeScene);
				}
			}
			delete touches[touchID];
		}
	}


	if (!window.ejecta) {
		this.bitmap.addEventListener("touchstart", finger_press, false);
		this.bitmap.addEventListener("touchmove", finger_move, false);
		this.bitmap.addEventListener("touchend", finger_release, false);
		this.bitmap.addEventListener("touchcancel", finger_release, false);
		this.bitmap.addEventListener("pointerdown", mouse_down, false);
		this.bitmap.addEventListener("pointermove", mouse_move, false);
		this.bitmap.addEventListener("pointerup", mouse_release, false);
		this.bitmap.setAttribute('tabindex', '0');
		this.bitmap.focus();
	} else {
		document.addEventListener("touchstart", finger_press, false);
		document.addEventListener("touchmove", finger_move, false);
		document.addEventListener("touchend", finger_release, false);
		document.addEventListener("touchcancel", finger_release, false);
	}
}



Studio.getAudioContext = function() {
	if (typeof AudioContext !== 'undefined') {
		return new AudioContext()
	} else if (typeof webkitAudioContext !== 'undefined') {
		return new webkitAudioContext()
	} else {
		return false
	}
}

Studio.Sounds = {
	source: null,
	context: Studio.getAudioContext(),
	soundGraph: function soundGraph(snd) {
		if (snd._time == Studio.now) {
			// playing the same soundbuffer at the exact same time causes errors and horrible distortion
			// we make sure not to let that happen.
			return
		} else {
			snd._time = Studio.now
			this.source = this.context.createBufferSource()
			this.source.loop = snd.loop
			this.source.buffer = snd.data
			this.source.connect(snd._volume)
			snd._volume.connect(this._volume)
			this._volume.connect(this.context.destination)
			this.source.start(0)
		}
	},
	init: function() {
		if (this.context) {
			this._volume = this.context.createGain()
			this.volume = this._volume.gain
			this.setVolume = function(vol) {
				this.volume.value = vol
			}
			this._filter = this.context.createBiquadFilter()

		} else {
			this.setVolume = function(vol) {
				if (vol > 1) vol = 1
				if (vol < 0) vol = 0
				for (var i in this.assets) {
					this.assets[i].volume = vol
				}
			}
		}
		var mute = document.createElement('div')
		mute.innerHTML = 'Enable Sound'
		mute.ontouchend = function() {
			song.play()
		}
		// document.body.appendChild(mute)
	}
}

Studio.Sounds.init()

Studio.Sound = function(path) {
	this.snd = {_time: 0, data: null, loop: false, volume: 1}
	this.ready = false
	if (path) {
		this.load(path)
	}
}

Studio.inherit(Studio.Sound, Studio.Messenger)

Studio.Sound.prototype.load = function(path) {
	var me = this

	if (!Studio.assets[path]) {
		if (Studio.Sounds.context) {
			var request = new XMLHttpRequest()
			request.open('GET', path, true)
			request.responseType = 'arraybuffer'
			request.onload = function() {
				Studio.assets[path] = request.response
				me.snd._data = Studio.assets[path]
				me.snd._volume = Studio.Sounds.context.createGain()
				me.snd.volume = me.snd._volume.gain
				me.snd.volume.value = 1
				Studio.Sounds.context.decodeAudioData(me.snd._data, function(soundBuffer) {
					me.snd.data = soundBuffer
					Studio._loadedAsset()
					me.ready = true
					me.sendMessage('ready', me.ready)
				})
			}
			Studio._addingAsset()
			request.send()
		} else {
			var temp = document.createElement('audio')
			temp.src = path
			temp.load()
			Studio.assets[path] = temp
			me.snd.data = Studio.assets[path]
		}
	} else {
		me.snd.data = Studio.assets[path]
	}
}

Studio.Sound.prototype.play = function() {
	if (this.snd.data) {
		if (Studio.Sounds.context) {
			Studio.Sounds.soundGraph(this.snd)
		} else {
			this.snd.data.play()
			this.snd.data.loop = this.snd.loop
		}
	} else {
		console.log('Sound file not ready.')
	}
}

Studio.Sound.prototype.volume = function(val) {

}
Studio.Sound.prototype.loop = function(set) {
	this.snd.loop = set
}

// Studio.SoundManager = function(){
// 	this.source = null
// 	this.context = Studio.getAudioContext();
// 	this.init();
// }
// Studio.SoundManager.prototype = {
// 	constructor: Studio.SoundManager,
// 	soundGraph: function soundGraph(snd) {
// 		if (snd._time == Studio.now ) {
// 			// playing the same soundbuffer at the exact same time causes errors and horrible distortion
// 			// we make sure not to let that happen.
// 			return;
// 		} else {
// 			snd._time = Studio.now;
// 			this.source = this.context.createBufferSource();
// 			this.source.buffer = snd.data;
// 			this.source.connect(this._volume);
// 			this._volume.connect(this.context.destination);
// 			this.source.start(0);
// 		}
// 	},
// 	init: function(){
// 		if(this.context){
// 			this._volume = this.context.createGain();
// 			this.volume = this._volume.gain;
// 			this.setVolume = function(vol){
// 				this.volume.value = vol;
// 			}
// 		}else{
// 			this.setVolume = function(vol){
// 				if(vol>1) vol = 1
// 				if(vol<0) vol = 0
// 				for( var i in this.assets){
// 					this.assets[i].volume = vol;
// 				}
// 			}
// 		}
// 	},
// 	createSound: function(path){
// 		var sound;
// 		if (Studio.assets[path]) {
// 			console.warn('Already loaded : ', path, Studio.assets[path])
// 			sound = Studio.assets[path]
// 			sound.ready = true
// 			sound.status.setStatus(this.ready)
// 			return sound
// 		} else {
// 			Studio.assets.length++
// 			if (this.context) {
// 				var request = new XMLHttpRequest();
// 				request.open("GET", path, true);
// 				request.responseType = "arraybuffer";
// 				request.onload = function() {
// 					Studio.assets[path] = request.response;
// 					me.snd._data = Studio.Sounds.assets[path];
// 					Studio.Sounds.context.decodeAudioData(me.snd._data,function(soundBuffer){
// 						me.snd.data = soundBuffer;
// 					})
// 				};
// 				request.send();
// 			} else {
// 				var temp = document.createElement('audio');
// 				temp.src = path;
// 				temp.load();
// 				Studio.Sounds.assets[path] = temp;
// 				me.snd.data = Studio.Sounds.assets[path];
// 			}
// 			Studio.queue++
// 		}
// 	}
// }

// var SS = new Studio.SoundManager();



var GAMEPAD = new Studio.Plugin({
	options: {
	},
	init: function GamePad_init(a) {
		this.gamepad = null;
		for(var i = 0; i<= 3; i++){ // we create the objects for gamepads even if we can't use them.
			a['GAMEPAD_'+i] = {active:false, AXES1:{X:0,Y:0}, AXES2:{X:0,Y:0}};
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
	        	if(!stage['GAMEPAD_'+i].active){
		    		stage['GAMEPAD_'+i].active = true;
		    		stage['GAMEPAD_'+i].id = this.gamepads[i].id;
		    		if(stage.gamepadconnected){
		    			stage.gamepadconnected(i,this.gamepads[i])
		    		}
		    	}
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

	            if(this.gamepad.axes){
	            	 pad['AXES1'].X = this.gamepad.axes[0];
	            	 pad['AXES1'].Y = this.gamepad.axes[1];
	            	 pad['AXES2'].X = this.gamepad.axes[2];
	            	 pad['AXES2'].Y = this.gamepad.axes[3];
	            }
	   		}else if(stage['GAMEPAD_'+i].active){
		    	stage['GAMEPAD_'+i].active = false;
		    	if(stage.gamepaddisconnected){
	    			stage.gamepaddisconnected(i,this.gamepads[i])
	    		}
		    }
	    }
	    // if(this.gamepads[0]){
	    // 	stage.keys['DOWN'] = this.gamepads[0].buttons[13].value;
	    // 	stage.keys['UP'] = this.gamepads[0].buttons[12].value;
	    // 	stage.keys['A'] = this.gamepads[0].buttons[0].value;
	    // 	stage.keys['B'] = this.gamepads[0].buttons[1].value;
	    // 	stage.keys['LEFT'] = this.gamepads[0].buttons[14].value;
	    // 	stage.keys['RIGHT'] = this.gamepads[0].buttons[15].value;
	    // }
	}
})



Studio.DOMElement = function(id, stage) {
	this.element = document.getElementById(id)
	this.id = id
	var style = this.element.style
	style.position = 'absolute'
	this.width = this._width = 0
	this.height = this._height = 0
	style.top = this.y = parseFloat(style.top) || 0
	style.top = this.x = parseFloat(style.left) || 0
	style.transformOrigin = '0 0 0'
	this.alpha = style.opacity || 1
	this.stage = stage
}

Studio.inherit(Studio.DOMElement, Studio.DisplayObject)

Studio.DOMElement.prototype.hide = function() {
	this.element.style.display = 'none'
}
Studio.DOMElement.prototype.show = function() {
	this.element.style.display = 'block'
}
Studio.DOMElement.prototype.draw = Studio.DOMElement.prototype.vertex_children = function() {
	if (!this.active) return
	if (this.__alpha) this.element.style.opacity = this.alpha
	if (this.__x) {
		this.element.style.left = '0'
		this.element.style.transform = 'translate(' + (((this.__x-this.stage.camera.x) * this.stage.camera.scaleX)+this.stage.camera.focus.x) + 'px, ' + (((this.__y-this.stage.camera.y) * this.stage.camera.scaleY)+this.stage.camera.focus.y) + 'px) rotate('+ this._world.rotation+'deg) scale(' + this.scaleX*this.stage.camera.scaleX + ')'
	}
	if (this.__z) this.element.style.z_index = this.__z
}


// @codekit-prepend "studio"

