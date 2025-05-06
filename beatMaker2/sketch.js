let players; // Tone.js Players instead of sounds array
let grid = [];
let cols = 20; // 4 bars x 4 beats
let rows = 12; // tracks
let cellSize;
let currentBeat = 0;
let bpm = 120;
let isLoaded = false;

function setup() {
  console.log("Setting up sketch...");
  createCanvas(windowWidth, windowHeight);
  background(30); // Set initial background
  
  cellSize = min(width / cols, height / rows);
  
  // Initialize the grid
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = false;
    }
  }

  // Initialize Tone.js Players with error handling
  try {
    console.log("Setting up Tone.js players...");
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
        console.log("All sounds loaded successfully");
        isLoaded = true;
      },
      onerror: (e) => {
        console.error("Error loading sound:", e);
      }
    }).toDestination();
    
    // Set up Tone.js Transport
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.scheduleRepeat(playSounds, '16n'); // Schedule every 16th note
    
    let startButton = createButton('Start Audio');
    startButton.position(width / 2 - 50, height / 2 - 20);
    startButton.size(100, 40);
    startButton.style('font-size', '16px');
    startButton.mousePressed(() => {
      console.log("Starting Tone.js...");
      
      // Resume the audio context
      Tone.start()
        .then(() => {
          console.log("Audio context started successfully!");
          
          // Start the transport (playback timeline)
          Tone.Transport.start();
          
          // Remove the start button
          startButton.remove();
          
          // Set context state to "running" (important!)
          Tone.context.resume();
          
          // Log current state
          console.log("Transport state:", Tone.Transport.state);
          console.log("Audio context state:", Tone.context.state);
        })
        .catch(error => {
          console.error("Error starting Tone.js:", error);
        });
    });
    
  } catch (error) {
    console.error("Error in setup:", error);
    // Display error message on canvas
    background(255);
    fill(255, 0, 0);
    textSize(16);
    text("Error initializing Tone.js. Check console.", width/2 - 100, height/2);
  }
  
  console.log("Setup complete");
}

function draw() {
  try {
    background(0);

    // Only draw the grid if players are initialized
    if (players) {
      drawGrid();
      drawGlow(); // Draw the glow effect on top of the grid

      // Highlight current beat with circles
      let gridWidth = cols * cellSize;
      let gridHeight = rows * cellSize;
      let xOffset = (width - gridWidth) / 2; // Center horizontally
      let yOffset = (height - gridHeight) / 2; // Center vertically

      for (let i = 0; i < rows; i++) {
        fill(255,178,0);
        noStroke()
        ellipse(
          currentBeat * cellSize + cellSize / 2 + xOffset, // x center position with offset
          i * cellSize + cellSize / 2 + yOffset,          // y center position with offset
          cellSize,                                       // width
          cellSize                                        // height
        );
      }
    } else {
      // Display message if players not initialized
      fill(255);
      textAlign(CENTER);
      textSize(16);
      text("Loading audio files...", width / 2, height / 2);
    }
  } catch (error) {
    console.error("Error in draw:", error);
    // Display error message on canvas
    background(255);
    fill(255, 0, 0);
    textSize(16);
    text("Error in draw function. Check console.", width / 2 - 100, height / 2);
  }
}

function drawGlow() {
  // Calculate offsets to center the grid
  let gridWidth = cols * cellSize;
  let gridHeight = rows * cellSize;
  let xOffset = (width - gridWidth) / 2; // Center horizontally
  let yOffset = (height - gridHeight) / 2; // Center vertically

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        // Add glow effect for active cells
        drawingContext.shadowBlur = 50; 
        drawingContext.shadowColor = 'rgba(255, 75, 0, 0.8)'; // Glow color
        fill(255,0, 0); // Slightly transparent fill for the glow
        noStroke();
        ellipse(
          j * cellSize + cellSize / 2 + xOffset, // x center position with offset
          i * cellSize + cellSize / 2 + yOffset, // y center position with offset
          cellSize,                              // width
          cellSize                               // height
        );
        drawingContext.shadowBlur = 0; // Reset shadowBlur after drawing
      }
    }
  }
}
function drawGrid() {
  // Calculate offsets to center the grid
  let gridWidth = cols * cellSize;
  let gridHeight = rows * cellSize;
  let xOffset = (width - gridWidth) / 2; // Center horizontally
  let yOffset = (height - gridHeight) / 2; // Center vertically

  // Draw the grid cells as circles
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      fill(getCellColor(i, j));
     noStroke()
      ellipse(
        j * cellSize + cellSize / 2 + xOffset, // x center position with offset
        i * cellSize + cellSize / 2 + yOffset, // y center position with offset
        cellSize,                              // width
        cellSize                               // height
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
        green(baseColor) *0.7, 
        blue(baseColor) * 0.7, 
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
    let xOffset = (width - gridWidth) / 2; // Center horizontally
    let yOffset = (height - gridHeight) / 2; // Center vertically

    // Adjust mouse coordinates by subtracting the offsets
    let row = floor((mouseY - yOffset) / cellSize);
    let col = floor((mouseX - xOffset) / cellSize);

    // Check if the click is within the grid bounds
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = !grid[row][col]; // Toggle the cell state
    }
  } catch (error) {
    console.error("Error in mousePressed:", error);
  }
}

function touchStarted() {
  try {
    // Calculate offsets to center the grid
    let gridWidth = cols * cellSize;
    let gridHeight = rows * cellSize;
    let xOffset = (width - gridWidth) / 2; // Center horizontally
    let yOffset = (height - gridHeight) / 2; // Center vertically

    // Adjust touch coordinates by subtracting the offsets
    let row = floor((touchY - yOffset) / cellSize);
    let col = floor((touchX - xOffset) / cellSize);

    // Check if the touch is within the grid bounds
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = !grid[row][col]; // Toggle the cell state
    }
    return false; // Prevent default behavior like scrolling
  } catch (error) {
    console.error("Error in touchStarted:", error);
    return false;
  }
}

function playSounds(time) {
  try {
    // Debug to confirm this function is running
    console.log("Current beat:", currentBeat);
    
    // Define sound names in order to match their index with grid rows
    const soundNames = [
      'kick', 'snare', 'tom', 'hihat', 
      'bassF', 'bassE', 'bassD', 'bassC',
      'keyC', 'keyD', 'keyE', 'keyF'
    ];
    
    // Check each row at the current beat position
    for (let i = 0; i < rows; i++) {
      if (grid[i][currentBeat]) {
        console.log("Trying to play sound at row:", i, "sound name:", soundNames[i]);
        
        // Make sure both the player and sound exist
        if (i < soundNames.length && players.has(soundNames[i])) {
          // Debug that we're playing a specific sound
          console.log("Playing:", soundNames[i]);
          
          // Start the player with a specific time and small volume increase for clarity
          const player = players.player(soundNames[i]);
          player.volume.value = 0; // Set volume to 0dB (normal)
          player.start(time);
        }
      }
    }
    
    // Move to the next beat
    currentBeat = (currentBeat + 1) % cols;
  } catch (error) {
    console.error("Error in playSounds:", error);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = min(width / cols, height / rows);
}