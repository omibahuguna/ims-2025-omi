// https://editor.p5js.org/jht9629-nyu/sketches/P_fljj9ev
// Transience omi v1
// createGraphics use to scale video
// to full screen with correct aspect ratio

// https://omibahuguna.github.io/ims-2025-omi/Transience/
// https://editor.p5js.org/omi99/sketches
// https://editor.p5js.org/omi99/sketches/ohwy2A1tC

// Dan Shiffman slit-scan tutorial: https://www.youtube.com/watch?v=WCJM9WIoudI

// a sketch that employs ml5 to detect human bodies which triggers a slit-scan photo capture

let video;
let bodyPose;
let poses = [];

let cols = 160; // no. of columns
let colWidth;
let capturedFrames = [];
let currentCol = 0;
let lastCaptureTime = 0;
let captureInterval = 1; //ms
let capturing = false;
let captureDirection = 1; // 1 towards right, -1 towards left
let triggered = false;
let lastPoseDetected = false;


let lastKeypointPos = null; // To store the last position of the keypoint
let minCaptureInterval = 1; // Minimum capture interval (ms)
let maxCaptureInterval = 20; // Maximum capture interval (ms)

let my = {};

function preload() {
  bodyPose = ml5.bodyPose({ flipped: true }); // ml5 with flipped video
}

function setup() {
  createCanvas(windowWidth, windowHeight - 60);
  // createCanvas(1600, 1200);
  // colWidth = width / cols;

  video = createCapture(VIDEO, () => {
    console.log('createCapture callback width heigth', video.width, video.height);
    my.layer = createGraphics(video.width, video.height);
    colWidth = video.width / cols;
  });
  // video.size(960, 540);
  // video.size(1920, 1080);
  // video.size(1600, 1200);
  video.hide();

  // pose detection
  bodyPose.detectStart(video, gotPoses);

  create_ui();
}

function draw() {
  let layer = my.layer;
  if (!layer) {
    // console.log('waiting for video', millis() / 1000);
    return;
    

  }
  render_layer(layer);
  background(0);
  let dw = width;
  let dh = height;
  let sw = layer.width;
  let sh = layer.height;
  // Correct for the video aspect ratio
  dh = dw * (sh / sw);
  // Image video to full width of canvas
  // height is adjusted for aspect ratio
  image(layer, 0, 0, dw, dh, 0, 0, sw, sh);
    text(`Capture Interval: ${captureInterval.toFixed(1)} ms`, 20, 20);
}

// image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight], [fit], [xAlign], [yAlign])

function render_layer(layer) {
  // In video dimensions
  let width = video.width;
  let height = video.height;
  layer.push();
  layer.translate(width, 0);
  layer.scale(-1, 1); // mirror the video
  layer.image(video, 0, 0, width, height);
  layer.pop();

  let lapsed = millis() - lastCaptureTime > captureInterval;
  if (capturing && lapsed && currentCol < cols && currentCol >= 0) {
    let x = width - (currentCol + 1) * colWidth;
    let colImage = createImage(colWidth, height);
    // image of the column
    colImage.copy(video, x, 0, colWidth, height, 0, 0, colWidth, height);

    // flipping the columns horizontally
    colImage.loadPixels();
    for (let y = 0; y < colImage.height; y++) {
      for (let i = 0; i < colWidth / 2; i++) {
        let leftIdx = 4 * (y * colWidth + i);
        let rightIdx = 4 * (y * colWidth + (colWidth - i - 1));
        for (let k = 0; k < 4; k++) {
          let temp = colImage.pixels[leftIdx + k];
          colImage.pixels[leftIdx + k] = colImage.pixels[rightIdx + k];
          colImage.pixels[rightIdx + k] = temp;
        }
      }
    }
    colImage.updatePixels();


    // Store the captured column image & update capture state
    capturedFrames[currentCol] = colImage;
    lastCaptureTime = millis();
    currentCol += captureDirection;

    // Check if capture is complete
    if (currentCol >= cols || currentCol < 0) {
      capturing = false; // Stop capturing
      triggered = false; // Allow new pose detection
    }
  }
  // draw captured columns on the layer
  for (let i = 0; i < capturedFrames.length; i++) {
    if (capturedFrames[i]) {
      layer.image(capturedFrames[i], i * colWidth, 0);
    }
  }
}


// function to map speed to capture interval—code by Claude
function gotPoses(results) {
  poses = results;
  let poseNowDetected = poses.length > 0;

  if (poseNowDetected) {
    let pose = poses[0]; // Use the first detected pose
    
    // Try to find a keypoint with good confidence
    let keypoint = null;
    // nose as a keypoint metric
    keypoint = pose.keypoints.find(kp => kp.part === "nose" && kp.confidence > 0.1);
    
    // If no keypoint found yet, use any keypoint with good confidence as in the second function
    if (!keypoint) {
      for (let j = 0; j < pose.keypoints.length; j++) {
        if (pose.keypoints[j].confidence > 0.1) {
          keypoint = pose.keypoints[j];
          break;
        }
      }
    }

    if (keypoint) {
      // Calculate speed of the keypoint (from first function)
      if (lastKeypointPos) {
        // Get position, accounting for both position.x/y (first function) and x/y (second function)
        let kpX = keypoint.position ? keypoint.position.x : keypoint.x;
        let kpY = keypoint.position ? keypoint.position.y : keypoint.y;
        
        let dx = kpX - lastKeypointPos.x;
        let dy = kpY - lastKeypointPos.y;
        let speed = dist(0, 0, dx, dy); // Speed is the distance moved between frames
        
        // Adjust the speed range for more realistic mapping
        // Most movement between frames will be smaller values
        captureInterval = map(speed, 1, 5, maxCaptureInterval, minCaptureInterval);
        captureInterval = constrain(captureInterval, minCaptureInterval, maxCaptureInterval);
        
        // Debug
        console.log(`Speed: ${speed}, Interval: ${captureInterval}`);
      }
      
      // Update the last keypoint position
      lastKeypointPos = { 
        x: keypoint.position ? keypoint.position.x : keypoint.x, 
        y: keypoint.position ? keypoint.position.y : keypoint.y 
      };
      
      // Trigger capture if not already capturing (logic from both functions)
      if (!capturing && !triggered) {
        // Get the position, handling both data structures
        let posX = keypoint.position ? keypoint.position.x : keypoint.x;
        let section = getSection(posX);
        
        if (section === "left") {
          currentCol = 0;
          captureDirection = 1;
        } else if (section === "right") {
          currentCol = cols - 1;
          captureDirection = -1;
        } else {
          // Do nothing if subject is in the center
          lastPoseDetected = poseNowDetected;
          return;
        }
        
        capturedFrames = [];
        capturing = true;
        triggered = true;
        lastCaptureTime = millis();
      }
    }
  }

  lastPoseDetected = poseNowDetected;
}

// where the subject is in the frame
function getSection(x) {
  // In video dimensions
  let width = video.width;
  if (x < width / 3) return 'left';
  if (x > (2 * width) / 3) return 'right';
  return 'center';
}

// Save image on keypress
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('slit-scan-capture', 'png');
  }
}

function create_ui() {
  my.fullScreenBtn = createButton('Full Screen');
  my.fullScreenBtn.mousePressed(full_screen_action);
  my.fullScreenBtn.style('font-size:42px');
}

function full_screen_action() {
  my.fullScreenBtn.remove();
  fullscreen(1);
  let delay = 3000;
  setTimeout(ui_present_window, delay);
}

function ui_present_window() {
  resizeCanvas(windowWidth, windowHeight);
  // init_dim();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
