/** 
* Copyright © 2015-2016 sagiksp, All Rights Reserved. (Except for the font)
* Font: Raleway (https://www.google.com/fonts/specimen/Raleway)
*/

var canvas,ctx,canMove,player,entities,tping,lvlNumber,phase,msgIndex,timearr,ptime; //Important variables
var guiLH,guiLD; //GUI Demo variables
var death_timer, death_text, death_opacity, death_opacity_button; //Death screen variables
var l3p,l3t; //Lvl 3 tutorial variables
var version = "0.4.2";


var speed = 6;

/**
* Main Functions
*/


window.onload = function main() {
  phase = "Start";
  lvlNumber = 1;
  l3p = 0;
  l3t = 0;
  ptime = Date.now();
  timearr = [];
  for (var i = 0; i <= 100; i++) {
    timearr.push(60);
  };
  window.onkeydown = keydown;
  canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  window.addEventListener('click', clickHandler, false);
  init();
  tick();
};

function init() {
  death_timer = 0;
  guiLH = 50;
  msgIndex = 0;
  player = new Entity(0,0,"player");
}

function tick() {
  update();
  render();
  window.requestAnimationFrame(tick);
}

function update() {
  clickables = [];
  phase == "play" && (function() {
    player.update();
    for(var e in entities) {
      entities[e].update();
    }
  })();
}

function restart() {
  lvlNumber = 1;
  phase = "Start";
  init()
}

