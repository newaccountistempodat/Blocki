/** 
* Copyright © 2015-2016 sagiksp, All Rights Reserved. (Except for the font)
* Font: Raleway (https://www.google.com/fonts/specimen/Raleway)
*/

var canvas,ctx,canMove,player,entities,tping,lvlNumber,phase,msgIndex; //Important variables
var l3p,l3t; //Lvl 3 tutorial variables
var version = "0.6";
var speed = 6;

/**
* Main Functions
*/


window.onload = function main() {
  phase = "Start";
  lvlNumber = 1;
  l3p = 0;
  l3t = 0;
  window.onkeydown = keydown;
  canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  window.addEventListener('click', clickHandler, false);
  init();
  tick();
};

function init() {
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
  ctx.fillStyle = "DarkGray";
  ctx.fillRect(0,0,640,480);
  switch(phase) {
    case "Start":
      label(ctx,"center","center","Blocki","center","60px Raleway","black");
      label(ctx,"center",360,"[Space] to start","center","20px Raleway","black");
      label(ctx,10,25,"V"+version,"left","20px Raleway","black");
      label(ctx,630,25,"Alpha","right","20px Raleway","black");
      break;
    case "stopped":
    case "play":
      rect(ctx,128,48,24*16,24*16,"Gray");
      label(ctx,10,17,"Level "+lvlNumber,"left","20px Raleway","black");
      player.draw(ctx);
      drawEntities(ctx);
      drawMessage();
      break;
    case "paused":
      rect(ctx,128,48,24*16,24*16,"Gray")
      player.draw(ctx);
      drawEntities(ctx);
      rect(ctx,0,0,640,480,"black",0.4);
      label(ctx,"center",200,"Paused","center","60px Raleway","red");
      button(ctx,220,H-40,100,"Retry level",loadLevel,30);
      button(ctx,420,H-40,120,"Back to menu",function() {phase = "Start";},30);
      label(ctx,10,17,"Level "+lvlNumber,"left","20px Raleway","black");
      break;
    case "die":
      drawEntities(ctx);
      rect(ctx,30,30,W-60,H-60,"rgba(255, 255, 255, 0.2)");
      label(ctx,"center",150,"You died.","center","60px Raleway","white");
      button(ctx,W/2,H*(3/4),100,"Retry",loadLevel,30);
      break;
    case "beat":
      drawEntities(ctx);
      label(ctx,"center",50,"Level " + lvlNumber + " Complete","center","60px Raleway","white");
      button(ctx,W/2-100,600,100,"Retry level",loadLevel,30);
      button(ctx,W/2+100,600,120,"Back to menu",function() {phase = "Start";},30);
      label(ctx,"center",H*3/4,"[Space] for next level","center","20px Raleway","white");
      break;
    case "win":
    //You just beat "Blocki"! A shitty ass game that's only published because I found it in my dropbox folder out of nowhere after thinking it was lost for over a year. So, there you go! almost 2 weeks of hard work, a year long break and another week of polish, it's here. Thanks m8!
      label(ctx,"center",100,"Conglagurations!","center","80px Raleway", "white");
      label(ctx,"center",240,"You just beat Blocki! A shitty ass game that's only out","center","26px Raleway", "white");
      label(ctx,"center",270,"because I found it in my dropbox folder out of nowhere","center","25px Raleway", "white");
      label(ctx,"center",300,"after thinking it was lost for over a year. So there you go!","center","24px Raleway", "white");
      label(ctx,"center",330,"almost 2 months of hard work, a year long break and a","center","25px Raleway", "white");
      label(ctx,"center",360,"month of polish, it's here. Thank you for playing!","center","25px Raleway", "white");
      label(ctx,"center",390,"","center","25px Raleway", "white");
      button(ctx,W/2, H - 40, 120, "Back to menu",function() {restart();});
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
      if (phase == "die") {loadLevel();}
      if (phase == "beat") {lvlNumber++;loadLevel();}
      if (phase == "win")  {restart();}
      if (phase == "stopped" && message) {message.end();drawMessage();}
      break;
    case "escape":
      pause("pause");
      break;  
  }
}

//Mouse Handling

function clickHandler(evt) {
  var clickX = evt.pageX - canvas.offsetLeft;
  var clickY = evt.pageY - canvas.offsetTop;
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
        case "I": entities.push(new Entity(EntX,EntY,"inviskill")); break;
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
    case "inviskill": return Entity.INVISKILL;
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

function die() {
  pause("die");
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
    case "die": phase = "die"; break;
    case  "win": phase =  "win"; break;
  }
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
    var msgs = getLevel(lvlNumber).messages || [];
    if (msgs[msgIndex] == null) {pause("continue");return;}
    message = msg(ctx,msgs[msgIndex][0],msgs[msgIndex][1],"OK");
    msgIndex++;
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

    _ctx.fillStyle = "Orange";
    _ctx.fillRect(2,2,28,28);
    _ctx.fillStyle = "Gold";
    _ctx.fillRect(9,9,14,14);
    Entity.INVISKILL = new Image();
    Entity.INVISKILL.src = _c.toDataURL();

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

      if (this.entityAtLoc.render == Entity.KILLBLOCK || this.entityAtLoc == Entity.INVISKILL) { //If in killblock
        die();
      }

      tping = false;
      this.moveHandle(this.dir);
    }

    if (this === player && (player.x < 128 || player.x > 128+24*15 || player.y < 48 || player.y > 48+24*15)) {
      die();
    }
  }

  this.draw = function(ctx) {
    if (this.render == Entity.DISAPPEAR || this.render == Entity.INVISKILL) {
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
