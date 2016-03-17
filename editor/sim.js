var N_PART = 13;
var N_DANCER = 7;
var BPM = 128.000;

var DELAY = 0.110;

var audio = document.getElementById("myAudio");
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
ctx.lineWidth = 3;

var BLUE = "#0000FF";
var BLUE_D = "#000022";
var GREEN = "#00FF00";
var GREEN_D = "#001100";
var YELLOW = "#FFFF00";
var YELLOW_D = "#111100";
var RED = "#FF0000";
var RED_D = "#220000";

Data = JSON.parse(Data);
Pos = JSON.parse(Pos);

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function getPos(idx, time)
{
  var bx = 0, by = 0;
  var S = Pos[idx].length;

  var lb = 0, rb = S-1;
  while(lb < rb)
  {
    var mb = (lb + rb + 1) >> 1;
    if(Pos[idx][mb][0] > time)
      rb = mb - 1;
    else
      lb = mb;
  }

  var t1 = Pos[idx][lb][0];
  var x1 = Pos[idx][lb][1];
  var y1 = Pos[idx][lb][2];

  if(lb == S-1) return [x1, y1];
  
  var t2 = Pos[idx][lb+1][0];
  var x2 = Pos[idx][lb+1][1];
  var y2 = Pos[idx][lb+1][2];

  bx = x1 + (x2-x1) * (time-t1) / (t2-t1);
  by = y1 + (y2-y1) * (time-t1) / (t2-t1);

  return [bx, by];
}

function getLight(idx, part, time)
{
  var res = 0;
  var S = Data[idx][part].length;

  if(S == 0) return res;

  var lb = 0, rb = S-1;
  while(lb < rb)
  {
    var mb = (lb + rb + 1) >> 1;
    if(Data[idx][part][mb][0] > time)
      rb = mb - 1;
    else
      lb = mb;
  }

  if(Data[idx][part][lb][0] <= time && time <= Data[idx][part][lb][1])
  {
    res = 255;
  }  

  return res;
}

function draw_time(time)
{
  var beats = time / 60.0 * BPM;
  var nb = parseInt(beats);
  var frac = beats - nb;
  frac = parseInt(frac*100) / 100;
  var bar = parseInt(nb / 4) + 1;
  nb = nb % 4 + 1;
  var text = bar + " - " + nb + " - " + frac;
  
  ctx.font = "20px Monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(
      text,
      0,
      canvas.height-20
      );
}

function animate(darr, canvas, ctx, startTime)
{
  // update
  //var time = ((new Date()).getTime() - startTime) / 1000;
  
  var time = audio.currentTime + DELAY;

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(var i=0; i<N_DANCER; i++)
  {
    for(var j=0; j<N_PART; j++)
    {
      var res = getLight(i, j, time);
      darr[i].setLight(j, res > 0);
      var pos = getPos(i, time);
      darr[i].setBasePos(pos[0], pos[1]);
    }
  }

  for(var i=0; i<N_DANCER; i++)
    darr[i].draw();
  draw_time(time);

  // request new frame
  requestAnimFrame(function() {
    animate(darr, canvas, ctx, startTime);
  });
}

function Dancer(id, bx, by)
{
  this.id = id;
  this.base_x = bx;
  this.base_y = by;
  this.height = 160;
  this.width = 80;
  this.light = Array(N_PART);
  for(var i=0; i<N_PART; i++)
    this.light[i] = 0;
};

Dancer.prototype.setLight = function(idx, val)
{
  this.light[idx] = val;
};

Dancer.prototype.setBasePos = function(bx, by)
{
  this.base_x = bx;
  this.base_y = by;
}