function render() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0,0,W,H);
  drawFPS();  
  switch(phase) {
    case "test":
      button(ctx,0,0,"big","click",function() {console.log("test");});
      break;
    case "Start":
      label(ctx,"center","center","The Game","center","60px Raleway","black");
      label(ctx,"center",H*0.75,"[Space] to start","center","20px Raleway","black");
      label(ctx,"left",17,"V"+version,"left","20px Raleway","black");
      label(ctx,"right",17,"Early Alpha","right","20px Raleway","black");
      button(ctx,W/2,50,"huge","GUI Demo",function() {phase = "gui"});
      break;
    case "stopped":
    case "play":
    //(this.x < W/2-352 || this.x > 320+W/2 || this.y < H/2-352 || this.y > 320+H/2)
      rect(ctx,(W-24*16)/2-4,(H-24*16)/2-4,24*16+8,24*16+8,"red");
      rect(ctx,(W-24*16)/2,(H-24*16)/2,24*16,24*16,"grey");
      //level 3 sequence
      if (l3p == 1) {
        l3t < 20 && (BoundingBox(ctx,W-80,2,80,27,"yellow",4));
        ++l3t >= 40 && (l3t = 0);
      } else if (l3p == 2) {
        l3t < 20 && (BoundingBox(ctx,5,5,80,27,"yellow",4));
        ++l3t >= 40 && (l3t = 0);
      }
      player.draw(ctx);
      drawEntities(ctx);
      drawUI(ctx);
      drawMessage();
      break;
    case "paused":
      player.draw(ctx);
      drawEntities(ctx);
      label(ctx,"center",200,"Paused","center","60px Raleway","red");
      button(ctx,W/2-100,H-40,100,"Retry level",loadLevel,30);
      button(ctx,W/2+100,H-40,120,"Back to menu",function() {phase = "Start";},30);
      drawUI(ctx);
      break;
    case "lose":
      drawEntities(ctx);
      rect(ctx,30,30,W-60,H-60,"rgba(255, 255, 255, 0.2)");
      label(ctx,"center",150,"You died.","center","60px Raleway","white");
      label(ctx,"center",H*3/4,"[Space] to retry","center","20px Raleway","white");
      break;
    case "beat":
      drawEntities(ctx);
      label(ctx,"center",50,"Level " + lvlNumber + " Complete","center","60px Raleway","white");
      button(ctx,W/2-100,600,100,"Retry level",loadLevel,30);
      button(ctx,W/2+100,600,120,"Back to menu",function() {phase = "Start";},30);
      label(ctx,"center",H*3/4,"[Space] for next level","center","20px Raleway","white");
      break;
    case "gui":
      label(ctx,30,"center","Imma label", "left","20px Raleway", "white")

      label(ctx,"center",guiLH,"Imma movin'","center","20px Raleway", "white");
      if (guiLH <= 50) {guiLD = "down";}
      if (guiLH >= H-50) {guiLD = "up";}
      guiLH += guiLD == "down" ? 10 : -10;

      button(ctx,W - 100,H/2-50,120,"Imma Button",function() {});
      button(ctx,W - 100,H/2,170,"Imma nother button",function() {});
      button(ctx,W - 100,H/2+50,170,"Ooo! Another button",function() {});
      button(ctx,W - 100,H - 40,170,"Imma back to menu",function() {phase = "Start";});
      button(ctx,120,40,200,"Click me for a message",function() {message = msg(ctx,"GUIUGUIUG","Welcome To GUIssic park","Thank you!");});
      message && (message.draw());
      break;
    case "win":
    //You just beat "The Game"! A shitty ass game that's only published because I found it in my dropbox folder out of nowhere after thinking it was lost for over a year. So, there you go! almost 2 weeks of hard work, a year long break and another week of polish, it's here. Thanks m8!
      label(ctx,"center",100,"Conglagurations!","center","80px Raleway", "white");
      label(ctx,"center",240,"You just beat \"The Game\"! A shitty ass game that's only","center","25px Raleway", "white");
      label(ctx,"center",270,"published because I found it in my dropbox folder out","center","25px Raleway", "white");
      label(ctx,"center",300,"of nowhere after thinking it was lost for over a year. So,","center","25px Raleway", "white");
      label(ctx,"center",330,"there you go! almost 2 months of hard work, a year long","center","25px Raleway", "white");
      label(ctx,"center",360,"break and another week of polish, it's here. Thanks m8!","center","25px Raleway", "white");
      label(ctx,"center",390,"","center","25px Raleway", "white");
      button(ctx,W/2, H - 40, 120, "Back to menu",function() {restart();});
      break;
    case "die":
      if (death_timer.between(0, 200)) { //phase one
        death_text = "You died";
        death_opacity_button = 0;
        if (death_timer.between(0, 50)) {
          death_opacity = death_timer / 50;
        } else if (death_timer.between(50,150)) {
          death_opacity = 1;
        } else if (death_timer.between(150,200)) {
          death_opacity = 1 - ((death_timer - 150) / 50);
        }
      } else if (death_timer.between(200, 250)) {
        death_opacity = 0
      } else if (death_timer.between(250, 450)) {
        death_text = "You turned into a line"
        if (death_timer.between(250, 300)) {
          death_opacity = (death_timer - 250) / 50;
        } else if (death_timer.between(300,400)) {
          death_opacity = 1;
        } else if (death_timer.between(400,450)) {
          death_opacity = 1 - ((death_timer - 400) / 50);
        }
      } else if (death_timer.between(450, 500)) {
        death_opacity = 0
      } else if (death_timer.between(500, 700)) {
        death_text = "And then into a point"
        if (death_timer.between(500, 550)) {
          death_opacity = (death_timer - 500) / 50;
        } else if (death_timer.between(550,650)) {
          death_opacity = 1;
        } else if (death_timer.between(650,700)) {
          death_opacity = 1 - ((death_timer - 650) / 50);
        }
      } else if (death_timer.between(700, 750)) {
        death_opacity = 0
      } else if (death_timer.between(750, 800)) {
        death_text = "You lost."
        death_opacity = (death_timer - 750) / 50;
      } else if (death_timer.between(800, 850)) {
        death_opacity = 1;
        death_opacity_button = (death_timer - 800) / 50;
      } else if (death_timer == 850) {
        death_text = "You lost."
        death_opacity = 1;
        death_opacity_button = 1;
      }
      ctx.globalAlpha = death_opacity; //rendering start
      label(ctx,W/2+rng(-5,5),H/2+rng(-5,5),death_text,"center","50px Raleway", "white", "middle");
      ctx.globalAlpha = death_opacity_button;
      button(ctx,W/2,H - 40,120,"Back to menu",function() {restart();});
      ctx.globalAlpha = 1; //rendering end
      //label(ctx,50,50,(death_timer + " " + death_opacity),"center","15px Raleway", "Red"); //debugging
      death_timer = death_timer >= 850 ? 850 : death_timer + 1;
      break;
  }
}

/**
* Utility functions
*/

//Key handling

function keydown(evt) {
  if (canMove && phase == "play") {
    switch(evt.keyCode) {
      case 37:player.moveHandle("left");break;
      case 65:player.moveHandle("left");break;
      case 38:player.moveHandle("up");break;
      case 87:player.moveHandle("up");break;
      case 39:player.moveHandle("right");break;
      case 68:player.moveHandle("right");break;
      case 40:player.moveHandle("down");break;
      case 83:player.moveHandle("down");break;
    }
  }
  switch(evt.keyCode){
    case 32:keyHandler("spacebar");break;
    case 27:keyHandler("escape");break;
  }
}
function keyHandler(key) {
  switch(key) {
    case "spacebar":
      if (phase == "Start"){loadLevel();}
      if (phase == "lose") {loadLevel();}
      if (phase == "beat") {lvlNumber++;loadLevel();}
      if (phase == "win")  {restart();}
      if (phase == "die")  {if(death_timer == 850) {restart();} else {death_timer = 850}}
      if (phase == "stopped" && message) {message.end();drawMessage();}
      break;
    case "escape":
      pause("pause");
      break;  
  }
}

