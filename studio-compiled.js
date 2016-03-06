// These are used to enable compatablity with older browsers.
// The canvas rendering engine will even work on an original iPhone running iOS 3.1 (13 sprites / 24 fps)
//

if (!window.console) {
	var console = {
		log: function() {},
		warn: function() {},
	};
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	console.warn('This browser does not support Object.keys() . Using polyfill instead.');
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
			dontEnumsLength = dontEnums.length;

		return function(obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
			throw new TypeError('Object.keys called on non-object');
		}

		var result = [], prop, i;

		for (prop in obj) {
			if (hasOwnProperty.call(obj, prop)) {
				result.push(prop);
			}
		}

		if (hasDontEnumBug) {
			for (i = 0; i < dontEnumsLength; i++) {
				if (hasOwnProperty.call(obj, dontEnums[i])) {
					result.push(dontEnums[i]);
				}
			}
		}
		return result;
	};
	}());
}

if (typeof Object.create !== 'function') {
	console.warn('This browser does not support Object.create() . Using polyfill instead.');
	Object.create = (function() {
		var Temp = function() {};
		return function(prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			if (typeof prototype !== 'object') {
				throw new TypeError('Argument must be an object');
			}
			Temp.prototype = prototype;
			var result = new Temp();
			Temp.prototype = null;
			return result;
		};
	})();
}

(function() {
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		console.warn('This browser does not support requestAnimationFrame() . Using setTimeout() instead.');
		window.requestAnimationFrame = function(callback) {
			var id = window.setTimeout(function() {
				callback(performance.now());
			}, 1000 / 60);
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());



// @codekit-prepend "Studio/Requirements.js"

// @codekit-append "Studio/Components/Box.js"
// @codekit-append "Studio/Components/Color.js"
// @codekit-append "Studio/Components/DisplayProperty.js"

// @codekit-append "Studio/Components/LinkedList.js"
// @codekit-append "Studio/Components/Plugin.js"
// @codekit-append "Studio/Components/Image.js"
// @codekit-append "Studio/Components/Cache.js"
// @codekit-append "Studio/Components/Ease.js"

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

// @codekit-append "Studio/Effects/Standards.js"

// @codekit-append "Studio/engines/WebGL.js"
// @codekit-append "Studio/engines/Canvas.js"

// @codekit-append "Studio/Input/Keyboard.js"
// @codekit-append "Studio/Input/Touch.js"

'use strict';

// Copyright  Vincent Piel 2013.
// https://github.com/gamealchemist/Javascript-Pooling
// setupPool.
// setup a pool on the function, add a pnew method to retrieve objects
// from the pool, and add a hidden pdispose method to the instances so
// they can be sent back on the pool.
// use : MyPureJSClass.setupPool(100);
// then : var myInstance = MyPureJSClass.pnew(23, 'arg 2', ..)
function setupPool(newPoolSize) {
	//debugger;
	if (!(newPoolSize >= 0)) throw('setupPool takes a size >= 0 as argument.');
	this.pool                = this.pool || []    ;
	this.poolSize            = this.poolSize || 0 ;
	this.pnew                = pnew               ;
	if (Object.defineProperty) {
		Object.defineProperty(this.prototype, 'pdispose', {value: pdispose}) ;
	} else {
		Object.prototype.pdispose = pdispose;
	}
	// pre-fill the pool.
	while (this.poolSize < newPoolSize) { (new this()).pdispose(); }
	// reduce the pool size if new size is smaller than previous size.
	if (this.poolSize > newPoolSize) {
		this.poolSize    =  newPoolSize ;
		this.pool.length =  newPoolSize ; // allow for g.c.
	}
}

// pnew : method of the constructor function.
//        returns an instance, that might come from the pool
//        if there was some instance left,
//        or created new, if the pool was empty.
// 		  instance is initialized the same way it would be when using new
function  pnew() {
	var pnewObj  = null     ;
	if (this.poolSize !== 0) {              // the pool contains objects : grab one
		this.poolSize--  ;
		pnewObj = this.pool[this.poolSize];
		this.pool[this.poolSize] = null   ;
	} else {
		pnewObj = new this() ;             // the pool is empty : create new object
	}
	this.apply(pnewObj, arguments);           // initialize object
	return pnewObj;
}

// pdispose : release on object that will return in the pool.
//            if a dispose method exists, it will get called.
//            do not re-use a pdisposed object.
function pdispose() {
	var thisCttr = this.constructor;
	if (this.dispose) this.dispose()          ;  // Call dispose if defined
	thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool
}

if (Object.defineProperty) {
	Object.defineProperty(Function.prototype, 'setupPool', {value: setupPool});
} else {
	Function.prototype.setupPool = setupPool;
}

if (!window.Studio) {
	window.Studio = {  // alt+S = ß just for those that hate writing things out.
		stages: [],
		stage: null,
		tko: null,
		assets: {length: 0},
		queue: 0,
		progress: 0,
		sin: Math.sin,
		cos: Math.cos,
		random: Math.random,
		abs: Math.abs,
		my: {ratio: 1},
		temp: {},
		info: {displayObjects: 0},
		active: true,
		cap: 1000 / 20, // don't let the true frame rate go below 20fps, prevent huge frame skips
		draws: 0,
		loaded: true,
		version: '0.5.1',
		now: 0, // to get around Safari not supporting performance.now() you can pull in the timestap with this property.
		delta: 0,
	};
	Studio.time = 1;
	Studio.interval = null;
	Studio.browser = navigator.userAgent.toLowerCase();
	Studio.disableRAF = false;
	Studio.RAF;
}

Studio.updateProgress = function() {
	this.progress = this.queue / this.assets.length;
};

Studio.addAsset = function(path, Who) {
	if (!this.assets[path]) {
		this.assets.length += 1;
		this.assets[path] = new Who();
		this.updateProgress();
		return true;
	} else {
		console.warn('Already loaded : ', path, Studio.assets[Who]);
		return false;
	}
};

Studio.start = function(time_stamp) {
	// Studio.stage=Studio.stages[0];
	if (Studio.queue === Studio.assets.length) {
		Studio.progress = 1;
	}
	if (time_stamp) {
		Studio.now = time_stamp;
		Studio.time = time_stamp;
		Studio.RAF = requestAnimationFrame(Studio.loop);

	} else {
		Studio.RAF = requestAnimationFrame(Studio.start);
	}
};

Studio.loop = function(time_stamp) {
	Studio.tick(time_stamp);
	Studio.draws = 0;

	// for(var m = 0; m!== Studio.stages.length; m++){
	// 	Studio.stage = Studio.stages[m];
	// 	if(Studio.stage.active){
	Studio.stage.loop(Studio.delta);
	// }
	// }
	Studio.RAF = requestAnimationFrame(Studio.loop);
};

//?? what? Something is up with the time_stamp... seems like the float gets all out of whack eventually (floats suck).
// So to get the 60fps that you know is possible (check this before hand), setting the tick to be 60fps, we manage to match
// what the console (in this case Apple TV 4) is actually outputting. Quite amazed by this really.
Studio.console = function(time_stamp) {
	this.delta = 16.6666666;
	this.now += this.delta;
};

Studio.capped = function(time_stamp) {
	this.delta = time_stamp - this.now;
	this.now = time_stamp;
	this.delta = this.cap > this.delta ? this.delta : this.cap;
};

Studio.uncapped = function(time_stamp) {
	this.delta = time_stamp - this.now;
	this.now = time_stamp;
};

Studio.tick = Studio.capped;

Studio.stopTime = function() {
	//this.time = this.now();
	//this.delta = this.frameRatio = 0;
	//this.active=false;
	// console.log('STOP');
};

Studio.resetTime = function() {
	//this.active=true;
	//this.start();
	// console.log('START');
};

Studio.handleVisibilityChange = function() {
	if (document.hidden) {
		console.log('%cStudio Paused (visibilitychange)', Studio.statStyle);
		cancelAnimationFrame(Studio.RAF);
	} else {
		console.log('%cStudio Play (visibilitychange)', Studio.statStyle);
		Studio.RAF = requestAnimationFrame(Studio.start);
	}
};

document.addEventListener('visibilitychange', Studio.handleVisibilityChange, false);

Studio.z_index = function(a, b) {
	if (a.z < b.z) {
		return -1;
	}
	if (a.z > b.z) {
		return 1;
	}
	return 0;
};

Studio.round = function(x) {
	return x + 0.5 | 0;
};

// apply(obj:Object)
// this will modify or add the current object to contain the contents of the object (obj) being passed in.

Studio.apply = function(obj) { // Display Object and a few others share this function. All children of displayObject inherit this function.
	Studio.temp.keys = Object.keys(obj); // we use Studio.temp.keys to avoid creating more garbage.
	Studio.temp.keys_i = Studio.temp.keys.length;
	while (Studio.temp.keys_i) {
		Studio.temp.key = Studio.temp.keys[Studio.temp.keys_i - 1];
		this[Studio.temp.key] = obj[Studio.temp.key];
		Studio.temp.keys_i--;
	}
	return this;
};

// addTo()

Studio.addTo = function(a, b) {
	for (var attr in b) {
		if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
			a[attr] = b[attr];
		}
	}
};

// Studio.extend(a,b)
// A : the New Class
// B : Class to inherit attributes from.

Studio.extend = function(A, B) {
	A.prototype = new B();
	A.prototype.constructor = A;
};

Studio.Messanger = function() {
	this.listeners = [];
	this.status = 0;
};

Studio.Messanger.prototype.addListener = function(callback) {
	this.listeners.push(callback);
	// reply back with current status when adding new listener.
	callback(this.status);
};

Studio.Messanger.prototype.setStatus = function(message) {
	this.status = message;
	// now lets tell everyone that listens.
	for (var i = 0; i < this.listeners.length; i++) {
		this.listeners[i](this.status);
	}
};

Studio.TOP = Studio.LEFT = 0;
Studio.MIDDLE = Studio.CENTER = 0.5;
Studio.BOTTOM = Studio.RIGHT = 1;

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff';
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;';
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;';
Studio.statStyle = 'background-color: #eee; padding: 2px 4px; color: #555; font-size: 10px';
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af';



Studio.Box = function(left, top, width, height) {
	this.left = left || 0;
	this.top = top || 0;
	this.right = left + width || 1;
	this.bottom = top + height || 1;
	return this;
};

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.left = left || this.left;
		this.top = top || this.top;
		this.right = left + width || this.right;
		this.bottom = top + height || this.bottom;
	},
	get_bounds: function(who) {
		// if(who._rotation){
		// this.get_rotated_bounds(who);
		// }else{
		this.get_straight_bounds(who);
		// }
	},
	get_straight_bounds: function(who) {
		this.left = who._dx - who._world.width * who.anchorX;
		this.right = this.left + who._world.width;
		this.top = who._dy - who._world.height * who.anchorY;
		this.bottom = this.top + who._world.height;
	},
	get_rotated_bounds: function(who) {
		this.left = who._world.x - who._world.width * who.anchorX * 2;
		this.right = this.left + who._world.width * 3;
		this.top = who._world.y - who._world.height * who.anchorY * 3;
		this.bottom = this.top + who._world.height * 2;
	},
};


