//general variables
var talInfo;
var recordingsInfo;
var recordingsList;
var recTal;
var failedLoading = false;
var mainBoxSide = 600;
var markerW = 0;
var markerH = 60;
var attemptsBox;
var hitsBox;
var scoreBox;
var attempts = 0;
var hits = 0;
var score = 0;
var samIndex = 0;
var goalIndex = 0;
var allSam = [];
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
var currentTime = 0;
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
var showTheka;
var showCursor;
var showTal;
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

function setup () {
  var canvas = createCanvas(markerW+mainBoxSide, markerH+mainBoxSide);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  // var divElem = new p5.Element(input.elt);
  // divElem.style
  canvas.parent("sketch-holder");
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  strokeJoin(ROUND);
  //style
  radiusBig = mainBoxSide * (0.3);
  navBoxY = height-navBoxH-navBoxX;
  recordingsList = recordingsInfo["recordingsList"];
  backColor = color(185, 239, 162);
  mainColor = color(249, 134, 50);
  matraColor = color(249, 175, 120);
  //html interaction
  infoLink = select("#info-link");
  infoLink.position(width-60, markerH+navBoxX*3+37);
  button = createButton("Carga el audio")
    .size(120, 25)
    .position(width-120-navBoxX, navBoxY-navBoxX/2-25)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");
  var selectW;
  if (markerW > 100) {
    selectW = markerW-navBoxX*2;
  } else {
    selectW = 100;
  }
  select = createSelect()
    .size(selectW, 20)
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
  showTheka = createCheckbox('ṭhekā (x2)', true)
    .position(markerW+navBoxX, markerH+mainBoxSide*0.2)
    .parent("sketch-holder");
  showCursor = createCheckbox('cursor (x3)', true)
    .position(markerW+navBoxX, showTheka.position()["y"]+showTheka.height+navBoxX/2)
    .parent("sketch-holder");
  showTal = createCheckbox('tāl (x3)', true)
    .position(markerW+navBoxX, showCursor.position()["y"]+showCursor.height+navBoxX/2)
    .changed(function() {
      showTheka.checked(showTal.checked());
    })
    .parent("sketch-holder");
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  attemptsBox = new CreateScoreBox(markerH + 150, "Intentos", color(0), NORMAL);
  hitsBox = new CreateScoreBox(attemptsBox.x + attemptsBox.w + navBoxX*2, "Aciertos", color(0), NORMAL);
  scoreBox = new CreateScoreBox(hitsBox.x + hitsBox.w + navBoxX*2, "Puntos", mainColor, BOLD); //color(52, 152, 219)
  charger = new CreateCharger();
  cursor = new CreateCursor();
  navBox = new CreateNavigationBox();
}

