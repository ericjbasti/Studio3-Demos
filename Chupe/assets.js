
var coin = new Studio.Image('images/coin_16.png')

var curse = new Studio.Image('images/chupe_slices.png', {
	"Rock":{ x: 32, y: 0, width: 32, height: 32},
	"Rock First":{ x: 0, y: 0, width: 32, height: 32},
	"Rock Last":{ x: 64, y: 0, width: 32, height: 32},
	"Floating Rock Center":{ x: 32, y: 64, width: 32, height: 32},
	"Floating Rock Left":{ x: 0, y: 64, width: 32, height: 32},
	"Floating Rock Right":{ x: 64, y: 64, width: 32, height: 32},
	"Large Cloud":{ x: 0, y: 160, width: 224, height: 68},
	"Small Cloud 1":{ x: 0, y: 232, width: 70, height: 24},
	"Skyline":{ x: 224, y: 0, width: 8, height: 256},
	"Water":{ x: 224, y: 198, width: 32, height: 8},
	"Water2":{ x: 224, y: 200, width: 32, height: 8},
	"Water3":{ x: 224, y: 208, width: 32, height: 16},
	"Water4":{ x: 224, y: 224, width: 32, height: 24},
	"Water5":{ x: 224, y: 238, width: 32, height: 8},
	"Water6":{ x: 224, y: 242, width: 32, height: 8},
	"food_0":{ x: 99, y: 6, width: 24, height: 24},
	"food_1":{ x: 131, y: 6, width: 24, height: 24},
	"soda_0":{ x: 162, y: 0, width: 16, height: 32},
	"soda_1":{ x: 178, y: 0, width: 16, height: 32}
})

var chupe = new Studio.Image('images/chupe.png');

var right = {
	pant: [[0,1],[1,1],[2,1],[3,1]],
	walk: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]],
	jump: [[6,1],[6,1]]
}

var left = {
	pant: [[0,3],[1,3],[2,3],[3,3]],
	walk: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2]],
	jump: [[5,3],[5,3]]
}