let cols, rows;
let size = 13;
let font;
let threshold = .5;
let angle = 0;

function preload() {
  font = loadFont("ibm.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = width / size;
  rows = height / size;
  textSize(size);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0);
  angle += .05; 

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = size / 2 + i * size;
      let y = size / 2 + j * size;
      let d = dist(x, y, width / 2, height / 2);
      let path = sin(d - angle)
      fill(155);
      textFont(font);
      if (path > threshold) {
        text("0", x, y);
      } else {
        text(".", x, y);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}