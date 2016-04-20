/*
 *	CHUMP 2020 game - simple browser game built for Steve Dexter
 *	@author: Patrick Noble
 *	@date: 3/26/2016
 */


/*** Global Definitions ***/

const ARROW_PATH = "assets/redarrow.png";
const ASSET_PATH = "assets/";
const CHUMP_SPRITE_FILE = "assets/chumpspritesheet.png";
const BACKGROUND_FILE = "assets/cityskybackground.png";

const SOUND_FILE_MUSICA = "assets/sounds/musica.ogg";
const SOUND_FILE_MUSICB = "assets/sounds/musicb.ogg";
const SOUND_FILE_BALLBOUNCE = "assets/sounds/ballbounce.ogg";
const SOUND_FILE_BLOCKDESTROY = "assets/sounds/blockdestroy.ogg";
const SOUND_FILE_BLOCKHITSBLOCK = "assets/sounds/blockhitsblock.ogg";
const SOUND_FILE_CHUMPLOSES = "assets/sounds/chumploses.ogg";
const SOUND_FILE_CHUMPTHROW = "assets/sounds/chumpthrow.ogg";
const SOUND_FILE_SPAWNS = "../assets/sounds/spawns.ogg";
const SPAWN_SOUND = "spawn";
const THROW_SOUND = "throw";
const LOSE_SOUND = "lose";
const BLOCKHIT_SOUND ="blockhit";
const BLOCKDESTROY_SOUND = "blockdestroy";
const BALLBOUNCE_SOUND = "ballbounce";
const MUSICA = "musica";
const MUSICB = "musicb";

var CHUMP_SPRITE_FRAMERATE = 2;
var CHUMP_SPRITE_HEIGHT = 150;
var CHUMP_SPRITE_WIDTH = 150;
var CHUMP_SPRITE_WIDTH_MODIFIER = 75;
var THROW_ANIMATION_SPEED = 3;

var ANIMATION_THRESHOLD = 2; // animate to pixel locations within a set tolerance of error

var KEYCODE_LEFT = 37, 
		KEYCODE_RIGHT = 39,
		KEYCODE_UP = 38, 
		KEYCODE_DOWN = 40;
		KEYCODE_SPACE = 32;

var DIFFICULTY = 0;		// how fast game gets harder
var BALL_TIME = 150;			// aprox time until a new ball spawns
var WALL_TIME = 1000;
var BALL_TTL = 500;  			// time balls have until dissapear
var WALL_HP = 5;							// number of hits wall can take
var BALL_RADIUS = 15;		// radius of ball sprites
var WALL_RADIUS = 50;
var BALL_Y_SPAWN_MOD = 0.15; // percent of screen where ball can spawn
var BALL_MASS = 0.01;		// mass ball has for physics simulating
var WALL_THROW_MASS = 0.1;		// mass wall has in the air 
var WALL_BLOCK_MASS = 1;			// mass wall has when it is static
var WALL_SPAWN_X = 100;

var wallCountText;

var alive;					// is Chump still "alive"?

var timeToBall;
var nextBall;
var ballVMod;

var timeToWall;
var nextWall;
var wallsSpawned;
var wallsSpawnedPrev;

var canvas;			// main game canvas
var stage;			// main display stage

var messageField;		// main message text display
var scoreField;
var currentScore = 0;

var keysDown = {};

var borderSize;

var cursor = {
	x: null,
	y: null,
	held: false
};

const MAX_ARROW_ANGLE = 30;
const MIN_ARROW_ANGLE = -210;

const BALLCOUNT = 10;

const gravity = -9.8;

const TICK_INTERVAL = 10; // 1 ms per tick
var tickCounter = 0;
var splitCounter = 0;
var secondCounter = 0;

var timerText, timer;

var player;
var wallArrow = null;

// asset objects 
// TODO: this should use proloader
var background;
var backgroundLoaded = false;
var playerSpriteSheet;
var playerSpriteSheetLoaded = false;

var soundManifest = [
		{src: SOUND_FILE_SPAWNS, id: SPAWN_SOUND},
		{src: SOUND_FILE_CHUMPTHROW, id: THROW_SOUND},
		{src: SOUND_FILE_CHUMPLOSES, id: LOSE_SOUND},
		{src: SOUND_FILE_BLOCKHITSBLOCK, id: BLOCKHIT_SOUND},
		{src: SOUND_FILE_BLOCKDESTROY, id: BLOCKDESTROY_SOUND},
		{src: SOUND_FILE_BALLBOUNCE, id: BALLBOUNCE_SOUND},
		{src: SOUND_FILE_MUSICA, id: MUSICA},
		{src: SOUND_FILE_MUSICB, id: MUSICB}
	];
