// Globals
var nbHealthy = 1000;
var nbSick = 1;
var nbFramesImmunity = 200; // nb of frames required to recover and be immune
var colors = ['blue', 'red', 'orange', '#FFCD32', '#CDDC28', '#2ABABF', ];
var dotRadius = 5;
var dots = [];
var speed = 5;

// Plot information
nbFrames = 0;
nbImmune = 0;

$(document).ready(main) // wait for document to be ready
function main() {
	var canvas = $('canvas.dots');
	var context = canvas[0].getContext('2d');
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	canvas.attr({height: canvasHeight, width: canvasWidth});

	// Spawn people randomly
	for (var i = 0; i < nbHealthy; i++) {
		newRandomDot("healthy")
	}

	for (var i = 0; i < nbSick; i++) {
		newRandomDot("sick")
	}

	function newRandomDot(sickness) {
		var x = Math.random() * canvasWidth;
		var y = Math.random() * canvasHeight;
		var color = colors[0];
		if (sickness == "sick") {
			color = colors[1];
		}
		var xDirection = Math.floor(Math.random()*2)*2-1 // 1 or -1
		var yDirection = Math.floor(Math.random()*2)*2-1 // 1 or -1
		var xSpeed = Math.random() * speed;
		var ySpeed = Math.random() * speed;
		// Set the object.
		var dot = {
			x: x,
			y: y,
			radius: dotRadius,
			xDirection: xDirection,
			yDirection: yDirection,
			color: color,
			xSpeed: xSpeed,
			ySpeed: ySpeed,
			sickness: sickness,
			nbSickDays: 0
		};
		// Save it to the dots array.
		dots.push(dot);
		drawDot(dot);
	}

	setTimeout(function(){
		window.requestAnimationFrame(moveDots);
	}, 500);

	function moveDots() {
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		nbFrames += 1;

		for (i = 0; i < dots.length; i++) {
			for (j = i+1; j < dots.length; j++) {
				if (collides(dots[i], dots[j])) {
					collide(dots[i], dots[j])
				}
			}

			dots[i].x += (dots[i].xDirection * dots[i].xSpeed);
			dots[i].y += (dots[i].yDirection * dots[i].ySpeed);

			drawDot(dots[i])

			// Canvas boundaries
			if ((dots[i].x + dots[i].radius) >= canvasWidth) {
				dots[i].xDirection = -1;
			}
			if ((dots[i].x - dots[i].radius) <= 0) {
				dots[i].xDirection = 1;
			}
			if ((dots[i].y + dots[i].radius) >= canvasHeight) {
				dots[i].yDirection = -1;
			}
			if ((dots[i].y - dots[i].radius) <= 0) {
				dots[i].yDirection = 1;
			}
		}

		// draw background
		context.fillStyle = "black";
		context.globalAlpha = 0.5; // transparent
		context.fillRect(0, 0, 0.3*canvasWidth, 0.1*canvasHeight);
		context.globalAlpha = 1;
		// draw text
		text = "frames = " + nbFrames + " nbHealthy = " + nbHealthy + "  nbSick = " + nbSick + "  nbImmune = " + nbImmune;
		context.font = "bold 14px verdana, sans-serif ";
		context.fillStyle = "white";
		context.fillText(text, 10, 20); 
		// draw graph
		drawGraph();
		
		window.requestAnimationFrame(moveDots);
	}

	function drawGraph() {
		
	}

	function collide(dot1, dot2) {
		// collision effects
		console.log("coll")
		// connectDots(dots[i], dots[j])
		
		// bounce opposite direction
		dot1.xDirection = -dot1.xDirection;
		dot1.yDirection = -dot1.yDirection;
		dot2.xDirection = -dot2.xDirection;
		dot2.yDirection = -dot2.yDirection;

		// sickness adjustments
		if (dot1.sickness == "sick" || dot2.sickness == "sick") {
			if (dot1.sickness != "immune" && dot2.sickness != "immune") {
				setSick(dot1);
				setSick(dot2);
			}
		}
	}

	function setSick(dot) {
		if (dot.sickness == "healthy") {
			nbHealthy -= 1;
			nbSick += 1;
		}
		dot.sickness = "sick";
		dot.color = colors[1];
	}

	function setImmune(dot) {
		dot.sickness = "immune";
		dot.color = colors[2];
		nbImmune += 1;
		nbSick -= 1;
	}

	function drawDot(dot) {
		if (dot.sickness == "sick") {
			dot.nbSickDays += 1
			if (dot.nbSickDays > nbFramesImmunity) {
				setImmune(dot)
			}
		}
		// Set transparency on the dots.
		context.globalAlpha = 0.99;
		context.beginPath();
		context.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI, false);
		context.fillStyle = dot.color;
		context.fill();
	}

	function connectDots(dot1, dot2) {
		context.moveTo(dot1.x, dot1.y)
		context.lineTo(dot2.x, dot2.y)
		context.stroke()
	}

	function distance(dot1, dot2) {
		dx = dot2.x - dot1.x;
		dy = dot2.y - dot1.y;
		return Math.sqrt(dx*dx + dy*dy);
	}

	function collides(dot1, dot2) {
		return (distance(dot1, dot2) <= dot1.radius + dot2.radius)
	}

}

