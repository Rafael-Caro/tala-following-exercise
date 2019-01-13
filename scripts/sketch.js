//general variables
var talInfo;
var recordingsInfo;
var recordingsList;
var recTal;
//tal features
var talName;
var title;
var artist;
var link;
var trackFile;
// var avart;
// var strokeCircles = []; //list of strokeCircles
var talSet = {};
var currentTal;
var currentAvart;
var currentTime;
var charger;
var clock;
var mpmTxt;
//style
var radiusBig; //radius of the big circle
var radius1 = 20; //radius of accented matra
var radius2 = 15; //radius of unaccented matra
var backColor;
var mainColor;
var matraColor;
//machanism
var speed;
var tempo;
// var cursorX; //cursor line's x
// var cursorY; //cursor line's y
// var angle = -90; //angle of the cursor
var navCursor;
var navCursorW = 5;
var cursor;
var shade;
var jump;
// var alpha;
// var position = 0;
var paused = true;
//html interaction
var select;
var button;//sounds
var loaded = false;
var navBoxX = 10;
var navBoxH = 60;
var navBoxY;
var navBox;
var talBoxes = [];
var infoLink;
// Sounds
var trackDuration;
var track;
var initLoading;
// Icons
var wave;
var clap;
var iconSamSize = radius1*1.7;
var iconSize = radius2*1.7;
var iconDistance = 0.77;
// var icons = [];

function preload () {
  recordingsInfo = loadJSON("files/recordingsInfo.json");
  talInfo = loadJSON("files/talInfo.json");
  wave = loadImage("files/wave.svg");
  clap = loadImage("files/clap.svg");
}

function setup() {
  var canvas = createCanvas(600, 600);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  // var divElem = new p5.Element(input.elt);
  // divElem.style
  canvas.parent("sketch-holder");
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  //style
  radiusBig = width * (0.3);
  navBoxY = height-navBoxH-navBoxX;
  recordingsList = recordingsInfo["recordingsList"];
  backColor = color(185, 239, 162);
  mainColor = color(249, 134, 50);
  matraColor = color(249, 175, 120);
  //html interaction
  infoLink = select("#info-link");
  infoLink.position(width-60, navBoxX*3+37);
  button = createButton("Carga el audio")
    .size(120, 25)
    .position(width-120-navBoxX, navBoxY - navBoxX/2 - 25)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");
  select = createSelect()
    .size(100, 20)
    .position(navBoxX, navBoxX)
    .changed(start)
    .parent("sketch-holder");
  select.option("Elige");
  var noRec = select.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  for (var i = 0; i < recordingsList.length; i++) {
    select.option(recordingsInfo[recordingsList[i]].info.option, i);
  }
  charger = new CreateCharger();
  cursor = new CreateCursor();
navBox = new CreateNavigationBox();
}

function draw() {
  background(backColor);

  stroke(0, 50);
  strokeWeight(1);
  line(navBoxX*2, navBoxX*3+27, width-navBoxX*2, navBoxX*3+27);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(0);
  mainColor.setAlpha(255);
  fill(mainColor);
  text(title, width/2, navBoxX*3);
  textAlign(CENTER, CENTER);
  stroke(0, 150);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text(artist, width/2, navBoxX*3+45);

  if (!paused) {
    currentTime = track.currentTime();
  }

  push();
  translate(width/2, height/2);
  rotate(-90);

  // noStroke();
  // alpha = map((angle+90)%360, 0, 360, 0, 255);
  // mainColor.setAlpha(alpha);
  // fill(mainColor);
  // arc(0, 0, radiusBig, radiusBig, -90, angle%360);

  if (loaded) {
    shade.update();
    shade.display();

    noFill();
    strokeWeight(2);
    mainColor.setAlpha(255);
    stroke(mainColor);
    ellipse(0, 0, radiusBig, radiusBig);
    //draw circle per bol
    if (currentTal != undefined) {
      var talToDraw = talSet[currentTal];
      for (var i = 0; i < talToDraw.strokeCircles.length; i++) {
        talToDraw.strokeCircles[i].display();
      }
      for (var i = 0; i < talToDraw.icons.length; i++) {
        talToDraw.icons[i].display();
      }
    }

    cursor.update();
    cursor.display();
  } else {
    charger.update();
    charger.display();
    cursor.loadingUpdate();
    cursor.display();
  }

  pop();

  navBox.displayBack();

  if (loaded) {
    navCursor.update();
    navCursor.display();
    // for (var i = 0; i < talBoxes.length; i++) {
    //   talBoxes[i].update();
    // }
    clock.display();
  }

  for (var i = 0; i < talBoxes.length; i++) {
    talBoxes[i].display();
  }
  navBox.displayFront();

  textAlign(CENTER, CENTER);
  textSize(25);
  strokeWeight(5);
  stroke(0);
  mainColor.setAlpha(255);
  fill(mainColor);
  textStyle(NORMAL);
  text(talName, width/2, height/2);

  textAlign(LEFT, BOTTOM);
  textSize(12);
  textStyle(NORMAL);
  noStroke();
  fill(50);
  text(mpmTxt, navBoxX, navBoxY-navBoxX/2);

  // position = updateCursor(position);

  //cursor
  // stroke(mainColor);
  // line(0, 0, cursorX, cursorY);
  // fill("red");
  // noStroke();
  // ellipse(cursorX, cursorY, 5, 5);
}