var volume = 1;

var walkingAnimation = null;

var ballArray = [];
var wallArray = [];

$(function() {
	//init();
	// TODO: arrange this code into init, preload, loadComplete, and restart functions
	$("#banner").html("Test Game 2016!");

	init();

});

function init() {
	// TODO: detect errors and browser type

	// load canvas
	canvas = document.getElementById("game-canvas");
	stage = new createjs.Stage(canvas);
	messageField = new createjs.Text("Loading", "bold 50px Arial", "#000000");
	messageField.maxWidth = canvas.width;
	messageField.textAlign = "center";
	messageField.textBaseline = "middle";
	messageField.x = canvas.width / 2;
	messageField.y = canvas.height / 2;
	stage.addChild(messageField);
	stage.update();

	var backgroundImg = new Image();
	backgroundImg.src = BACKGROUND_FILE;
	backgroundImg.onload = function (event) {
		var image = event.target;
		background = new createjs.Bitmap(image);
		backgroundLoaded = true;
		if (isLoadingComplete()) {
			console.log("handling complete after background is loaded");
			handleComplete();
		}
	}

	var playerSpriteImg = new Image();
	playerSpriteImg.src = CHUMP_SPRITE_FILE;
	playerSpriteImg.onload = function(event) {
		var image = event.target;
		var spriteData = {
			framerate: CHUMP_SPRITE_FRAMERATE,
			images: [image],
			frames: {width: 150, height: 150},
			animations: {"rWalk": [0,1], "lWalk": [1,2], "dance": [2,3], "rPickup": [4,6], "rThrow": [7,10,"dance",THROW_ANIMATION_SPEED], "lPickup": [11,13], "lThrow":[14,17,"dance",THROW_ANIMATION_SPEED]}
		};
		playerSpriteSheet = new createjs.SpriteSheet(spriteData);
		playerSpriteSheetLoaded = true;
		if (isLoadingComplete()) {
      handleComplete();
    }
	}

	/*var sound = new Howl({
		urls: [SOUND_FILE_MUSICA]
	}).play();*/

	createjs.Sound.alternateExtensions = ["mp3", "ogg"];

	createjs.Sound.on("fileload", function(event) {
		console.log("loading " + event.src);
		//console.log(event);
    for (var i = 0; i < soundManifest.length; i++) {
      if (event.src === soundManifest[i].src) {
        soundManifest[i].loaded = true;
        if (isLoadingComplete()) {
          handleComplete();
        }
      }
    }
	}, this);

	for (var i = 0; i < soundManifest.length; i++) {
		soundManifest[i].loaded = false;
		createjs.Sound.registerSound(soundManifest[i].src, soundManifest[i].id)
	}
	//createjs.Sound.registerSound(SOUND_FILE_SPAWNS)
	/*var manifest = [
		//{src: CHUMP_SPRITE_FILE, id: "chump"},
		{src: "assets/cityskybackground.png", id: "background"}
	];

	loader = new createjs.LoadQueue();
	loader.on("complete", handleComplete, this);
	console.log(manifest);
	//loader.loadManifest(manifest);

	loader.loadFile({id:"background", src:"assets/cityskybackground.png"});*/
}

function isLoadingComplete() {
	for (var i = 0; i < soundManifest.length; i++) {
		if (!soundManifest[i].loaded) {
			return false;
		}
	}
	if (!backgroundLoaded || !playerSpriteSheetLoaded) {
		return false;
	}
	else {
		return true;
	}
}