function draw () {
  background(254, 249, 231);
  fill(backColor);
  rect(markerW, markerH, mainBoxSide, height);

  attemptsBox.display(attempts);
  hitsBox.display(hits);
  scoreBox.display(score);

  stroke(0, 50);
  strokeWeight(1);
  line(markerW+navBoxX*2, markerH+navBoxX*3+27, width-navBoxX*2, markerH+navBoxX*3+27);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(0);
  mainColor.setAlpha(255);
  fill(mainColor);
  text(title, markerW+mainBoxSide/2, markerH+navBoxX*3);
  textAlign(CENTER, CENTER);
  stroke(0, 150);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text(artist, markerW+mainBoxSide/2, markerH+navBoxX*3+45);

  if (!paused) {
    currentTime = track.currentTime();
    updateSam();
  }

  push();
  translate(markerW+mainBoxSide/2, markerH+mainBoxSide/2);

  if (failedLoading) {
    textAlign(CENTER, CENTER);
    textSize(15)
    noStroke()
    fill(0)
    text("Ha habido un problema cargando el audio\nPor favor, vuelve a cargar la página", 0, 0);
  }

  rotate(-90);

  // noStroke();
  // alpha = map((angle+90)%360, 0, 360, 0, 255);
  // mainColor.setAlpha(alpha);
  // fill(mainColor);
  // arc(0, 0, radiusBig, radiusBig, -90, angle%360);

  if (loaded) {
    shade.update();
    if (showCursor.checked()) {
      shade.display();
    }

    noFill();
    strokeWeight(2);
    mainColor.setAlpha(255);
    stroke(mainColor);
    ellipse(0, 0, radiusBig, radiusBig);
    //draw circle per bol
    if (currentTal != undefined && showTal.checked()) {
      var talToDraw = talSet[currentTal];
      for (var i = 0; i < talToDraw.strokeCircles.length; i++) {
        talToDraw.strokeCircles[i].display();
      }
      for (var i = 0; i < talToDraw.icons.length; i++) {
        talToDraw.icons[i].display();
      }
    }

    cursor.update();
    if (showCursor.checked()) {
      cursor.display();
    }
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
  text(talName, markerW+mainBoxSide/2, markerH+mainBoxSide/2);

  textAlign(LEFT, BOTTOM);
  textSize(12);
  textStyle(NORMAL);
  noStroke();
  fill(50);
  text(mpmTxt, markerW+navBoxX, navBoxY-navBoxX/2);
  text(str(samIndex) + ", " + str(goalIndex), width-50, 20);

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
  currentTime = 0;
  talBoxes = [];
  talSet = [];
  talName = undefined;
  charger.angle = undefined;
  mpmTxt = undefined;
  allSam = [];
  samIndex = 0;
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
    for (var j = 0; j < recTal[tal].sam.length; j++) {
      var samToAdd = recTal[tal].sam[j];
      if (!allSam.includes(samToAdd)) {
        allSam.push(samToAdd);
      }
    }
    var talBox = new CreateTalBox(tal, recTal[tal].start, recTal[tal].end);
    talBoxes.push(talBox);
    var talCircle = new CreateTal (tal);
    talSet[tal] = talCircle;
  }
  currentAvart = new CreateCurrentAvart();
  shade = new CreateShade();
  clock = new CreateClock();
  showTheka.attribute("disabled", "true");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTheka.checked("true");
  showCursor.attribute("disabled", "true");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showCursor.checked("true");
  showTal.attribute("disabled", "true");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.4);");
  showTal.checked("true");
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
    this.radius = radius1*1.2;
    this.txtSize = radius1 * 0.7;
    this.txtStyle = BOLD;
    this.bol = this.bol.toUpperCase();
    this.volume = 1;
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtSize = radius1 * 0.75;
    this.txtStyle = BOLD;
    this.volume = 1;
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
    this.txtStyle = NORMAL;
    this.volume = 0.7;
  } else {
    this.radius = radius2;
    this.txtSize = radius2 * 0.75;
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

    if (showTheka.checked()) {
      textAlign(CENTER, CENTER);
      noStroke();
      fill(0);
      textSize(this.txtSize);
      textStyle(this.txtStyle);
      rotate(90);
      text(this.bol, 0, 0);
    }
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

function CreateScoreBox (x, title, col, style) {
  this.x = x;
  this.h = 20;
  this.y = navBoxX+this.h;
  this.w = 50;
  this.title = title;
  this.col = col;
  this.style = style;
  this.display = function(txt) {
    textAlign(RIGHT, TOP);
    fill(0);
    noStroke();
    textStyle(this.style);
    textSize(this.h * 0.75);
    text(this.title, this.x+this.w, navBoxX);
    fill(255);
    stroke(150);
    strokeWeight(1);
    rect(this.x, this.y, this.w, this.h);
    fill(this.col);
    noStroke();
    text(txt, this.x+this.w-3, this.y+this.h * 0.2);
  }
}

function CreateNavigationBox () {
  this.x1 = markerW+navBoxX;
  this.x2 = width-navBoxX;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, navBoxY, this.w, navBoxH);
    if (recTal != undefined) {
      for (var i = 0; i < recTal.info.talList.length; i++) {
        var tal = recTal[recTal.info.talList[i]];
        for (var j = 0; j < tal.sam.length; j++) {
          var samX = map(tal.sam[j], 0, trackDuration, this.x1+navCursorW/2, this.x2-navCursorW/2);
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
    line(this.x1+1, navBoxY, this.x2, navBoxY);
    line(this.x2, navBoxY, this.x2, navBoxY+navBoxH);
    strokeWeight(1);
    line(this.x1, navBoxY, this.x1, navBoxY+navBoxH);
    line(this.x1, navBoxY+navBoxH, this.x2, navBoxY+navBoxH);
  }

  this.clicked = function () {
    var yA = navBoxY;
    var yZ = navBoxY+navBoxH;
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > yA && mouseY < yZ) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      findClosestSam();
    }
  }
}

