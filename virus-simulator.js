// Globals
var nbHealthy = 500;
var nbSick = 10;
var nbFramesImmunity = 200; // nb of frames required to recover and be immune
var colors = ['blue', 'red', 'orange', '#FFCD32', '#CDDC28', '#2ABABF', ];
var dotRadius = 5;
var dots = [];
var speed = 5;

// Plot information
var nbFrames = 0;
var nbImmune = 0;
// traces
var plotData = 	[
			{x: [], y: [], stackgroup: 'one', groupnorm:'percent'},
			{x: [], y: [], stackgroup: 'one'},
			{x: [], y: [], stackgroup: 'one'}];

$(document).ready(main) // wait for document to be ready
function main() {

	plot_create();

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
			xSpeed: xSpeed,
			ySpeed: ySpeed,
			sickness: sickness,
			nbSickDays: 0
		};
		// Save it to the dots array.
		var goodDot = true;
		for (var i = 0; i < dots.length; i++) {
			if (collides(dot, dots[i])) {
				goodDot = false;
				break;
			}	
		}
		if (goodDot) {
			dots.push(dot);
			drawDot(dot);
		}
		else {
			newRandomDot(sickness);
		}
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

		// draw graph
		drawGraph();

		window.requestAnimationFrame(moveDots);
	}

	function drawGraph() {
		// x-axis
		plotData[0].x.push(nbFrames);
		plotData[1].x.push(nbFrames);
		plotData[2].x.push(nbFrames);
		// y-axis
		plotData[0].y.push(nbSick);
		plotData[1].y.push(nbHealthy);
		plotData[2].y.push(nbImmune);
		// redraw
		plot_update();	
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
		if (isSick(dot1) || isSick(dot2)) {
			infect(dot1);
			infect(dot2);
		}
	}

	function isSick(dot) {
		return dot.sickness == "sick";
	}

	function infect(dot) {
		if (dot.sickness == "immune") {
			// can not infect immune dot
			// TODO give it a chance to still get infected?
			return;
		}
		if (dot.sickness == "sick") {
			// already sick
			// TODO give it a chance to reset nbSickDays?
			return;
		}
		if (dot.sickness == "healthy") {
			setSick(dot);
			return;
		}
		// this should never be reached
		console.error("Trying to infect dot of unknown state: '" + dot.sickness + "'");
	}

	function setSick(dot) {
		if (dot.sickness == "healthy") {
			nbHealthy -= 1;
			nbSick += 1;
		}
		dot.sickness = "sick";
	}

	function setImmune(dot) {
		dot.sickness = "immune";
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
		context.fillStyle = getColor(dot);
		context.fill();
	}

	function getColor(dot) {
		if (dot.sickness == "healthy") {
			return colors[0];
		}
		if (dot.sickness == "sick") {
			return colors[1];
		}
		if (dot.sickness == "immune") {
			return colors[2];
		}
		console.error("Trying to get color of a dot of unknown state: '" + dot.sickness + "'");
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

	function plot_create() {
		var plotDiv = document.getElementById('plot');
		var traces = [
			{x: [], y: [], stackgroup: 'one', groupnorm:'percent'},
			{x: [], y: [], stackgroup: 'one'},
			{x: [], y: [], stackgroup: 'one'}
		];

		Plotly.react('plot', plotData, {title: 'Evolution over time'});
	}

	function plot_update() {
		if (nbFrames % 1 == 0) {
			var plotDiv = document.getElementById('plot');
			console.log("redrew");
			var plot_title = "frames = " + nbFrames + "  nbHealthy = " + nbHealthy + "  nbSick = " + nbSick + "  nbImmune = " + nbImmune;
			Plotly.react('plot', plotData, {title: plot_title, datarevision: nbFrames});
		}
	}
}