function handleComplete() {
	console.log("in handleComplete");
  
  // start music
  var music = createjs.Sound.play(MUSICA, {loop: -1});
  createjs.Sound.volume = 0.0;
  
	// clear loading screen
	stage.removeAllChildren();
	stage.clear();
	// initialize background display object
	/*var backgroundRect = new createjs.Shape();
	backgroundRect.graphics.beginBitmapFill(background).drawRect(0, 0, stage.canvas.width, stage.canvas.height);
	stage.addChild(backgroundRect);*/
	stage.addChild(background);

	borderSize = parseInt($("#game-canvas").css("border-left-width"), 10);

	// initialize time-until values
	timeToBall = BALL_TIME;
	nextBall = 0;
	ballVMod = 0;
	timeToWall = WALL_TIME;
	nextWall = 0;
	wallsSpawned = 0;
	wallsSpawnedPrev = 0;
	
	// initialize timer text object
	timerText = new createjs.Text("Timer: ", "25px Arial", "#000000");
	timerText.x = stage.canvas.width - 175;
	timerText.y = 25;

	// initialize text fields
	scoreField = new createjs.Text("Score:", "bold 25px Arial", "#000000");
	scoreField.maxWidth = canvas.width/8;
	scoreField.textAlign = "center";
	scoreField.textBaseline = "middle";
	scoreField.x = canvas.width - canvas.width / 8;
	scoreField.y = 30;
	stage.addChild(scoreField);

	wallCountText = new createjs.Text("", "bold 25px Arial", "#000000");
	wallCountText.maxWidth = WALL_RADIUS*2;
	wallCountText.textAlign = "center";
	wallCountText.textBasline = "middle";
	stage.addChild(wallCountText);



	//timerText.cache(stage.canvas.width - 50, 25, stage.canvas.width, stage.canvas.height);
	//stage.addChild(timerText);

	// initialize properties for player model and create player object
	player = new Thingy;
	player.graphics.beginFill("red").drawCircle(0, 0, 40);
 	player.holdingWall = false;
 	player.wallAnimating = false;

	player.shadow = new createjs.Shadow("#000000", 5, 5, 10);
	player.radius = 40;
	player.speed = 2;
 	player.boundsX = {min: player.radius + borderSize, max: stage.canvas.width - player.radius - borderSize};
 	player.boundsY = {min: player.radius + borderSize, max: stage.canvas.height - player.radius - borderSize};

	player.x = stage.canvas.width * 0.5;
 	player.y = player.boundsY.max;

 	player.sprite = new createjs.Sprite(playerSpriteSheet, "dance");
 	player.sprite.framerate = CHUMP_SPRITE_FRAMERATE;
 	player.spriteWidthMod = CHUMP_SPRITE_WIDTH_MODIFIER;
 	player.spriteHeightMod = CHUMP_SPRITE_HEIGHT - player.radius;
 	player.sprite.x = player.x - player.spriteWidthMod;
 	player.sprite.y = player.y - player.spriteHeightMod;
 	stage.addChild(player.sprite);

 	// ensure stage is blank and add the Chump player
	//stage.addChild(player);


	alive = true; 	// set Chump to "alive"

	// give player.model a property of radius
	// + parseInt($("#game-canvas").css("border-left-width"), 10);
	
	// preinitialize ball models up to BALLCOUNT and create physical objects
	/*for (var i = 0; i < BALLCOUNT; i++) {
		enemy = new PhysicsObject();
		enemy.graphics.beginFill("blue").drawCircle(0, 0, 25);
		enemy.graphics.beginStroke("#000");
		enemy.graphics.setStrokeStyle(1);
		enemy.snapToPixel = true;
		enemy.graphics.drawCircle(0,0,26);

		enemy.radius = 25;
		enemy.x = stage.canvas.width/2;
		enemy.y = 50;
		//for (var i = 0; i < )
		enemies[i] = enemy;
		enemies[i].physics.m = 0.01;
		var xRand = Math.floor(Math.random()*6) + 1; // this will get a number between 1 and 99;
		xRand *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
		var yRand = Math.floor(Math.random()*5) + 1; 
		enemies[i].physics.v = new Victor(xRand, yRand);

		enemies[i].boundsX = {min: enemies[i].radius + borderSize, max: stage.canvas.width - enemies[i].radius - borderSize};
	 	enemies[i].boundsY = {min: enemies[i].radius + borderSize, max: stage.canvas.height - enemies[i].radius - borderSize};

		stage.addChild(enemies[i]);
	}*/
  
  

	stage.addEventListener("stagemousedown", onDownEvent);
	stage.addEventListener("stagemousemove", onMoveEvent);
	stage.addEventListener("stagemouseup", onUpEvent);

	/*stage.on("dblclick", function(event) {
		console.log("dblclick event");
		throwWall();
	});*/

	$("#game-canvas").dblclick(function() {
		console.log("dblclick event");
		throwWall();
	});

	// create a timer based event listener for timer based animation
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
	//createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.setFPS(100);
	//createjs.Ticker.interval = TICK_INTERVAL; // set fps
	createjs.Ticker.addEventListener("tick", tick);
}
/*function handleComplete(tween) {
	var ball = tween._target;

}*/