function start () {
  if (loaded) {
    track.stop();
  }
  loaded = false;
  paused = true;
  talBoxes = [];
  talSet = [];
  talName = undefined;
  charger.angle = undefined;
  var index = select.value();
  recTal = recordingsInfo[recordingsList[index]];
  trackDuration = recTal.info.duration;
  title = recTal.info.title;
  artist = recTal.info.artist;
  link = recTal.info.link;
  trackFile = recTal.info.trackFile;
  infoLink.attribute("href", link)
    .html("+info");
  navCursor = new CreateNavCursor();
  for (var i = 0; i < recTal.info.talList.length; i++) {
    var tal = recTal.info.talList[i];
    var talBox = new CreateTalBox(tal, recTal[tal].start, recTal[tal].end);
    talBoxes.push(talBox);
    var talCircle = new CreateTal (tal);
    talSet[tal] = talCircle;
  }
  currentAvart = new CreateCurrentAvart();
  shade = new CreateShade();
  clock = new CreateClock();
  button.html("Carga el audio");
  button.removeAttribute("disabled");
}

function CreateTal (talName) {
  //restart values
  this.strokeCircles = [];
  this.icons = [];
  this.avart;
  // strokePlayPoints = [];
  // cursorX = 0;
  // cursorY = -radiusBig;
  // var angle = 0;
  // button.html("¡Comienza!");
  // playing = false;

  var tal = talInfo[talName];
  talName = tal["name"];
  this.avart = tal["avart"];
  var tempoInit = tal["tempoInit"];
  var theka = tal["theka"];
  for (var i = 0; i < theka.length; i++) {
    var stroke = theka[i];
    var matra = stroke["matra"];
    var vibhag; //tali or khali
    if (int(stroke["vibhag"]) > 0) {
      vibhag = "tali";
    } else {
      vibhag = "khali";
    }
    var circleType;
    if (i == 0) {
      circleType = "sam";
      var icon = new CreateIcon(matra, vibhag, iconSamSize, this.avart);
      this.icons.push(icon);
    } else if ((stroke["vibhag"] % 1) < 0.101) {
      circleType = 1;
      var icon = new CreateIcon(matra, vibhag, iconSize, this.avart);
      this.icons.push(icon);
    } else if ((stroke["vibhag"] * 10 % 1) == 0) {
      circleType = 2;
    } else {
      circleType = 3;
    }
    var bol = stroke["bol"];
    var strokeCircle = new StrokeCircle(matra, vibhag, circleType, bol, this.avart);
    this.strokeCircles.push(strokeCircle);
  }
}

function StrokeCircle (matra, vibhag, circleType, bol, avart) {
  this.bol = bol;
  var increment = 1;
  this.strokeWeight = 2;

  if (circleType == "sam") {
    if (vibhag == "tali") {
      this.col = mainColor;
    } else {
      this.col = backColor;
    }
  } else if (vibhag == "tali") {
    this.col = matraColor;
  } else if (vibhag == "khali") {
    this.col = backColor;
  }

  if (circleType == "sam") {
    this.radius = radius1;
    this.txtStyle = BOLD;
    this.bol = this.bol.toUpperCase();
    this.volume = 1;
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtStyle = BOLD;
    this.volume = 1;
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtStyle = NORMAL;
    this.volume = 0.7;
  } else {
    this.radius = radius2;
    this.col = color(0, 0);
    this.txtStyle = NORMAL;
    this.strokeWeight = 0;
    this.volume = 0.7;
    increment = 1.05;
  }

  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * increment * cos(this.circleAngle);
  this.y = radiusBig * increment * sin(this.circleAngle);

  this.display = function () {
    push();
    translate(this.x, this.y);
    stroke(mainColor);
    strokeWeight(this.strokeWeight);
    fill(this.col);
    ellipse(0, 0, this.radius, this.radius);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(0);
    textSize(this.radius * 0.75);
    textStyle(this.txtStyle);
    rotate(90);
    text(this.bol, 0, 0);
    pop();
  }

  this.clicked = function () {
    var x = -mouseY+height/2;
    var y = mouseX-width/2;
    var d = dist(this.x, this.y, x, y);
    if (d < this.radius) {
      soundDic[this.bol.toLowerCase()].play();
    }
  }
}

