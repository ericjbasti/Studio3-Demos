var stage = new Studio.Stage("stage",{fullscreen: 1, dur:1000/60, webgl: 1, resolution: 2})
stage.color.setFromHex("#000").alpha(1).build()

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

// var Sun_image = new Studio.Image('imgs/sun_x1.png');
// var Sun_image_2 = new Studio.Image('imgs/sun_layer_x1.png');
// var Sun_image_3 = new Studio.Image('imgs/sun_layer2_x1.png');

// var mercury_img = new Studio.Image('imgs/mercury.png');
// var venus_img = new Studio.Image('imgs/venus.png');
// var earth_img = new Studio.Image('imgs/earth.png');
// var moon_img = new Studio.Image('imgs/moon.png');
// var mars_img = new Studio.Image('imgs/mars.png');
// var asteroid_img = new Studio.Image('imgs/asteroid.png');
// var jupiter_img = new Studio.Image('imgs/jupiter.png');
// var saturn_img = new Studio.Image('imgs/saturn.png');
// var saturn_rings_img = new Studio.Image('imgs/saturn_rings.png');
// var neptune_img = new Studio.Image('imgs/neptune.png');
// var uranus_img = new Studio.Image('imgs/uranus.png');


var sheet_1 = new Studio.Image('imgs/space-0001-default.png', {
	asteroid:{
	    width: 365.0,
	    height: 298.0,
	    x: 1475.0, y: 2.0,
	},
	earth:{
	    width: 256.0,
	    height: 256.0,
	    x: 873.0, y: 604.0,
	},
	jupiter:{
	    width: 600.0,
	    height: 600.0,
	    x: 1306.0, y: 862.0,
	},
	mars:{
	    width: 600.0,
	    height: 600.0,
	    x: 704.0, y: 873.0,
	},
	mercury:{
	    width: 128.0,
	    height: 128.0,
	    x: 1842.0, y: 132.0,
	},
	moon:{
	    width: 128.0,
	    height: 128.0,
	    x: 1842.0, y: 2.0,
	},
	sun:{
	    width: 869.0,
	    height: 869.0,
	    x: 2.0, y: 2.0,
	},
	sun_layer2_x1:{
	    width: 256.0,
	    height: 256.0,
	    x: 1131.0, y: 604.0,
	},
	sun_layer_x1:{
	    width: 256.0,
	    height: 256.0,
	    x: 1647.0, y: 302.0,
	},
	sun_x1:{
	    width: 256.0,
	    height: 256.0,
	    x: 1389.0, y: 604.0,
	},
	venus:{
	    width: 600.0,
	    height: 600.0,
	    x: 873.0, y: 2.0,
	}
});

var sheet_2 = new Studio.Image('imgs/space-0002-default.png',{
	neptune : {
	    width: 600.0,
	    height: 600.0,
	    x: 2.0 ,y:2.0
	},
	saturn : {
	    width: 600.0,
	    height: 600.0,
	    x: 2.0 ,y: 606.0
	},
	saturn_rings : {
	    width: 600.0,
	    height: 600.0,
	    x: 606.0 ,y:2.0
	},
	uranus : {
	    width: 600.0,
	    height: 600.0,
	   x: 606.0 ,y:606.0
	}
})

var Star = function (attr){
	this.image = sheet_1;
	this.height = 109*earths;
	this._world = new Studio.DisplayProperty();
	this.slice = 'sun'
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
	this.orbitSpeed = 2
	this.inheritRotation = false;
	this._world = new Studio.DisplayProperty();
	this.orbit = Math.random()*3600;
	this.slice = 'earth'
	if(attr){
		this.apply(attr);
	}
	this.init();
}

Studio.buildAs(Planet,Star);

Planet.prototype.onEnterFrame = function (){
	this.rotation+= this._world.speed *this.orbitSpeed;
}

var Moon = function(attr){
	this.height = .273 * earths;
	this.y = 2
	this.orbitSpeed = 2
	this._world = new Studio.DisplayProperty();
	this.slice = 'moon'
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
							orbitSpeed : speed
						})
	this.addChild(temp);
	return temp;
}



