var stage = new Studio.Stage("stage",{fullscreen: 1, dur:1000/10})
stage.color.setFromHex("#000").alpha(.1).build()

var AU = 92.960 // ~distance of Earth from Sun in millions of miles 92,956,050 miles  scale = 
var earths = .79176; // if we use the actual scale, you can't really see anything.
				// radius = 3,958.8 miles
				// diam = 7917.6 miles
				// it really should be 0.0079176
				// Stupid space is big.

Studio.buildAs = function(a,b){
	a.prototype = new b();
	a.prototype.constructor = a;
}

Studio.tick = Studio.capped;

var Sun_image = new Studio.Image('imgs/sun_x1.png');
var Sun_image_2 = new Studio.Image('imgs/sun_layer_x1.png');
var Sun_image_3 = new Studio.Image('imgs/sun_layer2_x1.png');

var mercury_img = new Studio.Image('imgs/mercury.png');

var earth_img = new Studio.Image('imgs/earth.png');
var moon_img = new Studio.Image('imgs/moon.png');


var Star = function (attr){
	this.image = Sun_image;
	this.height = 109*earths;
	this.color = 'yellow';
	this._world = new Studio.DisplayProperty();
	if(attr){
		this.apply(attr);
	}
	this.init();
}

Studio.buildAs(Star,Studio.Sprite);

Star.prototype.init = function(){
	this.width = this.height;
	this.radius = this.width/2;
}

Star.prototype.onEnterFrame = function (){
	this.rotation+= this._world.speed;
}


var Planet = function(attr){
	this.height = earths;
	this.color = 'green';
	this.orbit_speed = 2
	this.inheritRotation = false;
	this._world = new Studio.DisplayProperty();
	if(attr){
		this.apply(attr);
	}
	this.init();
}

Studio.buildAs(Planet,Star);

Planet.prototype.onEnterFrame = function (){
	this.rotation+= this._world.speed *this.orbit_speed;
}

var Moon = function(attr){
	this.height = .273 * earths;
	this.color = '#999';
	this.y = 2
	this.orbit_speed = 2
	this._world = new Studio.DisplayProperty();
	if(attr){
		this.apply(attr);
	}
	this.init();
}

Studio.buildAs(Moon,Planet);

Planet.prototype.addMoon = function(y,diamater,speed){
	var temp = new Moon({
							y : y,
							height : diamater, 
							orbit_speed : speed
						})
	this.addChild(temp);
	return temp;
}



var theSun = new Star({color:'#FF9900'});

stage.addChild(theSun);

var sun_layer = new Studio.Sprite({height:theSun.height, width: theSun.width, image: Sun_image_2});
sun_layer.onEnterFrame = function(){
	this.rotation+= .5 * this._world.speed;;
}
theSun.addChild(sun_layer)

var sun_layer2 = new Studio.Sprite({height:theSun.height, width: theSun.width, image: Sun_image_3});
sun_layer2.onEnterFrame = function(){
	this.rotation+= .8 * this._world.speed;
}
sun_layer.addChild(sun_layer2)

var mercury = new Planet({image:mercury_img, y: theSun.radius + AU*.387, orbit_speed : 1.607, height: earths * .383});

var venus = new Planet({color:'red', y: theSun.radius + AU*.723, orbit_speed : -1.174 , height: earths * .949});

var earth = new Planet({image:earth_img, y: theSun.radius + AU*1, orbit_speed : 1.045 , height: earths});

	// the moon is an interesting one. In order for the planets to show up on the screen in a reasonable manner
	// we need to set the scale of one earth to 100x the real earth
	// by doing this we cause the moon to be 100x, and that places the moon way to close to earth.
	// however if you base its distance on earth units it gets way too close to Venus.
	// the scale of space is a massive thing.
	// so hard to wrap our heads around.
	//var theMoon = earth.addMoon( earth.radius + (AU * .00257) , earths * .2524, 2).apply({image:moon_img});
	var theMoon = earth.addMoon( earth.radius + (earths * 15) , earths * .2524, 2).apply({image:moon_img});
var mars = new Planet({color:'red', y: theSun.radius + AU*1.52, orbit_speed : .802 , height: earths * .532});







var jupitar = new Planet({color:'red', y: theSun.radius + AU*5.2, orbit_speed : .434, height: earths * 11.21});

var saturn = new Planet({color:'red', y: theSun.radius + AU*9.58, orbit_speed : .323, height: earths * 9.45});

var uranus = new Planet({color:'red', y: theSun.radius + AU*19.2, orbit_speed : .228, height: earths * 4.01});

var neptune = new Planet({color:'red', y: theSun.radius + AU*30.05, orbit_speed : .182, height: earths * 3.88});

stage.camera.track(theSun);


theSun.addChildren(mercury, venus, earth, mars, jupitar, saturn, uranus, neptune);
theSun.speed = .25;
stage.camera.scaleX= stage.camera.scaleY = 10;

Studio.start();

// stage.addTween(stage.camera,'quadInOut',{scaleX:1, scaleY: 1}, 9000)

var focus = document.getElementById('focus');
focus.onchange = function(){
	stage.camera.track(window[this.value])
}

var zoom = document.getElementById('zoom');
zoom.onchange = function(){
	var val = parseFloat(this.value);
	stage.camera.scaleX= stage.camera.scaleY = val;
}
var speed = document.getElementById('speed');
speed.onchange = function(){
	var val = parseFloat(this.value);
	theSun.speed = val;
}