Studio.Color = function(r, g, b, a) {
	this.r = r / 255 || 0;
	this.g = g / 255 || 0;
	this.b = b / 255 || 0;
	this.a = a || 1;
	this.style = 'rgba(255,255,255,1)';

	this._build_style();
	return this;
};

Studio.Color.prototype = {
	constructor: Studio.Color,
	set: function(r, g, b, a) {
		this.r = r / 255;
		this.g = g / 255;
		this.b = b / 255;
		this.a = a;
		this._build_style();
		return this;
	},
	red: function(v) {
		this.r = v;
		return this;
	},
	green: function(v) {
		this.g = v;
		return this;
	},
	blue: function(v) {
		this.b = v;
		return this;
	},
	alpha: function(v) {
		this.a = v;
		return this;
	},
	build: function() {
		this._build_style();
		return this;
	},
	setFromHex: function(hex) {
		// if the hex value comes in as shorthand '#333', we should double the values.
		if (hex.length === 4) {
			hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + 'ff';
		}
		// if the hex doesn't contain an alpha value lets assume its 'ff'.
		if (hex.length === 7) {
			hex += 'ff';
		}
		// take each value besides [0] an convert it to RGBA since that works for both Canvas and WebGL
		this.set('0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0, ('0x' + hex[7] + hex[8] | 0) / 255);
		return this;
	},
	_build_style: function() {
		this.style = 'rgba(' + parseInt(this.r * 255) + ',' + parseInt(this.g * 255) + ',' + parseInt(this.b * 255) + ',' + this.a + ')';
	}
};

Studio.RED = new Studio.Color(204, 0, 17, 1);
Studio.YELLOW = new Studio.Color(255, 221, 34, 1);
Studio.BLUE = new Studio.Color(51, 170, 255, 1);


/**
 * DisplayProperty
 */

Studio.DisplayProperty = function() {
	this.x        = 0;
	this.y        = 0;
	this.z        = 0;
	this.height   = 1;
	this.width    = 1;
	this.scaleX   = 1;
	this.scaleY   = 1;
	this.rotation = 0;
	this.angle 	  = 0;
	this.alpha 	  = 1;
	this.speed 	  = 1;
};

Studio.DisplayProperty.prototype = {
	constructor: Studio.DisplayProperty,
	apply: Studio.apply
};


var LinkedList = function() {
	this.first 	= 	null;
	this.last	= 	null;
	this.length = 	0;
};

LinkedList.prototype = {
	add: function(who) {
		// who.parent = this.parent;

		this.length++; // add to our length so we can easily tell how big our list is.
		if (this.length <= 1 && this.first === null && this.last === null) {
			this.first = who;
			this.last = who;
			who.prev = null;
			this.length = 1;
			return who;
		}
		// this.first.prev = who;
		this.last.next = who; // we add the new item to the previously last item.
		who.prev = this.last; // we mark the new items previous to be the last item in the list.
		this.last = who; // we have a new last item now.
		return who;
	},
	addItems: function(who){
		for (var i = 0; i !== arguments.length; i++) {
			this.add(arguments[i]);
		}
	},
	insert: function(a, b) {
		this.length++;
		a.prev = b;
		if (b !== this.last) {
			b.next = a;
		} else {
			this.last = a;
			a.next = this.first;
		}
	},
	init: function() {
		this.next	=	null;
		this.prev	=	null;
		this.first 	= 	null;
		this.last	= 	null;
		this.length = 	0;
	},
	remove: function(who) {
		if (this.length === 1) {
			this.init();
			who.next = null;
			who.prev = null;
			return; // nothing to see here lets move on.
		}
		// check for the begining or the end of the list
		if (this.first === who) {
			this.first = this.first.next;
		} else if (this.last === who) {
			this.last = this.last.prev;
		}

		// debugger;
		if (who.prev) {
			who.prev.next = who.next;
		}
		if (who.next) {
			who.next.prev = who.prev;
		}

		who.next = null;
		who.prev = null;

		if (this.first === null) {
			this.last = null;
		}
		this.length--;
	},
	update: function(r, d) {
		var listItem = this.first;
		while (listItem) {
			// while we still have a list item lets do some fun stuff.

			this.next = listItem.next;
			// we need to hold on to the next in line.
			// WHY: I've been known to delete an object in the list
			// thus causing listItem.next to return null.
			// By saving this reference we can always continue on
			// through the list.

			listItem.update(r, d);
			// lets perform the objects update function.

			listItem = listItem.next || this.next;
			// if the item has a next lets use it. otherwise lets use the one we saved
			// just for this occassion. If both are null thats fine to.
			// we really are at the end of the list.
		}
	},
	render: function(e, f) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem._delta(f);
			listItem.render(e, f);
			listItem = listItem.next || this.next;
		}
	},
	action: function(what) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem[what]();
			listItem = listItem.next || this.next;
		}
	},
	removeAll: function(exception) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			if (this.pdispose) {
				this.pdispose();
			}
			this.remove(listItem);
			listItem = listItem.next || this.next;
		}
		listItem = null;
		if (exception) {
			this.add(exception);
		}
	},
	toString: function() {
		var listItem = this.first;
		var toString = 'linked list : [';
		while (listItem) {
			toString += listItem;
			listItem = listItem.next;
		}
		toString += '];';
	},
	constructor: LinkedList
};


Studio.Plugin = function(attr) {
	this.init = null;
	this.options = {};
	this.action = null;

	this.apply(attr);
};

Studio.Plugin.constructor = Studio.Plugin;

Studio.Plugin.prototype.apply = Studio.apply;

Studio.Plugin.prototype._options = function(a) {
	for (var i in a) {
		this.options[i] = a[i];
	}
};


/**
 * Image
 */

Studio.Image = function(path) {
	this.image = null;
	this.path = null;
	if (path) {
		this.loadImage(path);
	}
	this.status = new Studio.Messanger();
};

Studio.Image.prototype.constructor = Studio.Image;

Studio.Image.prototype.ready = false;
Studio.Image.prototype.height = 1;
Studio.Image.prototype.width = 1;

Studio.Image.prototype.loadImage = function(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who]);
		this.image = Studio.assets[who];
		this.ready = true;
		this.status.setStatus(this.ready);
		return this;
	} else {
		//Studio.loaded=Studio.loadOnDemand;
		Studio.assets[who] = new Image();
		Studio.assets.length++;
		var newAsset = this;
		Studio.assets[who].onload = function() { // could have Event passed in
			Studio.queue++;
			Studio.progress = Studio.queue / Studio.assets.length;
			newAsset.ready = true;
			newAsset.status.setStatus(newAsset.ready);
			newAsset.height = this.height;
			newAsset.width = this.width;

			if (Studio.queue === Studio.assets.length) {
				Studio.loaded = true;
			}
			return newAsset;
		};
		Studio.assets[who].src = who;
		this.image = Studio.assets[who];
	}
};