var onDownEvent = function(event) {
	cursor.held = true;
	cursor.x = event.stageX;
	cursor.y = event.stageY;
}

var onUpEvent = function(event) {
	cursor.held = false;
};

var onMoveEvent = function(event) {
	//if (cursor.held) {
		cursor.x = event.stageX;
		cursor.y = event.stageY;
	//}

};

var handleWallClick = function(event) {
	if (!player.holdingWall) {
		var wall = event.target;
		wall.wallClicked = true;
		wall.clickEvent = event;
		if (wall.wallMode == SPAWNING_WALL) {
			var pVec = new Victor(player.x, player.y);
			var thisVec = new Victor(wall.x, wall.y);
			var diffVec = thisVec.subtract(pVec);
			var len = diffVec.length();
			if (len <= WALL_INFLUENCE) {
				player.wallAnimating = true;
				handlePickupAnimation(wall);
				wall.goToCoords(player.x - wall.radius / 2, player.y - CHUMP_SPRITE_HEIGHT);
				wall.wallMode = ACTIVATING_WALL;
				player.atDest = true;
				wallClicked = false;
			}
		}

		var throwWall = function(event) {
			var wall = event.target;
		}
	}
};

function handlePickupAnimation(wall) {
	if (wall.x < player.x) {	// wall is to the left of player
		if (player.sprite.currentAnimation != "lPickup") {
			player.sprite.gotoAndPlay("lPickup");
			console.log("playing left pickup animation");
		}
	}
	else {
		if (player.sprite.currentAnimation != "rPickup") {
			player.sprite.gotoAndPlay("rPickup");
			console.log("playing right pickup animation");
		}
	}
}

function tick(event) {

	// poll cursor
	if (cursor.held) {
		//player.destX = cursor.x;
		//player.destY = cursor.y;
		if (cursor.x != player.x) {
			player.goToCoords(cursor.x, player.boundsY.max+2);
		}

		if (cursor.x < player.x && player.sprite.currentAnimation != 'lWalk') {
			player.sprite.gotoAndPlay("lWalk");
			walkingAnimation = true;
		}
		else if (cursor.x > player.x && player.sprite.currentAnimation != "rWalk") {
			player.sprite.gotoAndPlay("rWalk");
			walkingAnimation = true;
		}
	
	}

	if (nextBall <= 0) {
		if (alive) {
			timeToBall -= DIFFICULTY;
			//addBall();
			nextBall = timeToBall + timeToBall * Math.random();
		}
	}
	else {
		nextBall--;
	}

	if (nextWall <= 0) {
		if (alive) {
			addWall();
			nextWall = WALL_TIME;
		}
	}
	else {
		nextWall--;
	}

	tickCounter++;
	if (tickCounter % 25 == 0) {
		splitCounter++;
	}
	if (tickCounter % 50 == 0) {
		currentScore++;
	}
	if (tickCounter % 250 == 0) {
		secondCounter++;
		if (splitCounter == 10) {
			splitCounter = 0;
		}
	}

	scoreField.text = "Score: " + currentScore;
	// timer related stuff
	/*if (!wallSpawned && secondCounter == 2) {
		var wall = new MoveableObject();
		
		wall.graphics.beginFill("red").drawRect(0, 0, 50, 50);
		wall.graphics.beginStroke("#000");
		wall.graphics.setStrokeStyle(1);
		wall.snapToPixel = true;
		wall.graphics.drawRect(-1,-1,52,52);
		wall.radius = 50;
 		wall.boundsX = {min: wall.radius + borderSize, max: stage.canvas.width - wall.radius - borderSize};
 		wall.boundsY = {min: wall.radius + borderSize, max: stage.canvas.height - wall.radius - borderSize};

		wall.addEventListener("click", handleWallClick);
		wallArray[wallArray.length] = wall;
		stage.addChild(wall);

		wallSpawned = true;
	}*/

	//if ()
	for (var i = 0; i < ballArray.length; i++) {
		handleBall(i);
	}

	wallsSpawned = 0;
	for (var i = 0; i < wallArray.length; i++) {
		handleWall(i);
	}
	if (wallsSpawnedPrev != wallsSpawned) {	// optimize wall text to only update on change
		if (wallsSpawned > 1) {
			wallCountText.text = "(" + wallsSpawned + ")";
		}
		else {
			wallCountText.text = "";
		}
		stage.removeChild(wallCountText);
		stage.addChild(wallCountText);
		wallsSpawnedPrev = wallsSpawned;
	}

	if (!player.wallAnimating) {
		player.step();
		if (player.atDest && player.sprite.currentAnimation != "dance") {
			if (player.sprite.currentAnimation != "lThrow" && player.sprite.currentAnimation != "rThrow") {
				player.sprite.gotoAndPlay("dance");
			}
			walkingAnimation = false;
		}
	}

	if (wallArrow != null) {
		//wallArrow.rotation += 1;

		wallArrow.x = player.x;
		wallArrow.y = player.y - CHUMP_SPRITE_HEIGHT + 25;

		var cx = cursor.x - wallArrow.x;
		var cy = cursor.y - wallArrow.y;

		//console.log("cy: " + cy + ", cx: " + cx);

		var rads = Math.atan(cy / cx);
		var degs = rads * 180 / Math.PI;

		if (cx < 0) {
			degs -= 180;
		}

		//console.log(degs);

		if (degs > MAX_ARROW_ANGLE) {
			degs = MAX_ARROW_ANGLE;
		}
		else if (degs < MIN_ARROW_ANGLE) {
			degs = MIN_ARROW_ANGLE;
		}

		wallArrow.rotation = degs + 90;
	}

	stage.update(event);
}	

