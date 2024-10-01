// Coded by Jane He
// H1-Milestone2

// TM variables
let classifier;
// let imageModelURL = 'https://teachablemachine.withgoogle.com/models/5F1SMRCIVi/';
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/lMs96atoz/';
let video;
let label = '';
let prevLabel = '';

// Gesture Detection variables
let prevX, prevY;
let isDrawing = false;

// HandPose
let handPose;
let hands = [];

// Brush
let brushes = brush.box();
let palette = ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"];
let pointColor;

//canvas size
const C = {
    loaded: false,
    prop() {return this.height/this.width},
    isLandscape() {return window.innerHeight <= window.innerWidth * this.prop()},
    resize () {
        if (this.isLandscape()) {
          console.log("yes")
            document.getElementById(this.css).style.height = "100%";
            document.getElementById(this.css).style.removeProperty('width');
        } else {
            document.getElementById(this.css).style.removeProperty('height');
            document.getElementById(this.css).style.width = "100%";
        }
    },
    setSize(w,h,p,css) {
        this.width = w, this.height = h, this.pD = p, this.css = css;
    },
    createCanvas() {
        this.main = createCanvas(windowWidth,windowHeight,WEBGL), pixelDensity(this.pD), this.main.id(this.css), this.resize();
    }
};
C.setSize(640,520,1,'mainCanvas');

function windowResized () {
    C.resize();
}

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  handPose = ml5.handPose({flipped:true});
}

function setup() {
  
  // Create the video
  C.createCanvas();
  // C.parent('canvas-div');
  background("#fffceb");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Initialize brush
  brush.field("seabed");
  pointColor = random(palette);

  // Start classifying the video
  classifyVideo();
  
  // Start detecting hands
  handPose.detectStart(video, gotHands);
  console.log(brushes);
}

function draw() {

  // Draw the label
  console.log(label);
  translate(-width/2,-height/2);
  
  if(label == "Point"){
    isDrawing = true;
    noStroke();
    if(hands.length>0){
      let finger = hands[0].index_finger_tip;

      if(prevX && prevY){
        
        brush.set("pen", pointColor, 2);
        brush.line(prevX, prevY, finger.x, finger.y);
        
      }
        prevX = finger.x;
        prevY = finger.y; 
    }
  } 
  else if(label == "Palm"){
    isDrawing = true;
    noStroke();
    if(hands.length>0){
      let palm = hands[0].index_finger_tip;

      if(prevX && prevY){
        
        brush.set("spray", pointColor, 1);
        brush.circle(palm.x, palm.y, 5);
        
      }
        prevX = palm.x;
        prevY = palm.y; 
    }
  }
  else if(label == "Pinch"){
    isDrawing = true;
    noStroke();
    if(hands.length>0){
      let pinch = hands[0].index_finger_tip;

      if(prevX && prevY){
        
        brush.set("charcoal", pointColor, 1);
        
        brush.flowLine(pinch.x, pinch.y, abs(pinch.x-prevX), abs(pinch.y-prevY));
        
      }
        prevX = pinch.x;
        prevY = pinch.y; 
    }
  }else{
    isDrawing = false;
  }
  
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(video, gotResult);
}

// When we get a result
function gotResult(results) {
  label = results[0].label;
  classifyVideo();

  if(label !== prevLabel){
    pointColor = random(palette);
  }
  prevLabel = label;
}

// When we get handpose
function gotHands(results){
  hands = results;
}