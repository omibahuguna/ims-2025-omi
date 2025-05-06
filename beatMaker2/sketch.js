let players;
let grid = [];
let cols = 20; // 4 bars x 4 beats
let rows = 12; // tracks
let cellSize;
let currentBeat = 0;
let bpm = 120;
let isLoaded = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(30);
  
  cellSize = min(width / cols, height / rows);
  
  // Initialize the grid
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = false;
    }
  }

  // Initialize Tone.js Players
  try {
    players = new Tone.Players({
      kick: 'Sounds/kick.mp3',
      snare: 'Sounds/snare.mp3',
      tom: 'Sounds/tom.mp3',
      hihat: 'Sounds/hi hat 2.mp3',
      bassF: 'Sounds/bass f.mp3',
      bassE: 'Sounds/bass e.mp3',
      bassD: 'Sounds/bass d.mp3',
      bassC: 'Sounds/bass c.mp3',
      keyC: 'Sounds/keyc.mp3',
      keyD: 'Sounds/keyd.mp3', 
      keyE: 'Sounds/keye.mp3', 
      keyF: 'Sounds/keyf.mp3'
    }, {
      onload: () => {
        isLoaded = true;
      }
    }).toDestination();
    
    // Set up Tone.js Transport
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.scheduleRepeat(playSounds, '16n');
    
  
    let startButton = createButton('Start Audio');
    startButton.position(width / 2 - 50, height / 2 - 20);
    startButton.size(100, 40);
    startButton.style('font-size', '16px');
    
    // Define the audio start function
    function startAudio() {
      // Resume audio context and start playback
      Tone.start()
        .then(() => {
          Tone.Transport.start();
          startButton.remove();
          Tone.context.resume();
        });
    }
    
    // Handle both mouse and touch events
    startButton.mousePressed(startAudio);
    startButton.touchEnded(startAudio);
    
  } catch (error) {
    // Display error message on canvas
    background(255);
    fill(255, 0, 0);
    textSize(16);
    text("Error initializing Tone.js. Check console.", width/2 - 100, height/2);
  }
}

function draw() {
  try {
    background(0);

    // Only draw the grid if players are initialized
    if (players) {
      drawGrid();
      drawGlow();

      // Highlight current beat with circles
      let gridWidth = cols * cellSize;
      let gridHeight = rows * cellSize;
      let xOffset = (width - gridWidth) / 2;
      let yOffset = (height - gridHeight) / 2;

      for (let i = 0; i < rows; i++) {
        fill(255,178,0);
        noStroke()
        ellipse(
          currentBeat * cellSize + cellSize / 2 + xOffset,
          i * cellSize + cellSize / 2 + yOffset,
          cellSize,
          cellSize
        );
      }
    } else {
      // Display loading message
      fill(255);
      textAlign(CENTER);
      textSize(16);
      text("Loading audio files...", width / 2, height / 2);
    }
  } catch (error) {
    // Display error message on canvas
    background(255);
    fill(255, 0, 0);
    textSize(16);
    text("Error in draw function.", width / 2 - 100, height / 2);
  }
}

function drawGlow() {
  // Calculate offsets to center the grid
  let gridWidth = cols * cellSize;
  let gridHeight = rows * cellSize;
  let xOffset = (width - gridWidth) / 2;
  let yOffset = (height - gridHeight) / 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        // Add glow effect for active cells
        drawingContext.shadowBlur = 50; 
        drawingContext.shadowColor = 'rgba(255, 75, 0, 0.8)';
        fill(255, 0, 0);
        noStroke();
        ellipse(
          j * cellSize + cellSize / 2 + xOffset,
          i * cellSize + cellSize / 2 + yOffset,
          cellSize,
          cellSize
        );
        drawingContext.shadowBlur = 0;
      }
    }
  }
}

function drawGrid() {
  // Calculate offsets to center the grid
  let gridWidth = cols * cellSize;
  let gridHeight = rows * cellSize;
  let xOffset = (width - gridWidth) / 2;
  let yOffset = (height - gridHeight) / 2;

  // Draw the grid cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(getCellColor(i, j));
      noStroke();
      ellipse(
        j * cellSize + cellSize / 2 + xOffset,
        i * cellSize + cellSize / 2 + yOffset,
        cellSize,
        cellSize
      );
    }
  }
}

function getCellColor(row, col) {
  if (grid[row][col]) {
    return color(255, 75, 0); // Active cell - bright orange
  } else {
    // Base colors for different row groups
    let baseColor;
    
    if (row < 4) {
      baseColor = color(224, 126, 180); // Pink/red for drum rows (0-3)
    } else if (row < 8) {
      baseColor = color(135, 58, 32); // Brown/orange for bass rows (4-7)
    } else {
      baseColor = color(124, 170, 219); // Blue for key rows (8-11)
    }
    
    // Darken color every 4th column (first beat of each bar)
    if (col % 4 === 0) {
      // Create a darker version of the base color
      return color(
        red(baseColor) * 0.7, 
        green(baseColor) * 0.7, 
        blue(baseColor) * 0.7
      );
    } else {
      return baseColor;
    }
  }
}

function mousePressed() {
  try {
    // Calculate offsets to center the grid
    let gridWidth = cols * cellSize;
    let gridHeight = rows * cellSize;
    let xOffset = (width - gridWidth) / 2;
    let yOffset = (height - gridHeight) / 2;

    // Adjust mouse coordinates by subtracting the offsets
    let row = floor((mouseY - yOffset) / cellSize);
    let col = floor((mouseX - xOffset) / cellSize);

    // Check if the click is within the grid bounds
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = !grid[row][col]; // Toggle the cell state
    }
  } catch (error) {
    // Silent error handling
  }
}

function touchStarted() {
  try {
    // Calculate offsets to center the grid
    let gridWidth = cols * cellSize;
    let gridHeight = rows * cellSize;
    let xOffset = (width - gridWidth) / 2;
    let yOffset = (height - gridHeight) / 2;

    // Adjust touch coordinates by subtracting the offsets
    let row = floor((touchY - yOffset) / cellSize);
    let col = floor((touchX - xOffset) / cellSize);

    // Check if the touch is within the grid bounds
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = !grid[row][col]; // Toggle the cell state
    }
    return false; // Prevent default behavior like scrolling
  } catch (error) {
    return false;
  }
}

function playSounds(time) {
  try {
    // Define sound names in order to match their index with grid rows
    const soundNames = [
      'kick', 'snare', 'tom', 'hihat', 
      'bassF', 'bassE', 'bassD', 'bassC',
      'keyC', 'keyD', 'keyE', 'keyF'
    ];
    
    // Check each row at the current beat position
    for (let i = 0; i < rows; i++) {
      if (grid[i][currentBeat]) {
        // Make sure both the player and sound exist
        if (i < soundNames.length && players.has(soundNames[i])) {
          // Play the sound
          const player = players.player(soundNames[i]);
          player.volume.value = 0; // Set volume to 0dB (normal)
          player.start(time);
        }
      }
    }
    
    // Move to the next beat
    currentBeat = (currentBeat + 1) % cols;
  } catch (error) {
    // Silent error handling
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = min(width / cols, height / rows);
}