Studio.Cache = function(width, height, resolution) {
	var resolution = resolution || 1;

	this.image = document.createElement('canvas');
	this.image.width = width * resolution || 512;
	this.image.height = height * resolution || 512;
	this.width = width;
	this.height = height;
	this.ready = false;
	this.ctx = this.image.getContext('2d');
	this.ctx.scale(resolution, resolution);
};

Studio.extend(Studio.Cache, Studio.Image);


Studio.Ease = {};

Studio.Ease.linear = function(t) {
	return t;
};

Studio.Ease.snap = function(t) {
	return t + 0.5 | 0;
};

Studio.Ease.chillInOut = function(t) {
	var s = 0.75 ;
	if ((t *= 2) < 1) {
		return 0.5 * (t * t * ((s + 1) * t - s));
	}
	return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};

Studio.Ease.backOut = function(t) {
	var s = 1.70158;
	return --t * t * ((s + 1) * t + s) + 1;
};

Studio.Ease.bounceOut = function(t) {
	if (t < (0.363636)) {
		return 7.5625 * t * t;
	} else if (t < 0.727272) {
		return 7.5625 * (t -= (0.545454)) * t + 0.75;
	} else if (t < 0.909090) {
		return 7.5625 * (t -= (0.818181)) * t + 0.9375;
	} else {
		return 7.5625 * (t -= (0.959595)) * t + 0.984375;
	}
};

Studio.Ease.elasticOut = function(t) {
	var s, a = 0.1, p = 0.4;
	if (t === 0) {
		return 0;
	}
	if (t === 1) {
		return 1;
	}
	if (!a || a < 1) {
		a = 1; s = p / 4;
	} else {
		s = p * Math.asin(1 / a) / (6.283);
	}
	return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (6.283) / p) + 1);
};

Studio.Ease.linearRandom = function(t) {
	return Math.random() * t;
};

Studio.Ease.random = function() {
	return Math.random();
};

Studio.Ease.shake = function() {
	return Math.random()-.5;
};

Studio.Ease.quadIn = function(t) {
	return t * t;
};

Studio.Ease.quadOut = function(t) {
	return t * (2 - t);
};

Studio.Ease.quadInOut = function(t) {
	if ((t *= 2) < 1) {
		return 0.5 * t * t;
	}
	return -0.5 * (--t * (t - 2) - 1);
};


/**
 * DisplayObject
 * The base for all visual objects in the studio.
 */

Studio.DisplayObject = function(attr) {
	// Dimensional Settings:
	this.x        = 0;
	this.y        = 0;
	this.z        = 0;
	this.height   = 1;
	this.width    = 1;
	this.scaleX   = 1;
	this.scaleY   = 1;
	this.anchorX  = 0.5;
	this.anchorY  = 0.5;
	this.rotation = 0;

	// Display Settings:
	this.alpha   = 1; // sets the opacity/alpha of an object
	this.visible = 1; // invisible items are ignored when rendering
	this.speed   = 1; // the local speed of an object
	this.active  = 1; // set as inactive, and we never try to render
	// or update this or its children. Use this to
	// manually pool objects

	// Rotation Settings:
	this.orbits = true;
	this.orbit = 0;
	this.inheritRotation = true;
	this.orbit_speed = 1;

	// set attributes if provided.
	if (attr) {
		this.apply(attr);
	}
	this._boundingBox = new Studio.Box();
	this._alpha = this.alpha;
	this._visible = this.alpha * this.visible; // if either value = 0 we wont draw it to the screen... save some cycles.
	// Children Information
	// to save memory we don't include a default child container. This will be
	// created if one is need.
	this.parent = null;
	this.hasChildren = 0; // we use this as a quick flag to let us know if we
	// should even think about looking for children
	// objects. It also stores our length.

	// set any of these to false if you know they will never be needed.
	// this will increase performace, by reducing calculations done per object per frame.

	this.__x = this._world.x;
	this.__y = this._world.y;
	this._dx = this._world.x;
	this._dy = this._world.y;
};

Studio.difference={};

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
			this.children = []; // if we didn't use 'hasOwnProperty', we would learn that JS treats [] like pointers and in this particular case will cause a crash.
		}
		if (!this.hasOwnProperty('_world')) {
			this._world = new Studio.DisplayProperty();
			this._initWorld();
		}
		if (!child.hasOwnProperty('_world')) {
			// This child is missing _world = new Studio.DisplayProperty(); the code will still run, but it is very likely to act in unexpected ways. Lets fix this.
			child._world = new Studio.DisplayProperty();
		}
		child.parent = this._world;
		this.children[this.hasChildren] = child;
		this.hasChildren++;
		child.force_update();
		child._dset();
		if(child.hasChildren){
			child.force_update_children();
		}
		return this;
	},
	_initWorld: function(){
		this._world.x = this.x;
		this._world.y = this.y;
		this._world.y = this.y;
		this._world.z = this.z;
		this._world.height = this.height;
		this._world.width = this.width;
		this._world.scaleX = this.scaleX;
		this._world.scaleY = this.scaleY;
		this._world.rotation = this.rotation;
		this._world.angle = this.angle;
		this._world.alpha = this.alpha;
		this._world.speed = this.speed;
	},
	addChildren: function() {
		// This will take a series of objects and add them to this object
		// as children. We simply call the addChild function multiple times.
		for (var i = 0; i !== arguments.length; i++) {
			this.addChild(arguments[i]);
		}
		return this;
	},
	getChildByName: function(name) {
		// this will look for a named object and return it. If your using
		// names (names are not required).
		for (var i = 0; i !== this.hasChildren; i++) {
			if (this.children[i].name === name) {
				return this.children[i];
			}
		}
		return null;
	},
	_destroy: function() {
		for (var i in this) {
			if (!this.hasOwnProperty(i)) {
				delete this[i];
			}
		}
	},
	_order: function() {
		this.children.sort(Studio.z_index);
	},
	draw: function() {
	},
	snapPixels: function() {
		this._dx = this._dx + 0 | 0;
		this._dy = this._dy + 0 | 0;
		this._world.height = this._world.height + 0 | 0;
		this._world.width = this._world.width + 0 | 0;
	},
	hitTestPoint: function(x, y) {
		this._relativeX = x - this._world.x;
		this._relativeY = y - this._world.y;
		this.anchoredX = this.anchorX * this._world.width;
		this.anchoredY = this.anchorY * this._world.height;
		if (this._relativeX < -this.anchoredX && this._relativeY < -this.anchoredY) {
			return false;
		}
		if (this._relativeX > this.width && this._relativeY > this.height) {
			return false;
		}
		if (this._world.rotation) {
			x = (this._relativeX * Math.cos(-this.angle)) - (this._relativeY * Math.sin(-this.angle));
			y = (this._relativeX * Math.sin(-this.angle)) + (this._relativeY * Math.cos(-this.angle));
			this._relativeX = x;
			this._relativeY = y;
		}

		if ((this._relativeX > -this.anchoredX && this._relativeY > -this.anchoredY) && (this._relativeX < (this._world.width) - this.anchoredX && this._relativeY < (this._world.height) - this.anchoredY)) {
			return true;
		}
		return false;
	},
	hitTestRect: function(b) {
		Studio.difference.height = this._world.height + b._world.height;
		Studio.difference.width = this._world.width + b._world.width;
		Studio.difference.x = this._world.x - (this._world.width * this.anchorX) - b._world.x - (b._world.width * b.anchorX);
		Studio.difference.y = this._world.y - (this._world.height * this.anchorY) - b._world.y - (b._world.height * b.anchorY);
		
		// stage.ctx.strokeRect(Studio.difference.x,Studio.difference.y,Studio.difference.width,Studio.difference.height)

		if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
			return true;
		}
		return false;
	},
	vertex_children: function(stage, ratio, interpolate) {
		if (this.hasChildren) {
			for (var i = 0; i !== this.hasChildren; i++) {
				this.children[i].buildElement(stage, ratio, interpolate);
				// this.children[i].buildTriangles(stage,ratio);
			}
		}
	},
	render_children: function(stage, ratio, interpolate) {
		if (this.hasChildren) {
			for (var i = 0; i !== this.hasChildren; i++) {
				this.children[i].render(stage, ratio, interpolate);
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
			if(interpolate){
				this._delta(ratio);
			}else{
				this._dset();
			}
			if (stage.snap) {
				this.snapPixels();
			}
			this.draw(stage.ctx);
			// }
			this.render_children(stage, ratio, interpolate);
		}
		if (this.onExitFrame) {
			this.onExitFrame();
		}
	},
	update_visibility: function() {
		this._world.alpha = this.alpha * this.parent.alpha;
		//if(this._alpha > 0){
		this._visible = this._world.alpha * this.visible;
		// }else{
		// 	this._visible = false;
		// }

	},
	setAlpha: function(ctx) {
		if (this._world.alpha !== ctx.globalAlpha && this._visible) {
			ctx.globalAlpha = this._world.alpha;
		}
		if (this.blendmode !== ctx.globalCompositeOperation && this._visible) {
			ctx.globalCompositeOperation = this.blendmode;
		}
	},
	update_scale: function() {
		this._world.scaleX  = this.parent.scaleX * this.scaleX;
		this._world.scaleY  = this.parent.scaleY * this.scaleY;
	},
	update_dimensions: function() {
		this._world.width = this.width * this._world.scaleX;
		this._world.height = this.height * this._world.scaleY;
	},
	update_angle: function() {
		this.angle = (this._world.rotation / 180 * 3.14159265);
	},
	update_speed: function() {
		this._world.speed = this.speed * this.parent.speed;
	},
	orbitXY: function() {
		var x = this.x * this._world.scaleX;
		var y = this.y * this._world.scaleY;
		var sin = Studio.sin((this.parent.angle + this.orbit) * this.orbit_speed);
		var cos = Studio.cos((this.parent.angle + this.orbit) * this.orbit_speed);
		this._orbitX = (x * cos) - (y * sin);
		this._orbitY = (x * sin) + (y * cos);
	},
	update_rotation: function() {
		if (this.inheritRotation) {
			this._world.rotation = this.parent.rotation + this.rotation;
		} else {
			this._world.rotation = this.rotation;
		}
		if (this._world.rotation) {
			this.update_angle();
		} else {
			this.angle = 0;
		}
	},
	update_orbit_xy: function() {
		this.orbitXY();
		this._world.x = this._orbitX + this.parent.x;
		this._world.y = this._orbitY + this.parent.y;
	},
	update_xy: function() {
		if (this.orbits && this.parent.angle) {
			this.update_orbit_xy();
		} else {
			this._world.x  = (this.x * this.parent.scaleX) + this.parent.x;
			this._world.y  = (this.y * this.parent.scaleY) + this.parent.y;
		}
	},
	snapshot: function() {
		this.__x = this._world.x;
		this.__y = this._world.y;
		this.__width = this._world.width;
		this.__height = this._world.height;
		if (this._world.rotation) {
			this._world.angle = this.angle;
		}
	},
	__delta: function(snap, cur, ratio) {
		return snap + ((cur - snap) * ratio);
	},
	_delta: function(ratio) {
		this._dx = this.__delta(this.__x, this._world.x, ratio);
		this._dy = this.__delta(this.__y, this._world.y, ratio);
		this._dwidth = this.__delta(this.__width, this._world.width, ratio);
		this._dheight = this.__delta(this.__height, this._world.height, ratio);
		if (this._world.rotation) {
			this._dAngle = this.__delta(this._world.angle, this.angle, ratio);
		}

	},
	_dset: function() {
		this._dx = this._world.x;
		this._dy = this._world.y;
		this._dwidth = this._world.width;
		this._dheight = this._world.height;
		if (this._world.rotation) {
			this._dAngle = this.parent.angle+this.angle;
		}
	},
	_snapback: function() {
		this.force_update();
	},
	force_update: function() {
		this.update_visibility();
		this.update_scale();
		this.update_speed();
		this.update_dimensions();
		this.update_rotation();
		this.update_xy();
		this.snapshot();
	},
	force_update_children: function(interpolate) {
		for (var i = 0; i !== this.hasChildren; i++) {
			this.children[i].force_update();
		}
		for (var i = 0; i !== this.hasChildren; i++) {
			this.children[i]._dset();
		}
	},
	_update: function(interpolate) {
		if (this.__update_ALPHA) {
			this.update_visibility();
		}
		if (this._visible) {
			if (this.__update_SCALE) {
				this.update_scale();
			}
			if (this.__update_SPEED) {
				this.update_speed();
			}
			if (this.__update_DIMENSIONS) {
				this.update_dimensions();
			}
			if (this.__update_ROTATION) {
				this.update_rotation();
			}
			if (this.__update_XY) {
				this.update_xy();
			}
			this.update_children(interpolate);
		}
	},
	update_children: function(interpolate) {
		if (!this.hasChildren) {
			return;
		}
		for (var i = 0; i !== this.hasChildren; i++) {
			this.children[i].update(interpolate);
		}
	},
	logic_children: function() {
		if (!this.hasChildren) {
			return;
		}
		for (var i = 0; i !== this.hasChildren; i++) {
			if(this.children[i].logic){
				this.children[i].logic();
			}	
		}
	},
	_logic: function(){
		if (this.onEnterFrame) {
			this.onEnterFrame();
		}
		if(this.logic){
			this.logic();
		}
		this.logic_children();
	},
	setAnchor: function(x,y){
		this.anchorX = x;
		this.anchorY = y || x;
	},
	update: function( interpolate ) {
		if ( interpolate ){
			this.snapshot();
		}
		this._logic();
		this._update(interpolate);
	}
};


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

