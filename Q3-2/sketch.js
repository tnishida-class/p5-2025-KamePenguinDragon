// 2D アニメーションゲームのようなインタラクション
let x, y;
let vx, vy;
const g = 1;
const vyMax = 20; 
function setup(){
  createCanvas(windowWidth, windowHeight);
  x = width / 2;
  y = height / 2;
  vx = 0;
  vy = 0;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function draw(){
  background(160, 192, 255);
  const size = height * 0.1; // キャラクターのサイズ

  // 地面を描く
  const groundY = height * 0.8;
  fill(64, 192, 64);
  rect(0, groundY, width, height - groundY);

  // BLANK[1] キャラクターの左右移動
if(keyIsDown(LEFT_ARROW)){ x -= 5;
  if(keyIsDown(SHIFT)){ x-= 10; }
 }
  if(keyIsDown(RIGHT_ARROW)){ x += 5;
     if(keyIsDown(SHIFT)){ x+= 10; }
   }
  if(keyIsDown(UP_ARROW)){ y -= 5; }
  if(keyIsDown(DOWN_ARROW)){ y += 5; }
  

  // BLANK[2] 重力とジャンプ
  x += vx;
  y += vy;
  vy += g; // 重力は「速度の変化量」
  vy = constrain(vy, -vyMax, vyMax); // 速度が大きくなりすぎないように調整
  if(x < 0 || x > width){ vx = -1 * vx; }
   x = constrain(x, 0, width);
  y = constrain(y, 0, height * 0.8 - size / 1.4);
  // 速くなりすぎないように制限
  vx = constrain(vx, -20, 20);
  vy = constrain(vy, -20, 20);

  // 位置を更新
  x += vx;
  y += vy;

  // キャラクターを描く
  fill(0);
  ellipse(x, y, size, size);
  //if(keyIsDown(" ".charCodeAt(0))){ }
}
// 
function keyPressed(){
 if(key == " " && y == constrain(y, height * 0.75, height * 0.8))
  vy = -1 * vy;

}