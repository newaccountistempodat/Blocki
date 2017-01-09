var clickables = [];
var mousePos = {x:0,y:0};
var message;
var W = 640;
var H = 480;

function label(ctx,x,y,content,align,font,color,textBaseline) {
	textBaseline && (ctx.textBaseline = textBaseline);
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.textAlign = align;
	ctx.fillText(content, x == "left" ? 0 : x == "center" ? W/2 : x == "right" ? W : x,
												y == "top" ? 0 : y == "center" ? H/2 : y == "bottom" ? H : y);
}

function rect(ctx,x,y,w,h,color) {
	ctx.fillStyle = color;
	ctx.fillRect(x,y,w,h);
}

function BoundingBox(ctx,x,y,w,h,scolor,sw) {
	ctx.strokeStyle = scolor ? scolor : "black";
	ctx.lineWidth = sw ? sw : 2;
	ctx.strokeRect(x,y,w,h);
}

function clrRect(ctx,x,y,w,h) {
	ctx.clearRect(x,y,w,h);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

function button(ctx,x,y,size,content,func,He) {
	var w = size == "huge" ? 100 : size == "big" ? 80 : size == "small" ? 40 : size;
	var h = 25;
	//if (ctx.measureText(content).width + 10 > w) {w = ctx.measureText(content).width / 2;}
	rect(ctx,x-w/2,y-h/2,w,h,AABBIntersect(mousePos.x,mousePos.y,1,1,x,y,w,h) ? "#5555ff" : "#4444ff");
	ctx.textBaseline = "middle";
	label(ctx,x,y,content,"center","18px Raleway","black");
	clickables.push({x:x,y:y,w:w,h:h,func:func}); //Uses the click function in main
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {x: evt.clientX - rect.left,y: evt.clientY - rect.top};
    return mousePos;
}

function msg(ctx,title,content,btnText,btnExtra) {
	this.draw = function() {
		var end = this.end;
		ctx.globalAlpha = .9;
		rect(ctx,W*0.1,H*0.2,W*0.8,H*0.7,"#ffffaa");
		ctx.globalAlpha = 0.8;
		ctx.textBaseline = "top";
		label(ctx,"center",H*0.2,title,"center","60px Raleway","black");
		rect(ctx,W*0.1,H*0.35,W*0.8,3 ,"#000")
		ctx.globalAlpha = 1;
		ctx.font = "30px Raleway";
		ctx.textAlign = "left";
		wrapText(ctx,content,W*0.15,H*0.35,W*0.7,35);
		button(ctx,W/2,H*0.85,120,btnText,end);
	}
	this.end = function() {
		message = null;
		btnExtra && btnExtra();
	}
	return this;
}

function AABBIntersect(ax,ay,aw,ah,bx,by,bw,bh) {
	return (Math.abs(ax - bx) * 2 < (aw + bw)) &&
         (Math.abs(ay - by) * 2 < (ah + bh));
}

Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return this >= min && this < max;
};

function rng(a,b) {
	return Math.floor(Math.random() * b) + a  
}