Studio.extend(Studio.DisplayList,Studio.DisplayObject);

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
	this.render(this,1);
	this.cached = true;
};
Studio.DisplayList.prototype._cacheIt = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.render(this,1);
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
	who.parent = this;

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
	this.color = new Studio.Color(1, 0, 0, 0);
	this.slice = new Studio.Box(10, 0, 0, 0);
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Rect, Studio.DisplayObject);

Studio.Rect.prototype.addVert = function(gl, x, y, z, tx, ty) {
	gl._batch[gl._count++] = x;
	gl._batch[gl._count++] = y;
	// gl._batch[gl._count+2] = 1;
	gl._batch[gl._count++] = this.color.r;
	gl._batch[gl._count++] = this.color.g;
	gl._batch[gl._count++] = this.color.b;
	gl._batch[gl._count++] = this.color.a;
	gl._batch[gl._count++] = (tx);
	gl._batch[gl._count++] = (ty);
	// gl._count +=8;
};

Studio.Rect.prototype.buildElement = function(gl, ratio, interpolate) {
	if(interpolate){
		this._delta(ratio);
	}else{
		this._dset();
	}
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Rect.prototype.prepAngled = function(ctx) {
	if (this._dx || this._dy) {
		ctx.translate(this._dx, this._dy);
	}
	ctx.rotate(this._dAngle || 0);
	if (this._world.scaleX !== 1 || this._world.scaleY !== 1) {
		ctx.scale(this._world.scaleX, this._world.scaleY);
	}
};

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	// ctx.strokeRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Rect.prototype.draw = function(ctx) {
	this.setStyle(ctx);
	this.setAlpha(ctx);
	ctx.strokeStyle = '#fff';
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		// ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
		ctx.fillRect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight);
	}
};


Studio.Clip = function(attr) {
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Clip, Studio.Rect);

Studio.Clip.prototype.draw = function(ctx) {
	ctx.save();
	ctx.beginPath();
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		ctx.rect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight);
	}
	// ctx.stroke();
	ctx.clip();
};
Studio.Clip.prototype.drawAngled = function(ctx) {
	this.prepAngled(ctx);
	ctx.rect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
};


Studio.CircleClip = function(attr) {
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.CircleClip, Studio.Rect);

Studio.CircleClip.prototype.draw = function(ctx) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(this._dx, this._dy ,this._world.width / 2, 0,2 * Math.PI);
	ctx.clip();
};


Studio.Restore = function() {
};

Studio.Restore.prototype = new Studio.Rect();
Studio.Restore.prototype.constructor = Studio.Restore;

Studio.Restore.prototype.draw = function(ctx) {
	ctx.restore();
};


Studio.Circle = function(attr) {
	this.color = new Studio.Color(1, 0, 0, 0);
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Circle, Studio.Rect);

Studio.Circle.prototype.draw = function(ctx) {
	this.setStyle(ctx);
	this.setAlpha(ctx);
	ctx.beginPath();
	ctx.arc(this._world.x, this._world.y, this._world.width, 0, 2 * Math.PI);
	ctx.fill();
};


/**
 * Sprite
 */

Studio.Sprite = function(attr) {
	this.image = null;
	this.color = new Studio.Color(1, 1, 1, 1);
	this._boundingBox = new Studio.Box();
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Sprite, Studio.Rect);

Studio.Sprite.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height,  - (this.width * this.anchorX), - (this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Sprite.prototype.draw = function(ctx) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	} else {

		ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height,this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight);
	}
};

/**
 * ImageSlice
 */

Studio.ImageSlice = function(attr) {
	this.image = null;
	this.color = new Studio.Color(1, 1, 1, 1);
	this.rect = {x: 0, y: 0, height: 32, width: 32};
	this._boundingBox = new Studio.Box();
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.ImageSlice, Studio.Sprite);

Studio.ImageSlice.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.image.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height, - (this.width * this.anchorX), - (this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.ImageSlice.prototype.draw = function(ctx) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		ctx.drawImage(this.image.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY)-2, this._dwidth, this._dheight);
	}
};

/**
 * SpriteAnimation --- just like a Sprite but uses a SpriteSheet to render, and as such has frames, framerates etc...
 */ 

Studio.SpriteAnimation = function(attr) {
	this.sheet = new Studio.SpriteSheet();
	this.loop = [[0, 0]];
	this.fps = 12;
	this.frame = 0;
	this.sliceX = 0;
	this.sliceY = 0;
	this.offsetY = 0;
	this.offsetX = 0;
	this.repeat = true;
	this.startTime = 0;
	if (attr) {
		this.apply(attr);
	}
	this.setStartingFrame(this.frame);
};