//Mouse Handling

function clickHandler(evt) {
  var clickX = evt.pageX - canvas.offsetLeft + W/2;
  var clickY = evt.pageY - canvas.offsetTop + H/2;
  if (clickX > W || clickY > H) {return;}
  for (var index in clickables) {
    var e = clickables[index];
    if (AABBIntersect(e.x,e.y,e.w,e.h,clickX,clickY,1,1)) {
      e.func();
    }
  }
}

//Level handling

function ParseLevel() {
  var level = getLevel(lvlNumber).level;
  for (var row in level) {
    for (var col in level[row]) {
      var EntX = parseInt(col*24) + (W-24*16)/2;
      var EntY = parseInt(row*24) + (H-24*16)/2;
      switch(level[row][col]) {
        case "X": player.tp(EntX,EntY); break;
        case "B": entities.push(new Entity(EntX,EntY,"block")); break;
        case "E": entities.push(new Entity(EntX,EntY,"end")); break;
        case "P": entities.push(new Entity(EntX,EntY,"tp")); break;
        case "K": entities.push(new Entity(EntX,EntY,"kill")); break;
        case "D": entities.push(new Entity(EntX,EntY,"disappear")); break;
        //case ".": entities.push(new Entity(EntX,EntY,"placeholder")); break; //enables red placeholder blocks, for testing
      }
    }
  }
}

function getType(sType) {
  switch(sType) {
    case "player": return Entity.PLAYER;
    case "block": return Entity.BLOCK;
    case "end": return Entity.ENDGOAL;
    case "tp": return Entity.TELEPORT;
    case "kill": return Entity.KILLBLOCK;
    case "disappear": return Entity.DISAPPEAR;
    case "placeholder": return Entity.PLACEHOLDER;
  }
}

function getLevel(num){return levels[num-1];}

function loadLevel() {
  player.dir = "idle";
  phase = "play";
  canMove = true;
  tping = false;
  msgIndex = 0;
  entities = [];
  ParseLevel();
  drawMessage();
}

//Entity handling

function getEntityAtLoc(x,y) {
  for(var e in entities) {
    if (entities[e].x == x && entities[e].y == y) {
      return entities[e];
    }
  }
  return {render: "empty"};
}

//Events

function beat() {
  if (lvlNumber != levels.length) {
    pause("beat");
  } else {
    pause("win");
  }
}

function lose(e) {
  //console.log(e);
  player.lives--;
  pause(player.lives === 0 ? "die" : "lose");
}

function pause(mode) {
  switch(mode) {
    case "stop": phase = "stopped"; break;
    case "continue": phase = "play"; break;
    case "pause":
      if (phase == "paused") {phase = "play";} //unpause
      else if (phase == "play") {phase = "paused"};
      break;
    case "beat": phase = "beat"; break;
    case "lose": phase = "lose"; break;
    case  "win": phase =  "win"; break;
    case  "die": phase =  "die"; break;
  }
}

//Rendering functions

function drawUI(ctx) {
  player.lives >= 3 && rect(ctx,W-75,5,20,20,"red");
  player.lives >= 2 && rect(ctx,W-50,5,20,20,"red");
  player.lives >= 1 && rect(ctx,W-25,5,20,20,"red");
  label(ctx,10,17,"Level "+lvlNumber,"left","20px Raleway","black");
}

function drawFPS() {
  time = Date.now();
  delta = (time - ptime)/1000;
  ptime = time;
  timearr.push(Math.floor(1/delta));
  timearr.shift();
  var fpsavg = Math.floor(timearr.reduce(function(a, b) { return a + b; }, 0) / 100);  
  //label(ctx,0,H,fpsavg,"left","35px Raleway","red","bottom");
  console.log(fpsavg);
}

function drawEntities(ctx) {
  for(var e in entities) {   
      entities[e].draw(ctx);
  }
}

function drawMessage() {
  if (message) {
    message.draw();
    pause("stop");
  } else {
    var msgs = getLevel(lvlNumber).messages;
    if (msgIndex >= msgs.length) {pause("continue");return;}
    message = msg(ctx,msgs[msgIndex][0],msgs[msgIndex][1],"OK");
    msgIndex++;
    l3t = 0;
    (msgIndex == 1 && lvlNumber == 3) && (l3p = 1);
    (msgIndex == 2 && lvlNumber == 3) && (l3p = 2);
    (msgIndex == 3 && lvlNumber == 3) && (l3p = 0);
  }
}