function CreateNavCursor () {
  this.x = navBoxX + navCursorW/2;
  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
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
    if (navBox.x2-navCursorW/2 - this.x < 0.005) {
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
  this.h = 25;
  this.x1 = map(start, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
  this.x2 = map(end, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
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
    textAlign(LEFT, BOTTOM);
    textSize(this.h * 0.7);
    fill(this.txtCol);
    textStyle(this.txtStyle);
    fill(0);
    mainColor.setAlpha(255);
    stroke(mainColor);
    strokeWeight(this.txtBorder);
    text(this.name, this.x1+2, navBoxY + this.h*0.92);
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
    text(this.clock, markerW+mainBoxSide/2, navBoxY-navBoxX/2);
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

function player () {
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
    track = loadSound("tracks/" + trackFile, soundLoaded, failedLoad, loading);
    charger.angle = 0;
  }
}

function soundLoaded () {
  button.html("¡Comienza!");
  button.removeAttribute("disabled");
  loaded = true;
  showTheka.removeAttribute("disabled");
  showTheka.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showCursor.removeAttribute("disabled");
  showCursor.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  showTal.removeAttribute("disabled");
  showTal.attribute("style", "color:rgba(0, 0, 0, 0.6);");
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function loading () {
  button.html("Cargando...");
  button.attribute("disabled", "");
}

function failedLoad () {
  print("Loading failed");
  failedLoading =true;
  charger.angle = undefined;
}

function updateSam () {
  if (currentTime < allSam[0]) {
    samIndex = 0;
    goalIndex = 0;
  } else if (currentTime > allSam[allSam.length-1]) {
    samIndex = allSam.length-1;
    goalIndex = allSam.length-1;
  } else if (currentTime > allSam[samIndex] && currentTime < allSam[samIndex+1]) {
    if ((currentTime-allSam[samIndex]) > (allSam[samIndex+1]-currentTime)) {
      goalIndex = samIndex+1;
    }
  } else {
    samIndex++;
  }
}

function findClosestSam () {
  print(niceTime(jump));
  if (jump < allSam[0]) {
    samIndex = 0;
    goalIndex = 0;
  } else if (jump > allSam[allSam.length-1]) {
    samIndex = allSam.length-1;
    goalIndex = allSam.length-1;
  } else {
    var test = 0;
    while (jump > allSam[test+1]) {
      test++;
    }
    print(test);
    samIndex = test;
    print(samIndex);
    if ((jump-allSam[samIndex]) > (allSam[samIndex+1]-jump)) {
      goalIndex = samIndex+1;
    } else {
      goalIndex = samIndex;
    }
  }
  if (paused) {
    currentTime = jump;
  } else {
    track.jump(jump);
    jump = undefined;
  }
}

function grader () {
  var dist = currentTime - allSam[goalIndex];
  if (abs(dist) <= 0.1) {
    hits++;
    var points = 1;
    if (!showTheka.checked()) {
      points *= 2;
    }
    if (!showCursor.checked()) {
      points *= 3;
    }
    if (!showTal.checked()) {
      points *= 3;
    }
    score += points;
  }
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

function keyTyped() {
  if (!paused && key.toLowerCase() === "s") {
    attempts++;
    grader();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