Dancer.prototype.draw = function()
{
  // Number
  var head_radius = 20;
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#FF0000";
  ctx.fillText(
      this.id,
      this.base_x + this.width / 2 - 5,
      this.base_y + head_radius + 8
      );

  // A head
  ctx.strokeStyle = (this.light[0] ? BLUE : BLUE_D);
  ctx.beginPath();
  ctx.arc(
      this.base_x + this.width / 2,
      this.base_y + head_radius,
      head_radius - 3,
      0,
      Math.PI * 2
      );
  ctx.stroke();
  
  // HI body
  var b1_height = 30;
  var b2_height = 16;
  var b1_width = 30;
  ctx.strokeStyle = (this.light[7] ? GREEN : GREEN_D);
  ctx.strokeRect(
      this.base_x + this.width/2 - b1_width/2,
      this.base_y + head_radius * 2,
      b1_width,
      b1_height
      );

  ctx.strokeStyle = (this.light[8] ? YELLOW : YELLOW_D);
  ctx.strokeRect(
      this.base_x + this.width/2 - b1_width/2,
      this.base_y + head_radius * 2 + b1_height + 5,
      b1_width,
      b2_height
      );

  // JKLM leg

  var l1_height = 30;
  var l2_height = 20;
  var l_width = 11;
  var f_height = 6;
  var f_width = 14;
  ctx.strokeStyle = (this.light[9] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width/2 - l_width*1.35,
      this.base_y + 100,
      l_width,
      l1_height
      );
  ctx.strokeStyle = (this.light[10] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width/2 + l_width*0.35,
      this.base_y + 100,
      l_width,
      l1_height
      );
  ctx.strokeStyle = (this.light[11] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width/2 - l_width*1.35,
      this.base_y + 100 + l1_height + 5,
      l_width,
      l2_height
      );
  ctx.strokeRect(
      this.base_x + this.width/2 - l_width*1.35 - f_width * 0.2,
      this.base_y + 100 + l1_height + 5 + l2_height,
      f_width,
      f_height
      );

  ctx.strokeStyle = (this.light[12] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width/2 + l_width*0.35,
      this.base_y + 100 + l1_height + 5,
      l_width,
      l2_height
      );
  ctx.strokeRect(
      this.base_x + this.width/2 + l_width*0.35 + f_width * 0.0,
      this.base_y + 100 + l1_height + 5 + l2_height,
      f_width,
      f_height
      );

  // BCDEFG arm, hand

  var h_width = 10;
  var h1_height = 10;
  var h2_height = 15;
  var h_radius = 7;
  ctx.strokeStyle = (this.light[1] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + h_width,
      this.base_y + head_radius*2,
      h_width,
      h1_height
      );
  ctx.strokeStyle = (this.light[1] ? YELLOW : YELLOW_D);
  ctx.strokeRect(
      this.base_x + h_width,
      this.base_y + head_radius*2 + h1_height + 5,
      h_width,
      h1_height
      );
  ctx.strokeStyle = (this.light[2] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + h_width,
      this.base_y + head_radius*2 + 2*h1_height + 10,
      h_width,
      h2_height
      );
  ctx.strokeStyle = (this.light[3] ? GREEN : GREEN_D);
  ctx.beginPath();
  ctx.arc(
      this.base_x + h_width + h_radius - 2,
      this.base_y + head_radius*2 + 57,
      h_radius,
      0,
      Math.PI * 2
      );
  ctx.stroke();
  
  ctx.strokeStyle = (this.light[4] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width - h_width*2,
      this.base_y + head_radius*2,
      h_width,
      h1_height
      );
  ctx.strokeStyle = (this.light[4] ? YELLOW : YELLOW_D);
  ctx.strokeRect(
      this.base_x + this.width - h_width*2,
      this.base_y + head_radius*2 + h1_height + 5,
      h_width,
      h1_height
      );
  ctx.strokeStyle = (this.light[5] ? BLUE : BLUE_D);
  ctx.strokeRect(
      this.base_x + this.width - h_width*2,
      this.base_y + head_radius*2 + 2*h1_height + 10,
      h_width,
      h2_height
      );
  ctx.strokeStyle = (this.light[6] ? GREEN : GREEN_D);
  ctx.beginPath();
  ctx.arc(
      this.base_x + this.width - h_width*2 + h_radius - 2,
      this.base_y + head_radius*2 + 57,
      h_radius,
      0,
      Math.PI * 2
      );
  ctx.stroke();
};


var darr = Array(N_DANCER);
for(var i=0; i<N_DANCER; i++)
  darr[i] = new Dancer(i+1, 50+100*i, 80);

//for(var i=0; i<N_DANCER; i++)
  //darr[i].draw();

// wait one second before starting animation
setTimeout(function() {
  var startTime = (new Date()).getTime();
  animate(darr, canvas, ctx, startTime);
}, 500);