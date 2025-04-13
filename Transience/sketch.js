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

function preload() {
  bodyPose = ml5.bodyPose({ flipped: true }); // ml5 with flipped video
}

function setup() {
  createCanvas(1600, 1200); 
  colWidth = width / cols;

  video = createCapture(VIDEO);
  video.size(1600, 1200);
  video.hide();

  bodyPose.detectStart(video, gotPoses); // pose detection
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1); // mirror the video
  image(video, 0, 0, width, height);
  pop();

  if (
    capturing && millis() - lastCaptureTime > captureInterval && currentCol < cols && currentCol >= 0
  ) {
    let x = width - (currentCol + 1) * colWidth;
    let colImage = createImage(colWidth, height);
    colImage.copy(video, x, 0, colWidth, height, 0, 0, colWidth, height); // image of the column

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
// draw captured columns on canvas
  for (let i = 0; i < capturedFrames.length; i++) {
    if (capturedFrames[i]) {
      image(capturedFrames[i], i * colWidth, 0);
    }
  }
}

function gotPoses(results) {
  poses = results;

  let poseNowDetected = poses.length > 0;

  // Trigger capture when pose is detected and not already capturing: code by chatGPT
  if (poseNowDetected && !lastPoseDetected && !capturing) {
    let pose = poses[0]; // Use first detected pose
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.confidence > 0.1) {
        let section = getSection(keypoint.x);
        if (section === 'left') {
          currentCol = 0;
          captureDirection = 1;
        } else if (section === 'right') {
          currentCol = cols - 1;
          captureDirection = -1;
        } else {
          return; // do nothing if subject in center
        }
        capturedFrames = [];
        capturing = true;
        triggered = true;
        lastCaptureTime = millis();
        break;
      }
    }
  }

  lastPoseDetected = poseNowDetected;
}

// where the subject is in the frame
function getSection(x) {
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