var Asteroid = function(){
	this.height = (Math.random() * earths/8)+earths/16;
	this.width = this.height*.75;
	this.y = theSun.radius + AU * ((Math.random())+2.2);
	this.orbit = Math.random()*3600;
	this.orbitSpeed = (Math.random()+1);
	this.slice = 'asteroid';
}
Studio.inherit(Asteroid, Planet)





var theSun = new Star();
theSun.color = new Studio.Color(255,100,0,1);

stage.addChild(theSun);

var sun_layer = new Studio.Sprite({height:theSun.height, width: theSun.width, image: sheet_1, slice: 'sun_layer_x1'});
sun_layer.onEnterFrame = function(){
	this.rotation+= .5 * this._world.speed;;
}
theSun.addChild(sun_layer)

var sun_layer2 = new Studio.Sprite({height:theSun.height, width: theSun.width, image: sheet_1, slice: 'sun_layer2_x1'});
sun_layer2.onEnterFrame = function(){
	this.rotation+= .8 * this._world.speed;
}
sun_layer.addChild(sun_layer2)

var mercury = new Planet({slice:'mercury', y: theSun.radius + AU*.387, orbitSpeed : 1.607, height: earths * .383});

var venus = new Planet({slice: 'venus', y: theSun.radius + AU*.723, orbitSpeed : -1.174 , height: earths * .949});

var earth = new Planet({slice:'earth', y: theSun.radius + AU*1, orbitSpeed : 1.045 , height: earths});

// 	// the moon is an interesting one. In order for the planets to show up on the screen in a reasonable manner
// 	// we need to set the scale of one earth to 100x the real earth
// 	// by doing this we cause the moon to be 100x, and that places the moon way to close to earth.
// 	// however if you base its distance on earth units it gets way too close to Venus.
// 	// the scale of space is a massive thing.
// 	// so hard to wrap our heads around.
// 	//var theMoon = earth.addMoon( earth.radius + (AU * .00257) , earths * .2524, 2).apply({image:moon_img});
var theMoon = earth.addMoon( earth.radius + (earths * 15) , earths * .2524, 2).apply({slice:'moon'});
var mars = new Planet({slice:'mars', y: theSun.radius + AU*1.52, orbitSpeed : .802 , height: earths * .532});


for (var i = 0 ; i != 2000; i++){
	theSun.addChild(new Asteroid())
}
var asteroids = new Asteroid();
theSun.addChild(asteroids)


var jupiter = new Planet({slice: 'jupiter', y: theSun.radius + AU*5.2, orbitSpeed : .434, height: earths * 11.21});

var saturn = new Planet({image: sheet_2,slice: 'saturn', y: theSun.radius + AU*9.58, orbitSpeed : .323, height: earths * 9.45});
var saturn_rings = new Studio.Sprite({image: sheet_2, slice: 'saturn_rings', height: earths * 20, width: earths * 20});

saturn.addChild(saturn_rings);

var uranus = new Planet({image: sheet_2, slice:'uranus', y: theSun.radius + AU*19.2, orbitSpeed : .228, height: earths * 4.01});

var neptune = new Planet({image: sheet_2, slice:'neptune', y: theSun.radius + AU*30.05, orbitSpeed : .182, height: earths * 3.88});

stage.camera.track(theSun);


theSun.addChildren(mercury, venus, earth, mars, jupiter, saturn, uranus, neptune);
theSun.speed = .25;
stage.camera.scaleX= stage.camera.scaleY = 1.5;

// stage.addEffect(STATS,{
// 	external: true, 
// 	height: 60,
// 	width: stage.width,
// 	position: 0,
// 	clear_mode:'cover'}
// );

stage.enableTouchEvents()
stage.draggable = true
stage.addButton(stage)
stage.onTap = function(e){
	// if(this.camera.tracking){
	// 	var x = this.camera.tracking._dx
	// 	var y = this.camera.tracking._dy
	// 	this.camera.stopTracking();
	// 	this.camera.focus.x = x;
	// 	this.camera.focus.y = y;
	// 	console.log(x,y)
	// }
	
}
stage.onDrag = function(e){
	// this.camera.x+=e.dx/stage.camera.scaleX
	// this.camera.y+=e.dy/stage.camera.scaleX
	
	console.log(e.dx, e.dy)
}

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