function CreateNavigationBox () {
  this.w = width - navBoxX * 2;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(navBoxX, navBoxY, this.w, navBoxH);
    if (recTal != undefined) {
      for (var i = 0; i < recTal.info.talList.length; i++) {
        var tal = recTal[recTal.info.talList[i]];
        for (var j = 0; j < tal.sam.length; j++) {
          var samX = map(tal.sam[j], 0, trackDuration, navBoxX+navCursorW/2, navBoxX+this.w-navCursorW/2);
          stroke(255);
          strokeWeight(1);
          line(samX, navBoxY, samX, navBoxY+navBoxH);
        }
      }
    }
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(navBoxX+1, navBoxY, navBoxX+this.w, navBoxY);
    line(navBoxX+this.w, navBoxY, navBoxX+this.w, navBoxY+navBoxH);
    strokeWeight(1);
    line(navBoxX, navBoxY, navBoxX, navBoxY+navBoxH);
    line(navBoxX, navBoxY+navBoxH, navBoxX+this.w, navBoxY+navBoxH);
  }

  this.clicked = function () {
    var xA = navBoxX;
    var xZ = navBoxX+this.w;
    var yA = navBoxY;
    var yZ = navBoxY+navBoxH;
    if (mouseX > xA && mouseX < xZ && mouseY > yA && mouseY < yZ) {
      jump = map(mouseX, xA, xZ, 0, trackDuration);
      if (paused) {
        currentTime = jump;
      } else {
        track.jump(jump);
        jump = undefined;
      }
    }
  }
}

function CreateNavCursor () {
  this.x = navBoxX + navCursorW/2;
  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBoxX + navCursorW/2, navBoxX + navBox.w - navCursorW/2);
    var noTal = true;
    for (var i = 0; i < talBoxes.length; i++) {
      var tB = talBoxes[i];
      if (this.x > tB.x1 && this.x < tB.x2) {
        tB.on();
        currentTal = tB.name;
        talName = talInfo[currentTal].name;
        noTal = false;
      } else {
        tB.off();
      }
    }
    if (noTal) {
      currentTal = undefined;
      talName = undefined;
    }
    if (navBoxX + navBox.w - navCursorW/2 - this.x < 0.005) {
      button.html("¡Comienza!");
      track.stop();
      paused = true;
      currentTime = 0;
    }
  }
  this.display = function () {
    stroke(mainColor);
    strokeWeight(navCursorW);
    line(this.x, navBoxY+navCursorW/2, this.x, navBoxY+navBoxH-navCursorW/2);
  }
}

function CreateTalBox (name, start, end) {
  this.name = name
  this.h = 20;
  this.x1 = map(start, 0, trackDuration, navBoxX+navCursorW/2, navBoxX+navBox.w-navCursorW/2);
  this.x2 = map(end, 0, trackDuration, navBoxX+navCursorW/2, navBoxX+navBox.w-navCursorW/2);
  this.w = this.x2-this.x1;
  this.boxCol = color(255, 100);
  this.txtCol = color(100);
  this.txtStyle = NORMAL;
  this.txtBorder = 0;
  this.sam = recTal[name].sam;
  this.currentSamIndex = 0;
  this.off = function () {
    this.boxCol = color(255);
    this.txtCol = color(100);
    this.txtStyle = NORMAL;
    this.txtBorder = 0;
    // currentTal = undefined;
    // talName = undefined;
  }
  this.on = function () {
    this.boxCol = mainColor;
    this.txtCol = color(0);
    this.txtStyle = BOLD;
    this.txtBorder = 1;
    // currentTal = this.name;
    // talName = talInfo[currentTal].name;
  }
  // this.update = function () {
  //   if (navCursor.x >= this.x1 && navCursor.x <= this.x2) {
  //     if (currentTal != this.name) {
  //       this.on();
  //     }
  //   } else {
  //     if (currentTal == this.name) {
  //       this.off();
  //     }
  //   }
  // }
  this.display = function () {
    this.boxCol.setAlpha(100);
    fill(this.boxCol);
    noStroke();
    rect(this.x1, navBoxY, this.w, this.h);
    textAlign(LEFT, CENTER);
    textSize(this.h * 0.7);
    fill(this.txtCol);
    textStyle(this.txtStyle);
    fill(0);
    mainColor.setAlpha(255);
    stroke(mainColor);
    strokeWeight(this.txtBorder);
    text(this.name, this.x1+2, navBoxY + this.h/2);
  }
}