function addBall() {
	var i = 0;
	var len = ballArray.length;

	while (i <= len) {
		if (!ballArray[i]) {
			// create and initialize new ball object
			ballArray[i] = new PhysicsObject();
			ballArray[i].graphics.beginFill("blue").drawCircle(0, 0, BALL_RADIUS);
			ballArray[i].graphics.beginStroke("#000");
			ballArray[i].graphics.setStrokeStyle(1);
			ballArray[i].snapToPixel = true;
			ballArray[i].graphics.drawCircle(0,0,BALL_RADIUS+1);

			ballArray[i].radius = BALL_RADIUS;
			ballArray[i].physics.m = BALL_MASS;
			ballArray[i].ttl = BALL_TTL;
			var xRand = -(Math.floor(Math.random()*10) + 5); // this will get a number between -5 and -10;
			//xRand *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			var yRand = Math.floor(Math.random()*4) + 1; 
			yRand *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

			ballArray[i].boundsX = {min: ballArray[i].radius + borderSize, max: stage.canvas.width - ballArray[i].radius - borderSize};
		 	ballArray[i].boundsY = {min: ballArray[i].radius + borderSize, max: stage.canvas.height - ballArray[i].radius - borderSize};

			ballArray[i].physics.v = new Victor(xRand, yRand);

			ballArray[i].x = ballArray[i].boundsX.max;
			ballArray[i].y = stage.canvas.height - (stage.canvas.height * BALL_Y_SPAWN_MOD);

		 	break;
		}
		else {
			i++;
		}
	}

	stage.addChild(ballArray[i]);
}

function addWall() {
	var i = 0;
	var len = wallArray.length;

	while (i <= len) {
		if (!wallArray[i]) {
			// create and initialize new wall object
			wallArray[i] = new MoveableObject();
		
			wallArray[i].graphics.beginFill("red").drawRect(0, 0, WALL_RADIUS, WALL_RADIUS);
			wallArray[i].graphics.beginStroke("#000");
			wallArray[i].graphics.setStrokeStyle(1);
			wallArray[i].snapToPixel = true;
			wallArray[i].graphics.drawRect(-2,-2,WALL_RADIUS+2,WALL_RADIUS+2);
			wallArray[i].radius = WALL_RADIUS;
	 		wallArray[i].boundsX = {min: borderSize, max: stage.canvas.width - wallArray[i].radius - borderSize};
	 		wallArray[i].boundsY = {min: wallArray[i].radius + borderSize, max: stage.canvas.height - wallArray[i].radius - borderSize};

	 		wallArray[i].hp = WALL_HP;

	 		// TODO: tweak physics values
	 		wallArray[i].physics.elast = 0.5;

	 		wallArray[i].x = -WALL_RADIUS;
	 		wallArray[i].y = wallArray[i].boundsY.max;

	 		wallArray.wallMode = SPAWNING_WALL;

	 		wallArray[i].goToCoords(WALL_SPAWN_X, wallArray[i].boundsY.max);

			wallArray[i].addEventListener("click", handleWallClick);
      
      // play sound
      //createjs.Sound.play(SPAWN_SOUND);

		 	break;
		}
		else {
			i++;
		}
	}

	stage.addChild(wallArray[i]);
}