Studio.extend(Studio.SpriteAnimation, Studio.Rect);

Studio.SpriteAnimation.prototype.setStartingFrame = function(a) {
	this.frame = a;
	this.startTime = Studio.time;
	this.myTime = this.startTime + (a * (1000 / this.fps));
};

Studio.SpriteAnimation.prototype.draw = function(ctx) {
	if (!this.sheet) {
		return;
	}
	if (!this.sheet.ready) {
		return;
	}
	this.setAlpha(ctx);
	ctx.drawImage(this.sheet.image, this.sheet.rect.width * this.sliceX, this.sheet.rect.height * this.sliceY, this.sheet.rect.width, this.sheet.rect.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorX), this._dwidth, this._dheight);
	if(this.borderlap && this.border){
		if(this._dx -  (this._dwidth*this.anchorX) < this.border.x){
			ctx.drawImage(this.sheet.image, this.sheet.rect.width * this.sliceX, this.sheet.rect.height * this.sliceY, this.sheet.rect.width, this.sheet.rect.height, this.border.width + this._dx - (this._dwidth*this.anchorX), this._dy - (this._dheight*this.anchorY), this._dwidth, this._dheight);
		}
		if((this._dx + this._world.width) > this.border.width){
			ctx.drawImage(this.sheet.image, this.sheet.rect.width * this.sliceX, this.sheet.rect.height * this.sliceY, this.sheet.rect.width, this.sheet.rect.height, this._dx - (this._dwidth*this.anchorX) -this.border.width, this._dy - (this._dheight*this.anchorY), this._dwidth, this._dheight); 
		}
	}
	if (this.loop.length) {
		this.updateFrame();
	}
};

Studio.SpriteAnimation.prototype.setSlice = function() {
	this.sliceX = this.loop[this.frame][0]+this.offsetX;
	this.sliceY = this.loop[this.frame][1]+this.offsetY;
};

Studio.SpriteAnimation.prototype.updateFrame = function() {
	this.myTime += Studio.delta;

	this.frame = (((this.myTime - this.startTime) * this._world.speed) / (1000 / this.fps)) | 0;

	if (this.frame >= this.loop.length) {
		this.startTime = this.myTime;
		this.frame = 0;
		if (this.onLoopComplete) {
			this.onLoopComplete.call(this);
		}
	}
	this.setSlice();
};

Studio.SpriteSheet = function(path, attr) {
	this.image = new Studio.Image();
	this.rect = {height: 32, width: 32};
	if (path) {
		this.loadImage(path);
	}
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.SpriteSheet, Studio.Image);

Studio.SpriteSheet.prototype.apply = function(obj) {
	var keys = Object.keys(obj);
	var i = keys.length;
	var key;
	while (i) {
		key = keys[i - 1];
		this[key] = obj[key];
		i--;
	}
};



/**
* Camera
* This sets what parts we should see, and how we should see them.
*/

Studio.Camera = function(stage) {
	this.stage 		= {width: stage.width, height: stage.height};
	this.tracking 	= null ;

	this.bound 		= null ;
	this.active		= true ;
};

Studio.extend(Studio.Camera,Studio.DisplayObject);

Studio.Camera.prototype.updateRect = function() {
	this.left	= -this.bound._world.x * this.scaleX;
	this.top	= -this.bound._world.y * this.scaleY;
	this.right	= this.left + (this.bound._world.width * this.scaleX - this.stage.width) ;
	this.bottom	= this.top + (this.bound._world.height * this.scaleY - this.stage.height) ;
};

Studio.Camera.prototype.update = function(stage, ratio) {
	if (this.tracking) { // are we following a DisplayObject?
		this.tracking._delta(ratio);
		this.x = (this.tracking._dx * this.scaleX) - this.stage.width / 2 ;
		this.y = (this.tracking._dy * this.scaleY) - this.stage.height / 2 ;
		// this.angle = this.tracking.angle || 0 ;
	}
	if (this.bound) { // are we bound to a DisplayObject? this can be the main stage if you want.
		this.updateRect() ;
		if (this.x < this.left) { // checking the bounds of the X coord.
			this.x = this.left ;
		} else if (this.x > this.right) {
			this.x = this.right ;
		}
		if (this.y <  this.top) { // checking the bounds of the Y coord.
			this.y = this.top ;
		} else if (this.y > this.bottom) {
			this.y = this.bottom ;
		}
	}
};

Studio.Camera.prototype.render = function(stage, ratio) {
	this.update(stage,ratio);
	if (this.x || this.y || this.scaleX !== 1 || this.scaleY !== 1) {
		stage.ctx.setTransform(stage.resolution * this.scaleX, 0, 0, stage.resolution * this.scaleY, -this.x * stage.resolution, -this.y * stage.resolution);
	}
};

Studio.Camera.prototype.track = function(who) {
	this.tracking = who;
};

Studio.Camera.prototype.bindTo = function(who) {
	this.bound = who;
};

Studio.Camera.prototype.unBind = function() {
	this.bindTo(null);
};

Studio.Camera.prototype.stopTracking = function() {
	this.track(null);
};


/**
 * Scene
 */

Studio.Scene = function(attr) {
	this.color = new Studio.Color(0,0,0,0);
	this.active = false;
	this.image = null;
	this.loader = null;
	this.assets = [];
	this.children = [];
	this.buttons = [];
	if (attr) {
		this.apply(attr);
	}
	if (this.build) {
		this.build.call(this);
	}
	if (this.init) {
		this.init.call(this);
	}
};

Studio.extend(Studio.Scene, Studio.DisplayObject);

Studio.Scene.prototype.loadAssets = function() {
	for (var i = 0; i !== arguments.length; i++) {
		this.assets.push(new Studio.Image(arguments[i]));
	}
};

Studio.Scene.prototype.addButton = function(who) {
	this.buttons.unshift(who);
};

Studio.Scene.prototype.render_children = function(stage, lag) {
	for (this.i = 0; this.i !== this.hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(stage, lag, stage.interpolate);
		}
	}
};

Studio.Scene.prototype.close = function(stage){
	this.active = false;
}
Studio.Scene.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Scene.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// return;
	if (this.image) {
		ctx.drawImage(this.image.image, this._dx, this._dy, this.width, this.height);
		return;
	}
	if (this.color) {
		if (this.color.a === 0) {
			ctx.clearRect(this._dx, this._dy, this.width, this.height);
			return;
		}
		this.setStyle(ctx);
		ctx.fillRect(this._dx, this._dy,  this.width, this.height);
		return;
	}
};


/**
 * Stage
 * Where everything plays out.
 */
Studio.Stage = function(domID, attr) {

	// a very basic check for webgl support.
	// this will probably change later.
	this.webgl = false; //!!window.WebGLRenderingContext;
	this.fullscreen = false;
	this.color = new Studio.Color(0, 0, 0, 1); // defaults to black
	this.snap = false;
	// Before we do anything we should apply any attached attributes.
	// to disable webgl even if the browser supports it:
	// you would send an object like this { webgl : false }
	// That will force the 2d context.
	if (attr) {
		this.apply(attr);
	}

	this._getCanvasElement(domID);
	this._count = 0;
	this._maxCount = 16050;
	this.dur = 1000 / 60;
	this._d = this.dur/2;
	this.resolution = window.devicePixelRatio; // defaults to device setting.
	this.interpolate = true;
	this.smoothing = true;

	if (attr) {
		this.apply(attr);
	}

	this._sizeCanvas(this.fullscreen);
	this.setPixelRatio();
	if (this.webgl) {
		this.engine = Studio.Stage.prototype.WEBGL;
	}
	this.allowPlugins();

	// We need to prepare the canvas element for use.
	// First we need to grab the appropriate context based on the engine type
	this.engine.getContext.call(this);

	// Once the context is obtained we need to fire some actions on it
	// this is mainly for webgl, since it needs shaders and programs created
	this.engine.init.call(this, this.ctx);

	// One the basic are competed by the init we can apply more changes through
	// a prep call. Again mainly used by webgl to create holders for buffers and such.
	this.engine.prep.call(this, this.ctx);

	this.render = this.engine.render;
	// This is a universal init. These are items that need to be attached to the stage
	// regardless of engine type. These include items like buttons, cameras, scenes etc...
	this._init();
	console.log('%cStudio3 v' + Studio.version + '%c' + this.engine.type, Studio.infoStyle, Studio.engineStyle);
	this.verts = 0;
	return this;
};

Studio.extend(Studio.Stage, Studio.Scene);

Studio.Stage.prototype._getCanvasElement = function(domElementID) {

	if (!domElementID) {
		// If an ID is not passed to us.
		// We will find the first Canvas element and use that.
		var temp = document.body.getElementsByTagName('canvas');
		if (!temp[0]) {
			// If we can't find a Canvas element on the page, we create one.
			this.canvas = document.createElement('canvas');
			document.body.appendChild(this.canvas);
		} else {
			// Otherwise we use the first one we see.
			this.canvas = temp[0];
		}
	} else {
		// this is the expected behavior, please provide an ID
		// it gives you control of what happens.
		this.canvas = document.getElementById(domElementID);
	}
};

