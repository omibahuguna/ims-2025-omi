let sounds = [];
let grid = [];
let cols = 16; // 4 bars x 4 beats
let rows = 12; // tracks
let cellSize;
let currentBeat = 0;
let bpm = 120;
let interval;
let lastTime = 0;

function preload() {
  sounds = [
    loadSound('Sounds/kick.mp3'),
    loadSound('Sounds/snare.mp3'),
    loadSound('Sounds/tom.mp3'),
    loadSound('Sounds/hi hat 2.mp3'),
    loadSound('Sounds/bass f.mp3'),
    loadSound('Sounds/bass e.mp3'),
    loadSound('Sounds/bass d.mp3'),
    loadSound('Sounds/bass c.mp3'),
    loadSound('Sounds/keyc.mp3'),
    loadSound('Sounds/keyd.mp3'), 
    loadSound('Sounds/keye.mp3'), 
    loadSound('Sounds/keyf.mp3')
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cellSize = min(width / cols, height / rows);
  interval = 60000 / bpm / 4;

  // Initialize the grid
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = false;
    }
  }

  // Create a button to start the audio context
  let startButton = createButton('Start Audio');
  startButton.position(width / 2 - 50, height / 2 - 20);
  startButton.size(100, 40);
  startButton.style('font-size', '16px');
  startButton.mousePressed(() => {
    userStartAudio(); // Resume the audio context
    startButton.remove(); // Remove the button after starting audio
  });
}

function draw() {
  background(30);
  drawGrid();
  playSounds();
  drawGlow(); // Draw the glow effect on top of the grid

  // loop tracker
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(0, 200, 255, 50);
      stroke(30);
      strokeWeight(3);
      rect(currentBeat * cellSize, i * cellSize, cellSize, cellSize, 10);
    }
  }
}

function drawGlow() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        // Add glow effect for active cells
        drawingContext.shadowBlur = 70; // Intensity of the glow
        drawingContext.shadowColor = 'rgba(255, 75, 0, 0.8)'; // Glow color
        fill(255, 75, 0, 200); // Slightly transparent fill for the glow
        noStroke();
        rect(j * cellSize, i * cellSize, cellSize, cellSize, 10);
        drawingContext.shadowBlur = 0; // Reset shadowBlur after drawing
      }
    }
  }
}

function drawGrid() {
  // Draw the grid cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(getCellColor(i, j));
      stroke(30);
      strokeWeight(3);
      rect(j * cellSize, i * cellSize, cellSize, cellSize, 10);
    }
  }

  // Add semi-transparent overlays for row groups
  noStroke();
  for (let i = 0; i < rows; i++) {
    if (i < 4) {
      fill(255, 0, 0, 50); // Red overlay for rows 0-3
    } else if (i < 8) {
      fill(0, 0, 255, 50); // Blue overlay for rows 4-7
    } else {
      fill(0, 255, 0, 50); // Green overlay for rows 8-11
    }
    rect(0, i * cellSize, width, cellSize); // Draw overlay across the entire row
  }
}
function getCellColor(row, col) {
  if (grid[row][col]) {
    return color(255, 75, 0); // Active cell
  } else if (col % 4 === 0) {
    return color(100); // First beat
  } else {
    return color(50); // Other beats
  }
}
function mousePressed() {
  let row = floor(mouseY / cellSize);
  let col = floor(mouseX / cellSize);
  if (row < rows && col < cols) {
    grid[row][col] = !grid[row][col];
  }
}

function touchStarted() {
  let row = floor(touchY / cellSize);
  let col = floor(touchX / cellSize);
  if (row < rows && col < cols) {
    grid[row][col] = !grid[row][col];
  }
  return false; // Prevent default behavior like scrolling
}

function playSounds() {
  let currentTime = millis();
  if (currentTime - lastTime > interval) {
    for (let i = 0; i < rows; i++) {
      if (grid[i][currentBeat]) {
        sounds[i].stop(); // Stop the sound before playing it
        sounds[i].play();
      }
    }
    // Move to the next beat
    currentBeat = (currentBeat + 1) % cols;
    lastTime = currentTime;
  }
}