function handleBall(index) {
	if (ballArray[index].ttl <= 0) {
		stage.removeChild(ballArray[index]);
		ballArray.splice(index, 1);
	}
	else {
		ballArray[index].step();

		for (var i = 0; i < wallArray.length; i++) {
			var pt = wallArray[i].globalToLocal(ballArray[index].x, ballArray[index].y);
			if (wallArray[i].hitTest(pt.x, pt.y)) {
				wallArray[i].hp--;
				ballArray[index].ttl = 1;
			}
		}

		ballArray[index].ttl--;
	}
}

function handleWall(index) {
	if (wallArray[index].hp <= 0) {
		stage.removeChild(wallArray[index]);
		wallArray.splice(index, 1);
	}
	else {
		wallArray[index].step();
		if (wallArray[index].wallMode == SPAWNING_WALL && wallArray[index].atDest) {
			wallsSpawned++;
			wallCountText.x = wallArray[index].x + WALL_RADIUS/2 - 2;
			wallCountText.y = wallArray[index].y + WALL_RADIUS/2 - 15;
		}
		else if (wallArray[index].wallMode == PASSIVE_WALL) {
			wallToWallCollisions(index);
		}
	}
}

function throwWall() {
	if (player.holdingWall) {
		// if this exists, then throw it
		player.atDest = true;
		var wall = player.holdingWall;
		wall.physics.m = 0.05;
		wall.physics.frict = 0.5;

		var wallVelocity = new Victor((cursor.x - player.x)*0.05, (cursor.y - player.y)*0.05);
		//wallVelocity.divide(50);
		//var wallVelocity = new Victor(event.stageX)
		console.log(wallVelocity.toString());
		wall.physics.v = wallVelocity;
    
    // play sound
    

    // play sprite animation
		if (cursor.x < player.x) {
			// play throw left animation
			if (player.sprite.currentAnimation != "lThrow") {
				player.sprite.gotoAndPlay("lThrow");
			}
		}
		else {
			// play throw right animation
			if (player.sprite.currentAnimation != "rThrow") {
				player.sprite.gotoAndPlay("rThrow");
			}
		}

		wall.wallMode = PASSIVE_WALL;
		player.holdingWall = false;

		stage.removeChild(wallArrow);
		arrowLoaded = false;
		wallArrow = null;
	}
}

function wallToWallCollisions(index) {
	for (var i = 0; i < wallArray.length; i++) {
		// check all other walls in passive (physics mode)
		if (index != i && wallArray[index].wallMode == PASSIVE_WALL) {
			// check each plane based on velocity
			var wall = wallArray[index];
			//if (wall.physics.v.length >= 1) { // then we can perform velocity based opimization
				if (wall.physics.v.x > 0) { // wall travelling rightwards
					if (wall.x + wall.radius >= wallArray[i].x && wall.y + wall.radius >= wallArray[i].y && wall.y <= wallArray[i].y + wallArray[i].radius) {
						// positive x plane collision
						//elasticCollision(wall, wallArray[i]);
						continue;
					}
				}
				else { // wall travelling leftwards
					if (wall.x + wall.radius <= wallArray[i].x && wall.y + wall.radius >= wallArray[i].y && wall.y <= wallArray[i].y + wallArray[i].radius) {
						// negative x plane collision
						//elasticCollision(wall, wallArray[i]);
						continue;
					}
				}
			//}
		}
	}
}