/**
* Constructors
*/


function Entity(x, y, type) {
  this.x = x;
  this.y = y;
  this.entityAtLoc = null;
  this.render = getType(type);
  this.dir = "idle";
  this.lives = 3;
  if (!this.render) {
    var _c = document.createElement('canvas'); _c.height = _c.width = 32; _ctx = _c.getContext('2d');

    _ctx.beginPath();
    _ctx.arc(16, 16, 14, 0, 2 * Math.PI, false);
    _ctx.fillStyle = '#44F';
    _ctx.fill();
    _ctx.closePath();
    _ctx.beginPath();
    _ctx.arc(16, 16, 7, 0, 2 * Math.PI, false);
    _ctx.fillStyle = '#88F';
    _ctx.fill();
    _ctx.closePath();
    Entity.PLAYER = new Image();
    Entity.PLAYER.src = _c.toDataURL();

    _ctx.fillStyle = "DarkGray";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "#777";
    _ctx.fillRect(6,6,20,20);
    Entity.BLOCK = new Image();
    Entity.BLOCK.src = _c.toDataURL();
    
    _ctx.fillStyle = "Lime";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "#99FF99";
    _ctx.fillRect(9,9,14,14);
    Entity.ENDGOAL = new Image();
    Entity.ENDGOAL.src = _c.toDataURL();

    _ctx.fillStyle = "Magenta";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "Purple";
    _ctx.fillRect(9,9,14,14);
    Entity.TELEPORT = new Image();
    Entity.TELEPORT.src = _c.toDataURL();

    _ctx.fillStyle = "Red";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "DarkRed";
    _ctx.fillRect(9,9,14,14);
    Entity.KILLBLOCK = new Image();
    Entity.KILLBLOCK.src = _c.toDataURL();

    _ctx.fillStyle = "LightGray";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "White";
    _ctx.fillRect(9,9,14,14);
    Entity.DISAPPEAR = new Image();
    Entity.DISAPPEAR.src = _c.toDataURL();

    _ctx.fillStyle = "#E20";
    _ctx.fillRect(2,2,28,28);
    Entity.PLACEHOLDER = new Image();
    Entity.PLACEHOLDER.src = _c.toDataURL();

    this.render = getType(type);
  }

  this.update = function() {
    this.entityAtLoc = getEntityAtLoc(this.x,this.y);
    if (this.dir != "idle") {
      if (this.entityAtLoc.render == Entity.ENDGOAL) { //If in end goal
        beat();
        return;
      }

      if (this.entityAtLoc.render == Entity.TELEPORT && !tping) { //If in teleporter
        for(var e in entities) {
          var ent = entities[e];
          if (ent.render == Entity.TELEPORT && ent != this.entityAtLoc) {
            //console.log("Teleporting to X:" + ent.x + " Y:" + ent.y);
            tping = true;
            this.tp(ent.x,ent.y);
            break;
          }
        }
      }

      if (this.entityAtLoc.render == Entity.KILLBLOCK) { //If in killblock
        lose(this);
      }

      tping = false;
      this.moveHandle(this.dir);
    }

    //console.log([(W-24*16)/2,(H-24*16)/2,24*16,24*16]);

    if (this === player && (player.x < 128 || player.x > 512 || player.y < 48 || player.y > 432)) {
      lose(this);
      //pause("pause");
    }
  }

  this.draw = function(ctx) {
    if (this.render == Entity.DISAPPEAR) {
      var dist = Math.sqrt(Math.pow(Math.abs(this.x-player.x),2)+Math.pow(Math.abs(this.y-player.y),2));
      if (dist < 96) {
        ctx.globalAlpha = Math.min(-dist*0.015625+1.5,1);
        ctx.drawImage(this.render,this.x,this.y,24,24);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.drawImage(this.render,this.x,this.y,24,24);
    }
  }

  this.move = function(x,y) {
    this.x += x;
    this.y += y;
  }

  this.tp = function(x,y) {
    this.x = x;
    this.y = y;
  }

  this.moveHandle = function(dir) {
    if ([Entity.BLOCK,Entity.DISAPPEAR].indexOf(getEntityAtLoc(this.x+(dir=="left"?-24:dir=="right"?24:0),this.y+(dir=="up"?-24:dir=="down"?24:0)).render)>-1) { //If block infront of you
      this.dir = "idle";
      canMove = true;
    } else {
      canMove = false;
      this.dir = dir;
      this.move(dir=="left"?-speed:dir=="right"?speed:0,dir=="up"?-speed:dir=="down"?speed:0);
    }    
  }
}