Studio.Stage.prototype.setColor = function(r, g, b, a) {
	this.color.set(r, g, b, a);
	if (this.ctx.clearColor) {
		this.ctx.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
	}
};

Studio.Stage.prototype._init = function() {
	this.ready = false;
	this.autoPause = false;
	this._watching = false;
	this.children = [];
	this.buttons = [];
	this.activeScene = null;
	this.previousScene = null;
	this.camera = new Studio.Camera(this);
	this.tweens = Object.create(null);
	this.tween_length = 0;
	this.nextID = 0;
	this.anchorX = 0 ;
	this.anchorY = 0 ;
	this.active = true;
	this._pause_buttons = false;

	// Studio.stages.push(this);
	Studio.stage = this;
	return this;
};

Studio.Stage.prototype.allowPlugins = function() {
	this.plugins = Object.create(null);
	this.plugins.input = [];
	this.plugins.effect = [];
	this._effects = 0;
	this._inputs = 0;
};

Studio.Stage.prototype._sizeCanvas = function(fullscreen) {
	this.height = this.canvas.height || this.height;
	this.width = this.canvas.width || this.width;
	this.canvas.style.height = this.height + 'px';
	this.canvas.style.width = this.width + 'px';
	this._scaleRatio = 1;
	if (fullscreen == 1) {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.style.height = '100%';
		this.canvas.style.width = '100%';
	}
	if (fullscreen >= 2) {
 		this.canvas.style.width = window.innerWidth + 'px';
		this.canvas.style.height = 'auto';
		this._scaleRatio = window.innerWidth/this.width;
		if(fullscreen == 3){
			this.canvas.style.height = window.innerHeight + 'px';
		}
 	}

};

Studio.Stage.prototype.pauseButtons = function(a) {
	this._pause_buttons = a;
};

Studio.Stage.prototype.setPixelRatio = function() {
	this.canvas.width = this.width * this.resolution;
	this.canvas.height = this.height * this.resolution;
};
Studio.Stage.prototype.fillScreen = function() {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

};
Studio.Stage.prototype.addInput = function(fn, options) {
	if (options) {
		fn._options(options);
	}
	fn.init(this);
	this.plugins.input.push(fn);
	this._inputs++;
};

Studio.Stage.prototype.addEffect = function(fn, options) {
	if (options) {
		fn._options(options);
	}
	fn.init(this);
	this.plugins.effect.push(fn);
	this._effects++;
};

Studio.Stage.prototype.checkDataAttributes = function() {
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
};

Studio.Stage.prototype.setScene = function(who) {
	who.parent = this;
	if (this.activeScene && Studio.progress === 2) {
		if (this.activeScene.onDeactivate) {
			this.activeScene.onDeactivate(this);
		}
	}
	this.previousScene = this.activeScene;
	this.activeScene = who;
	this.activeScene.active = true;
	if (who.onActivate) {
		who.onActivate(this);
	}
};

Studio.Stage.prototype.clearScene = function() {
	if (this.activeScene) {
		this.previousScene = this.activeScene;
		this.activeScene = null;
		if (this.previousScene.onDeactivate) {
			this.previousScene.onDeactivate(this);
		}else{
			this.previousScene.active = false;
		}
	}
};

Studio.Stage.prototype.watch = function(who) {
	this._watching = who;
	this.children = who.children;
	this.hasChildren = who.hasChildren;
};


Studio.Stage.prototype.update_children = function(ratio, delta, interpolate) {
	for (this.i = 0; this.i !== this.hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].update(ratio, delta, interpolate);
		}
	}
};


Studio.Stage.prototype.update_visibility = function() {
	this._alpha = this.alpha;
};

/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a parent.
 * Yet it should still update its private variables.
 */
Studio.Stage.prototype._timebased_updates = function(delta) {
	this.update_tweens(delta);
};

Studio.Stage.prototype.update = function(ratio, delta) {
	if (this.onEnterFrame) {
		this.onEnterFrame();
	}
	this._width = this.width;
	this._height = this.height;
	this._scaleX  = this.scaleX;
	this._scaleY  = this.scaleY;
	this._speed = this.camera.speed;
	this.update_visibility();

	if (Studio.progress === 2) {

		if (this._inputs) {
			this.runInputs(delta);
		}
		this.updateScenes();

		if (this.beforeDraw) {
			this.beforeDraw();
		}
	}
	if (this.logic) {
		this.logic();
	}
};


Studio.Stage.prototype._update_scene = function(scene){
	if (!scene) return;
	if (scene.active) {
		scene.update(this.interpolate);
	}
}

Studio.Stage.prototype.updateScenes = function(){
	this._update_scene(this.activeScene);
	this._update_scene(this.previousScene);
	if (this.hasChildren || this._watching) {
		this.update_children(this.interpolate);
	}
};

Studio.Stage.prototype.runEffects = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		if(this.plugins.effect[this.i].active){
			this.plugins.effect[this.i].action(this);
		}
	}
};

Studio.Stage.prototype.runInputs = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._inputs; this.i++) {
		if(this.plugins.input[this.i].active){
			this.plugins.input[this.i].action(this);
		}	
	}
};

Studio.Stage.prototype.loading = function(delta) {

	if (Studio.loaded === true) { // BAD DESIGN! This should be based on each stage.
		// as it stands loading an image for one canvas will cause all to pause. oops.
		if (this.onReady) {
			this.onReady(delta);
		}
		this.loop = this.activeloop;
	}
};

Studio.Stage.prototype.activeloop = function(delta) {
	if (Studio.progress === 2) {
		this.timeStep(delta);
		if (this._effects) {
			this.runEffects(delta);
		}
		return;
	} else {
		// if(this.overlay_progress){
		// 	this.update_children();
		// 	this.draw(this.ctx);
		// 	this.timeStep(delta);
		// }
		// if(!this.webgl) this.drawProgress(this.ctx,delta);

		if (Studio.progress === 1) {
			if (this.onReady) {
				this.onReady(delta);
			}
			Studio.progress = 2; // we set this to 2 so we can fire this event once.
			if (!this.activeScene) {
				return; // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if (this.activeScene.onActivate) {
				this.activeScene.onActivate(this);
			}
		}
	}
};;

Studio.Stage.prototype.prepTexture = function(gl){
	var gl = this.ctx;
	this._texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, GAME._texture );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


Studio.Stage.prototype.setTexture = function(image, mipmap){
	var gl = this.ctx;
	
	if(!this._texture) {
		this.prepTexture(this.ctx);
	}
	this.ctx.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if(mipmap){
		this.ctx.generateMipmap(gl.TEXTURE_2D);
	}
}


Studio.Stage.prototype.loop = Studio.Stage.prototype.loading;

Studio.Stage.prototype.drawProgress = function(ctx) {
	this.progressBar(ctx, Studio.progress);
	ctx.restore();
};

// default progress bar. overwire this to create your own.
Studio.Stage.prototype.progressBar = function(ctx, progress) {
	ctx.fillStyle = 'rgba(255,255,255,.8)';
	ctx.fillRect((this.width - 202) / 2, (this.height - 22) / 2, 202, 22);
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect(2 + (this.width - 202) / 2, 2 + (this.height - 22) / 2, progress * 198, 18);
};



Studio.TextBox = function(width, height, stage) {
	this.font = '12px Arial';
	this.lineHeight = 10;
	this.height = height;
	this.width = width;
	this.shadow = 1;
	this.shadowColor = 'rgba(0,0,0,0.5)';
	this.cache = new Studio.Cache(width,height, stage.resolution);

	this.cache.ctx.textBaseline = 'top';
	this.cache.ctx.font = this.font;

	this.text = '';
	this.color = '#fff';
	this._wrap_height = this.lineHeight;
	this.horizontal_align = Studio.LEFT;
	this.vertical_align = Studio.TOP;
	this._vertical_align = 0;

	return this;
};

Studio.extend(Studio.TextBox, Studio.Rect);

Studio.TextBox.prototype.setFont = function(font) {
	this.font = font;
	return this;
};

Studio.TextBox.prototype.setText = function(text) {
	this.text = text;
	return this;
};

Studio.TextBox.prototype.setColor = function(color) {
	this.color = color;
	return this;
};

Studio.TextBox.prototype.setFont = function(font) {
	this.cache.ctx.font = this.font = font;
	return this;
};

Studio.TextBox.prototype.finish = function() {
	this.reset();
	this.wrapText();
};

Studio.TextBox.prototype.reset = function() {
	this.cache.ctx.clearRect(0, 0, this.width, this.height);
	this.cache.ctx.font = this.font;
};

Studio.TextBox.prototype.writeLine = function(text, x, y) {
	if (this.shadow) {
		this.cache.ctx.fillStyle = this.shadowColor;
		this.cache.ctx.fillText(text, x + 1 + this.shadow, y + this.shadow);
	}
	this.cache.ctx.fillStyle = this.color;
	this.cache.ctx.fillText(text, x + 1, y);
};