// perform a collision on hit detection at speed between 2 physics objects
function elasticCollision(obj1, obj2) {
	console.log("registered collision");
	// get mass ratios
	var mRatio1A = (obj1.physics.m - obj2.physics.m) / (obj1.physics.m + obj2.physics.m);
	var mRatio1B = (2 * obj2.physics.m) / (obj1.physics.m + obj2.physics.m);

	var mRatio2A = (2 * obj1.physics.m) / (obj1.physics.m + obj2.physics.m);
	var mRatio2B = (obj2.physics.m - obj1.physics.m) / (obj1.physics.m + obj2.physics.m);

	// perform energy transfers on velocity
	var v1X = mRatio1A * obj1.physics.v.x + mRatio1B * obj2.physics.v.x;
	var v1Y = mRatio1A * obj1.physics.v.y + mRatio1B * obj2.physics.v.y;
	obj1.physics.v = new Victor(v1X * obj1.physics.elast, v1Y * obj1.physics.elast);

	var v2X = mRatio2A * obj1.physics.v.x + mRatio2B * obj2.physics.v.x;
	var v2Y = mRatio2A * obj1.physics.v.y + mRatio2B * obj2.physics.v.y;
	obj2.physics.v = new Victor(v2X * obj2.physics.elast, v2Y * obj2.physics.elast);

	// step to give the objects a head start so as not to register an extra collision
	// might not have to do this...
	obj1.step();
	obj2.step();
	stage.update();
}

class Thingy extends createjs.Shape {
	constructor() {
		//this.model = model;
		super();
		// set defaults
		this.destX = this.x;
		this.destY = this.y;
		this.speed = 1;
		this.nvec2 = new Victor(0, 0);
		this.boundsX = {min: 0, max: 800};
		this.boundsY = {min: 0, max: 600};

		this.atDest = true;

		this.sprite = null;
	}

	step() {
		// go towards the destination linearly within a tolerance of 0.5
		if (!this.atDest && (Math.abs(this.destX - this.x) >= ANIMATION_THRESHOLD && Math.abs(this.destY - this.y) >= ANIMATION_THRESHOLD)) {
			this.moveObj();
			if (this.sprite) {
				this.sprite.x = this.x - this.spriteWidthMod;
				this.sprite.y = this.y - this.spriteHeightMod;
			}
		}
		else {
			this.atDest = true;
		}
	}

	moveObj() {
		if (this.x >= this.boundsX.min && this.x <= this.boundsX.max) {
			this.x = this.x + this.nvec2.x * this.speed;
		}
		if (this.y >= this.boundsY.min && this.y <= this.boundsY.max) {
			this.y = this.y + this.nvec2.y * this.speed;
		}
		// compensate for bounds overshoot
		if (this.x < this.boundsX.min) {
			this.x = this.boundsX.min;
		}
		else if (this.x > this.boundsX.max) {
			this.x = this.boundsX.max;
		}
		if (this.y < this.boundsY.min) {
			this.y = this.boundsY.min;
		}
		else if (this.y > this.boundsY.max) {
			this.y = this.boundsY.max;
		}
	}

	goToCoords(x, y) {
		this.destX = x;
		this.destY = y;


		var ivec2 = new Victor(this.x, this.y);
		var fvec2 = new Victor(this.destX, this.destY);

		var subbedVec = fvec2.subtract(ivec2);

		this.nvec2 = subbedVec.norm();

		this.atDest = false;
	}
}

const AIRBORNE = "airborne";
const ROLLING = "rolling";
const CONTACT = "contact";

/* 	Loosely realistic physical simulation object.
		Intended to simulate elastic collisions, friction, 
		and gravity
*/
class PhysicsObject extends Thingy {

	constructor() {
		super();

		this.movementMode = AIRBORNE;

		this.vFloor = 0.1;
		this.moving = true;

		this.physics = {
			P: 0,				// Potential energy E = mgh
			K: 0, 			// Kinetic Energy E = (1/2)mv^2
			m: 0.1,				// mass object posseses
			frict: 0.9,		// coefficient affecting force lost due to contact with another body
			elast: 0.75		// coefficient affecting force lost during elastic collision
		};
		this.physics.v = new Victor(0,0);
		this.physics.a = new Victor(0,-gravity);
	}

	estimateZeroV() {
		if (Math.abs(this.physics.v.length()) <= 0.4) {
			this.physics.v = new Victor(0,0);
			this.moving = false;
		}
	}

	addFriction() {
		// add in friction 
		var friction = new Victor(this.physics.frict, this.physics.frict);
		this.physics.v.multiply(friction);
	}

