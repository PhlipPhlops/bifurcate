const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration values
const WIDTH = 2**11;
const HEIGHT = 2**11;
const LEN_FACTOR = 0.707106781; // ~ 1/sqrt(2)
const DEPTH = 20;

// Direction reference
const DIRECTIONS = [0 /*N*/, 1 /*E*/, 2 /*S*/, 3 /*W*/];
const CHOICE = [0 /*R*/, 1 /*L*/];

// Init Cavas
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

class Path {
    constructor(prev_path, l_r) {
        if (!prev_path) {
            // Root path
            this.dir = 0;
            this.length = HEIGHT / 2;
			this.start = [WIDTH / 2, HEIGHT / 2];
			this.end = [WIDTH / 2, HEIGHT / 2];
    		return;
		}
   		this.dir = (prev_path.dir + 1 + l_r*2) % 4;
        this.length = prev_path.length * LEN_FACTOR;
    	this.start = prev_path.end;
		this.setEnd();
	}

	setEnd() {
		// Remember (x, y) == (0, 0) is the top-left corner
		this.end = this.start;
		switch(this.dir) {
			case 0:
				this.end = [this.start[0], this.start[1] - this.length]; 
				break;
			case 1:
				this.end = [this.start[0] + this.length, this.start[1]];
				break;
			case 2:
				this.end = [this.start[0], this.start[1] + this.length];
				break;
			case 3:
				this.end = [this.start[0] - this.length, this.start[1]];
				break;
			default:
				console.log('setEnd failed with this.dir == ' + this.dir);
		}
		return this.end;
	}
	
    draw() {
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.beginPath();
		ctx.lineTo(this.start[0], this.start[1]);
		ctx.lineTo(this.end[0], this.end[1]);
		ctx.stroke();
    }	
}

// Fill Background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Draw paths
var parent_paths = [new Path()];
for (cd /* Current Depth */ = 0; cd < DEPTH; cd++) {
	var next_depth_paths = [];
	parent_paths.forEach((parent_path) => {
		var r = new Path(parent_path, 1);
		var l = new Path(parent_path, 0);
		r.draw();
		l.draw();
		next_depth_paths.push(r);
		next_depth_paths.push(l);
	});
	parent_paths = next_depth_paths;
}

// Save to image
canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'bif.png')));