Studio.TextBox.prototype.wrapText = function() {
	var paragraphs = this.text.split('\n');
	var y = 0;
	for (var i = 0; i !== paragraphs.length; i++) {
		var words = paragraphs[i].split(' ');
		var line = '';
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = this.cache.ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > this.width && n > 0) {
				testWidth = this.cache.ctx.measureText(line).width;
				// We want to avoid any off pixel font rendering so we use | 0 to prevent floats
				// also offset everything by 2px because it helps with the centering of text
				this.writeLine(line, 2 + (this.width - testWidth) * this.horizontal_align | 0 , y);
				line = words[n] + ' ';
				y += this.lineHeight;
			} else {
				line = testLine;
			}
		}
		this.writeLine(line, 2 + (this.width - this.cache.ctx.measureText(line).width) * this.horizontal_align | 0, y);
		this._wrap_height = y + this.lineHeight;
		if (i !== paragraphs.length - 1) {
			y += this.lineHeight;
		}
	}
	// this._wrap_height += (this.shadow * 2) + 1;
	if (this._wrap_height > this.height) {
		this._wrap_height = this.height;
	}
	this._vertical_align = (this._wrap_height * this.vertical_align - this.height * this.vertical_align) | 0;
};

Studio.TextBox.prototype.fit = function() {
	this.cache.height = this._wrap_height;
	this.wrapText();
};

Studio.TextBox.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height);
};

Studio.TextBox.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, -(this.width * this.anchorX), -(this.height * this.anchorY) - this._vertical_align, this.width, this.height);
	ctx.restore();
};

Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY) - this._vertical_align, this._dwidth, this._dheight);
	}
};


Studio.Stage.prototype.update_tweens = function(global_delta) {
	var i,j = 0;
	var tween, key, delta;
	for (i in this.tweens) {
		tween = this.tweens[i];
		if (tween.actor._world) {
			tween.cur += global_delta * tween.actor._world.speed;
		} else {
			tween.cur += global_delta;
		}
		if (!tween.active && tween.onStart) {
			tween.onStart.call(tween.actor);
			tween.active = 1;
		}
		if (!tween.dir) {
			delta = tween.cur / tween.duration;
		} else {
			delta = 1 - tween.cur / tween.duration;
		}
		if (delta < 1 && delta > 0) {
			for (j = 0; j !== tween.keys.length; j++) {
				key = tween.keys[j];
				this.update_property(tween,key, delta);
			}
		} else {
			if (tween.next) {
				tween.next._snapshot();
				tween.next.cur = tween.cur - tween.duration;
				this.tweens[i] = tween.next;

				// return;
			} else {
				if (tween._loop) {
					tween.cur = 0;
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor);
					}
					if (tween._reflect) {
						if (!tween.dir) {
							tween.dir = 1;
						} else {
							tween.dir = 0;
						}
					} else {
						tween.actor.apply(tween.original);
						tween.active = 0;
					}
					return;
				} else {
					if (tween.reset) {
						tween.actor.apply(tween.original);
					} else {
						tween.actor.apply(tween.to);
						// for(j=0;j!==tween.keys.length;j++){
						// 	key = tween.keys[j];
						// 	tween.actor[key] = tween.to[key];
						// }
					}
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor);
					}
					tween = null;
					this.tweens[i] = null;
					delete this.tweens[i];
				}
			}
		}
	}
};

Studio.Stage.prototype.update_property = function(tween, key, delta) {
	tween.actor[key] = tween.original[key] + (Studio.Ease[tween.ease](delta) * (tween.to[key] - tween.original[key]));
};

Studio._tween_object = function(who, ease, to, duration, onEnd, onStart) {
	this.actor = who;
	this.ease = ease;
	this.original = {};
	this.to = to;
	this.cur = 0;
	this.duration = duration;
	this.onStart = onStart;
	this.onEnd = onEnd;
	this._loop = false;
	this._reflect = true;
	this.reset = false;
	this.dir = 0;
	this.active = 0;
	this.id = null;
	this.keys = Object.keys(to);
	this.next = null;
	this.prev = null;
};

Studio._tween_object.prototype.constructor = Studio._tween_object;

Studio._tween_object.prototype.loop = function() {
	this._loop = true;
	return this;
};

Studio._tween_object.prototype.apply = function(a) {
	for (var key in a) {
		this[key] = a[key];
	}
	return this;
};

Studio._tween_object.prototype.reflect = function(status) {
	this._reflect = status;
	return this;
};

Studio._tween_object.prototype.setActor = function(actor) {
	this.actor = actor;
	return this;
};

Studio.Stage.prototype.createTween = function(who, ease, to, duration, callback, onstart) {
	var temp = new Studio._tween_object(who, ease, to, duration, callback, onstart);
	temp.id = this.nextID;

	for (var key in to) {
		temp.original[key] = who[key];
	}

	this.nextID++;
	return temp;
};

Studio._tween_object.prototype._snapshot = function() {
	for (var key in this.to) {
		this.original[key] = this.actor[key];
	}
};

Studio._tween_object.prototype.then = function(ease, to, duration, callback, onstart) {
	this.next = new Studio._tween_object(this.actor, ease, to, duration, callback, onstart);
	this.next.prev = this;
	return this.next;
};

Studio._tween_object.prototype.last = function() {
	var next = this.next;
	var prev = this;
	while (next !== null) {
		prev = next;
		next = next.next;
	}
	return prev;
};

Studio._tween_object.prototype.completeLoop = function(who) {
	this.next = who;
	who.prev = this;
	return this.next;
};

Studio.Stage.prototype.createLoop = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback);
	this.tweens[this.nextID - 1].loop = true;
	return this.tweens[this.nextID - 1];
};

Studio.Stage.prototype.addTween = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback);
	return this.tweens[this.nextID - 1];
};

Studio.Stage.prototype.playTween = function(who) {
	who.cur = 0;
	for (var j = 0; j !== who.keys.length; j++) {
		who.original[who.keys[j]] = who.actor[who.keys[j]];
	}
	this.tweens[who.id] = who;
};

Studio.Stage.prototype.stopTween = function(who, snap, original) {
	if (this.tweens[who.id]) { // lets make sure the tween is active first
		who.cur = 0;
		who.dir = 0;
		if (snap) {
			var j;
			if (original) {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.original[who.keys[j]];
				}
			} else {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.to[who.keys[j]];
				}
			}
		}
		this.tweens[who.id] = null;
		delete this.tweens[who.id];
	}
};


Studio.Effect = {}

Studio.Effect.BillAtkinsonDither_BW = new Studio.Plugin({
	options: {

	},
	init: function(a) {
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.canvas.width,a.canvas.height);
		var pixeldata = pixels.data;
		var width = parseInt(a.canvas.width*4)
		var length = pixeldata.length;

		for (var i=0; i < length; i+=4) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = pixeldata[i+1] = pixeldata[i+2] = this.newpixel;

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
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.canvas.width,a.canvas.height);
		var pixeldata = pixels.data;
		var width = a.canvas.width*4;
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

Studio.Effect.Bloom = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.height = (a.canvas.height/2)*a.resolution;
		this.width = (a.canvas.width/2)*a.resolution;
		this.cache = new Studio.Cache(this.width,this.height);
		// this.cache.buffer.strokeStyle = '#fff';
		// this.cache.buffer.strokeRect( 10, 10, this.width-20, this.height-20);
		// this.cache.buffer.strokeRect( 15, 15, this.width-30, this.height-30);
		// this.cache.buffer.fillStyle = "rgba(200,0,0,.5)";
		// this.cache.buffer.fillRect( 25, this.height-25-this.height/4, this.width/4, this.height/4);
		this.cache.buffer.globalAlpha = .25
	},
	action: function(a) {
		this.cache.buffer.globalCompositeOperation = "source-over"
		this.cache.buffer.fillStyle="rgba(0,0,0,.35)";
		this.cache.buffer.fillRect( 0,0,this.width, this.height);
		this.cache.buffer.globalCompositeOperation = "lighten"
		this.cache.buffer.drawImage(a.canvas,0,0, a.width, a.height)
		a.ctx.globalCompositeOperation = 'lighten';
		a.ctx.drawImage(this.cache.image, 0, 0, a.canvas.width, a.canvas.height)
		a.ctx.globalCompositeOperation = 'source-over';
	}
})

Studio.Effect.Cursor = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.cursor = new Studio.Image('assets/cursor.png');
		a.canvas.style.cursor = 'none';
	},
	action: function(a) {
		a.ctx.drawImage(this.cursor.image, a.mouse.x-8, a.mouse.y-8, 48, 48)
	}
})