	step() {
		var mass = new Victor(this.physics.m, this.physics.m);
		var tempA = new Victor(this.physics.a.x, this.physics.a.y);
		tempA.multiply(mass);

		this.physics.v.add(tempA);

		this.x += this.physics.v.x;
		this.y += this.physics.v.y;
		// compensate for bounds overshoot
		if (this.x < this.boundsX.min) {
			this.x = this.boundsX.min;
			// add in bouncing with elasticity
			this.physics.v = new Victor(-this.physics.elast*this.physics.v.x, this.physics.v.y);
		}
		else if (this.x > this.boundsX.max) {
			this.x = this.boundsX.max;
			this.physics.v = new Victor(-this.physics.elast*this.physics.v.x, this.physics.v.y);
		}
		else if (this.y > this.boundsY.max) {
			this.y = this.boundsY.max;
			this.physics.v = new Victor(this.physics.v.x, -this.physics.elast*this.physics.v.y);
			this.addFriction();
		}
	}
};

const ACTIVE_WALL = "active";
const ACTIVATING_WALL = "activating";
const PASSIVE_WALL = "passive";
const SPAWNING_WALL = "spawning";
const WALL_INFLUENCE = 150;
var blocksInSpawn = 0;

var arrowLoaded = false;


class MoveableObject extends PhysicsObject {
	constructor() {
		super();

		this.wallMode = SPAWNING_WALL;
		this.x = 50;
		this.y = stage.canvas.height - 60;

		this.wallClicked = false;
		this.clickEvent = null;

		blocksInSpawn++;

	}

	step() {

		switch (this.wallMode) {
			case PASSIVE_WALL:
				// treat like a regular physics object
				/*var mass = new Victor(this.physics.m, this.physics.m);
				var tempA = new Victor(this.physics.a.x, this.physics.a.y);
				tempA.multiply(mass);

				this.physics.v.add(tempA);

				this.x += this.physics.v.x;
				this.y += this.physics.v.y;
				// compensate for bounds overshoot
				if (this.x < this.boundsX.min) {
					this.x = this.boundsX.min;
					// add in bouncing with elasticity
					this.physics.v = new Victor(-this.physics.elast*this.physics.v.x, this.physics.v.y);
				}
				else if (this.x > this.boundsX.max) {
					this.x = this.boundsX.max;
					this.physics.v = new Victor(-this.physics.elast*this.physics.v.x, this.physics.v.y);
				}
				else if (this.y > this.boundsY.max) {
					this.y = this.boundsY.max;
					this.physics.v = new Victor(this.physics.v.x, -this.physics.elast*this.physics.v.y);
					this.addFriction();
				}*/
				super.step();
				break;

			case SPAWNING_WALL:
				if (this.wallClicked) {
					handleWallClick(this.clickEvent);
				}
				if (!this.atDest) {
					this.x++;
				}
				if (Math.abs(this.x - WALL_SPAWN_X) <= 0.5) {
					this.atDest = true;
				}

				break;

			case ACTIVE_WALL:
				// wall block is being activated by user 
				this.x = player.x - this.radius*0.5;
				this.y = player.y - CHUMP_SPRITE_HEIGHT;
				/*
				if (player.sprite.currentAnimation != "lWalk" && player.sprite.currentAnimation != "rWalk") {
					if ()
				}*/
				
				if (!arrowLoaded) {
					var arrowImg = new Image();
					arrowImg.src = ARROW_PATH;

					arrowImg.onload = function (event) {
						var image = event.target;
						wallArrow = new createjs.Bitmap(image);
						wallArrow.rotation = 0;
						wallArrow.scaleX = 0.05;
						wallArrow.scaleY = 0.1;
						wallArrow.regX = 300;
						wallArrow.regY = 1250;//720;
						//wallArrow.transformMatrix = matrix;
						stage.addChild(wallArrow);

						arrowLoaded = true;
					}
				}

				break;

			case ACTIVATING_WALL:
				// run through pick-up routine
				// go towards the destination linearly within a tolerance of 0.5
				if (!this.atDest && (Math.abs(this.destX - this.x) >= 0.5 && Math.abs(this.destY - this.y) >= 0.5)) {
					player.wallAnimating = true;
					this.moveObj();
				}
				else {
					this.atDest = true;
					this.wallMode = ACTIVE_WALL;
					player.sprite.gotoAndPlay("dance");
					player.wallAnimating = false;
					player.holdingWall = this;
				}

				break;

		}
	}
};