function CreateCursor () {
  this.x;
  this.y;
  this.update = function () {
    if (!(currentTime >= currentAvart.start && currentTime <= currentAvart.end)) {
      currentAvart.update();
    }
    this.angle = map(currentTime, currentAvart.start, currentAvart.end, 0, 360);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
  }
  this.loadingUpdate = function () {
    this.x = radiusBig * cos(charger.angle);
    this.y = radiusBig * sin(charger.angle);
  }
  this.display = function () {
    fill("red");
    stroke(50);
    strokeWeight(1);
    ellipse(this.x, this.y, 5, 5)
  }
}

function CreateShade () {
  this.x;
  this.y;
  this.angle;
  this.alpha;
  this.col = mainColor;
  this.update = function () {
    this.angle = map(currentTime, currentAvart.start, currentAvart.end, 0, 360);
    this.alpha = map(this.angle, 0, 360, 0, 255);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
  }
  this.display = function () {
    this.col.setAlpha(this.alpha);
    fill(this.col);
    noStroke();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function CreateIcon (matra, vibhag, size, avart) {
  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * iconDistance * cos(this.circleAngle);
  this.y = radiusBig * iconDistance * sin(this.circleAngle);
  if (vibhag == "tali") {
    this.img = clap;
  } else if (vibhag == "khali") {
    this.img = wave;
  }

  this.display = function () {
    push();
    translate(this.x, this.y);
    rotate(90);
    image(this.img, 0, 0, size, size);
    pop();
  }
}

function CreateCurrentAvart () {
  this.index;
  this.tal;
  this.sam;
  this.start;
  this.end;
  this.findIndex = function () {
    while (currentTime > this.sam[this.index+1]) {
      this.index++;
    }
    while (currentTime < this.sam[this.index]) {
      this.index--;
    }
  }
  this.update = function () {
    if (currentTal == undefined) {
      this.start = undefined;
      this.end = undefined;
      mpmTxt = undefined;
    } else {
      if (this.tal == currentTal) {
        this.findIndex();
      } else {
        this.tal = currentTal
        this.sam = recTal[this.tal].sam;
        this.index = 0;
        this.findIndex();
      }
      this.start = this.sam[this.index];
      this.end = this.sam[this.index+1];
      var mpm = 60 / ((this.end - this.start) / 10);
      mpmTxt = str(mpm.toFixed(1)) + " mpm"
    }
  }
}

function CreateClock () {
  this.clock;
  this.total = niceTime(trackDuration);
  this.now;
  this.display = function() {
    this.now = niceTime(currentTime);
    this.clock = this.now + " / " + this.total;
    textAlign(CENTER, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    noStroke();
    fill(50);
    text(this.clock, width/2, navBoxY-navBoxX/2);
  }
}

function CreateCharger () {
  this.angle;
  this.update = function () {
    // if (this.angle == undefined) {
    //   this.angle = 0;
    // } else {
    //   this.angle += 6;
    // }
    this.angle += 1;
  }
  this.display = function () {
    stroke(mainColor);
    strokeWeight(2);
    noFill();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function player() {
  if (loaded) {
    if (paused) {
      paused = false;
      if (jump == undefined) {
        track.play();
      } else {
        track.play();
        track.jump(jump);
        jump = undefined;
      }
      button.html("Pausa");
    } else {
      paused = true;
      currentTime = track.currentTime();
      track.pause();
      button.html("Sigue");
    }
  } else {
    initLoading = millis();
    track = loadSound("tracks/" + trackFile, soundLoaded, function(){print("loading failed")}, loading);
    charger.angle = 0;
  }
}

function soundLoaded() {
  button.html("¡Comienza!");
  button.removeAttribute("disabled");
  loaded = true;
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function loading() {
  button.html("Cargando...");
  button.attribute("disabled", "");
}

function mousePressed() {
  // if (loaded && track.isPlaying()) {
  //   for (var i = 0; i < strokeCircles.length; i++) {
  //     strokeCircles[i].clicked();
  //   }
  // }
  if (loaded) {
    navBox.clicked();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