Studio.Effect.Red = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		
	},
	action: function(a) {
		var myGetImageData = a.ctx.getImageData(0,0,a.canvas.width, a.canvas.height);
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


Studio.Effect.Wave = new Studio.Plugin({
	action: function(a) {
		this.cache.buffer.drawImage(a.canvas, 0, 0, a.width, a.height);
		var max = this.w.length;
		for (var j = 0; j != max; j+=1) {
			a.ctx.drawImage(this.cache.image, j*this.width, 0, this.width, a.height, j*this.width, this.w[j], this.width, a.height);
			this.w[j] += (Math.cos(this.count))*2;
			this.count+=.02;
		}
	},
	init: function(a) {
		this.width = 1;
		this.w = [];
		var max = Math.ceil(a.width/this.width); 
		for (var i = 0; i < max; i+=1) {
			this.w[i] = 0;
		}
		this.cache = new Studio.Cache(a.width,a.height);
		this.count = 0;
	}
})

// var BLOOM = new Studio.Plugin({
// 	init: function(a) {
// 		this.buffer = document.createElement('canvas');
// 		this.buffer.height = a.height / 3 ;
// 		this.buffer.width = a.width / 3 ;

// 		this.bufferCTX = this.buffer.getContext('2d');
// 	},
// 	action: function(a) {
// 		this.bufferCTX.drawImage(a.canvas, 0, 0, this.buffer.width, this.buffer.height);
// 		a.ctx.globalAlpha = 1;
// 		a.ctx.globalCompositeOperation = "lighter";
// 		a.ctx.drawImage(this.buffer, 0, 0, a.width, a.height);
// 		a.ctx.globalCompositeOperation = "source-over";
// 	}
// })


var FRAGMENTSHADER = ['precision lowp float;',
						'uniform sampler2D u_image;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   if(v_texture.x==10.0){',
						'		gl_FragColor = v_color;',
						'	}else{',
						'		gl_FragColor = texture2D(u_image, v_texture) * v_color;',
						'	}',
						'}'].join('\n');

var VERTEXSHADER = ['attribute vec3 a_position;',
						'attribute vec4 a_color;',
						'attribute vec2 a_texture;',
						'uniform vec2 u_resolution;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'	vec2 canvas_coords = ((vec2(a_position.x,a_position.y)/ u_resolution)*2.0) - 1.0;',
						'	gl_Position = vec4(canvas_coords * vec2(1.0,-1.0), a_position.z, 1.0);',
						'	v_color = a_color;',
						'	v_texture = a_texture;',
						'}'].join('\n');

Studio.Stage.prototype.loadShader = function(who, shader) {
	//var shaderScript = document.getElementById(shader);
	//var str = '';
	// var k = shaderScript.firstChild ;
	// while (k) {
	// 	if (k.nodeType == 3) {
	// 		str += k.textContent;
	// 	}
	// 	k = k.nextSibling;
	// }
	this.ctx.shaderSource(who, shader);
};

Studio.Stage.prototype.WEBGL = {

	type: 'webgl',

	antialias: false,
	premultipliedAlpha: false,
	stencil: true,

	getContext: function() {
		this.ctx = this.canvas.getContext('webgl', {
			antialias: this.WEBGL.antialias ,
			premultipliedAlpha: this.WEBGL.premultipliedAlpha ,
			stencil: this.WEBGL.stencil
		});
	},

	init: function(gl) {
		gl._count = 0;
		gl._batch = new Float32Array(16355 * 32);
		// gl._batch = new Float32Array(62000*32);
		gl.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		this.loadShader(this.vertexShader , VERTEXSHADER);
		// gl.shaderSource(this.vertexShader,Studio.STANDARD_VERT_SHADER)
		gl.compileShader(this.vertexShader);

		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		this.loadShader(this.fragmentShader , FRAGMENTSHADER);
		// gl.shaderSource(this.fragmentShader,Studio.STANDARD_FRAG_SHADER)
		gl.compileShader(this.fragmentShader);

		// gl.enable(gl.DEPTH_TEST);
		//    gl.depthFunc(gl.LESS);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		// gl.disable(gl.DEPTH_TEST);

		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShader);
		gl.attachShader(this.program, this.fragmentShader);

		gl.linkProgram(this.program);

		gl.useProgram(this.program);

		this.buffer = gl.createBuffer();
	},

	prep: function(gl) {
		gl.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');

		gl.enableVertexAttribArray(0);

		gl.positionLocation = gl.getAttribLocation(this.program, 'a_position');
		gl.bindAttribLocation(this.program, 0, 'a_position');

		gl.colorLocation = gl.getAttribLocation(this.program, 'a_color');
		// gl.bindAttribLocation(this.program, 2, 'a_color');

		gl.textureLocation = gl.getAttribLocation(this.program, 'a_texture');
		// gl.bindAttribLocation(this.program, 6, 'a_texture');

		gl.uniform2f(gl.resolutionLocation, this.width, this.height);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		gl.enableVertexAttribArray(gl.positionLocation);
		gl.enableVertexAttribArray(gl.colorLocation);
		gl.enableVertexAttribArray(gl.textureLocation);

		gl.vertexAttribPointer(gl.positionLocation, 2, gl.FLOAT, false, 32, 0);
		gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 32, 8);
		gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 32, 24);

		this._rect_index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
		this._rect_index = new Uint16Array(this._maxCount * 6);

		for (var i = 0, j = 0; i < this._maxCount * 6; i += 6, j += 4) {
			this._rect_index[i + 0] = j + 0;
			this._rect_index[i + 1] = j + 1;
			this._rect_index[i + 2] = j + 2;
			this._rect_index[i + 3] = j + 1;
			this._rect_index[i + 4] = j + 2;
			this._rect_index[i + 5] = j + 3;
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._rect_index, gl.STATIC_DRAW);
		this._r_count = 0;
	},
	render:  function(lag) {
		this.ctx._count = 0;
		this.vertex_children(this.ctx, lag, this.interpolate);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.ctx._batch, this.ctx.DYNAMIC_DRAW);
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
		// gl.drawArrays(gl.TRIANGLES, 0, this.children.length*6);
		this.ctx.drawElements(this.ctx.TRIANGLES, this.hasChildren * 6, this.ctx.UNSIGNED_SHORT, 0);

	}
};


Studio.Stage.prototype.CANVAS = {
	type: '2dContext',
	getContext: function() {
		this.ctx = this.canvas.getContext('2d');
	},
	init: function() {
		this.ctx.webkitImageSmoothingEnabled = this.smoothing;
		this.ctx.mozImageSmoothingEnabled = this.smoothing;
		this.ctx.imageSmoothingEnabled = this.smoothing;
	},
	prep: function() {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0);
		this.draw(this.ctx);
		this.camera.render(this,lag);

		if(this.previousScene){
			this._renderScene(this.previousScene , lag);
		}
		if(this.activeScene){
			this._renderScene(this.activeScene , lag);
		}
		
		if (this.hasChildren) {
			this.render_children(this, lag);
		}
	},
};

Studio.Stage.prototype._renderScene = function( scene, lag){
	if (scene.active) {
		scene.render(this , lag, this.interpolate);
	}
}

Studio.fixedTimeStep = function(delta) {
	this.fixedStep(delta);
	this.step(delta);
	this._timebased_updates(delta);
	this.render(this._lag);
};

Studio.simple = function(delta) {
	this.update(this.interpolate);
	this._timebased_updates(delta);
	this.render(1);
};

Studio.Stage.prototype.timeStep = Studio.fixedTimeStep;

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur;
		this.update(this.interpolate); // update by a fixed amount.
	}
	if(this._d < 1){
		this._d = 1.5;
	}
};

Studio.Stage.prototype.step = function(delta) {
	this._d += delta;
	
	this._lag = this._d / this.dur;
	if (this._lag > 1) {
		this._lag = 1;
	}
	if(this._lag < 0){
		this._lag = 0;
	}
};

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS;


Studio.Stage.prototype.enableKeyboardInput = function() {
	// if we've already enabled keys we should abort.
	if(this.keys) {
		console.warn('Keyboard events are already enabled.');
		return;
	}
	var me = this;

	this.keys = {};

	var keydown = function(e) {
		e.preventDefault();
		me.keys[e.keyCode] = 1;
	};

	var keyup = function(e)  {
		e.preventDefault();
		me.keys[e.keyCode] = 0;
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
		scaledMouse.clientX = (event.clientX - me.canvas.offsetLeft) / me._scaleRatio;
		scaledMouse.clientY = (event.clientY - me.canvas.offsetTop) / me._scaleRatio;
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
		this.canvas.addEventListener("mousedown", mouse_down, false);
		this.canvas.addEventListener("mousemove", mouse_move, false);
		this.canvas.addEventListener("mouseup", mouse_release, false);
		this.canvas.addEventListener("mouseout", mouse_release, false);
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
		this.canvas.addEventListener("touchstart", finger_press, false);
		this.canvas.addEventListener("touchmove", finger_move, false);
		this.canvas.addEventListener("touchend", finger_release, false);
		this.canvas.addEventListener("touchcancel", finger_release, false);
		this.canvas.setAttribute('tabindex', '0');
		this.canvas.focus();
	} else {
		document.addEventListener("touchstart", finger_press, false);
		document.addEventListener("touchmove", finger_move, false);
		document.addEventListener("touchend", finger_release, false);
		document.addEventListener("touchcancel", finger_release, false);
	}
}



// @codekit-prepend "studio"

