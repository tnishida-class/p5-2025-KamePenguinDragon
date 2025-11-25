// ギリシャ国旗（ほかの国旗に挑戦してもOK）

// 最終課題を制作しよう
let player;
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let playerImg;

const playerBulletSpeed = 10;
const enemyBulletSpeed = 2;

let playerHP = 10;
const maxHP = 10;

// 牌の種類
const jiTiles = ["東","南","西","北","白","發","中"];
const manTiles = ["1m","2m","3m","4m","5m","6m","7m","8m","9m"];
const pinTiles = ["1p","2p","3p","4p","5p","6p","7p","8p","9p"];
const souTiles = ["1s","2s","3s","4s","5s","6s","7s","8s","9s"];

const kanjiNums = ["一","二","三","四","五","六","七","八","九"];

let handTiles = [];
const maxHand = 13; // 手牌の上限

// 国士無双見本牌
const sampleTiles = ["東","南","西","北","白","發","中",
                     "1m","9m","1p","9p","1s","9s"];
const sampleStartX = 50;
const sampleStartY = 100; // HPバーの下にずらした
const spacing = 35;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = { x: width/2, y: height*0.8, size: 30, speed: 5 };

  textAlign(CENTER, CENTER);
  textSize(16);

  // プレイヤー三角形
  playerImg = createGraphics(30,30);
  playerImg.fill(0,255,255);
  playerImg.noStroke();
  playerImg.triangle(15,0,0,30,30,30);

  // 敵5体
enemies.push({ x:150, y:100, w:40, h:40, hp:10, shootTimer:0, vx:4, vy:0 });
enemies.push({ x:490, y:150, w:40, h:40, hp:12, shootTimer:0, vx:-5, vy:0 });
enemies.push({ x:320, y:50,  w:50, h:50, hp:15, shootTimer:0, vx:4, vy:2 });
enemies.push({ x:250, y:200, w:45, h:45, hp:12, shootTimer:0, vx:2, vy:4 });
enemies.push({ x:400, y:80,  w:35, h:35, hp:8,  shootTimer:0, vx:-4, vy:2 });


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0,0,50);

  // 戦闘場
  rectMode(CORNER);
  fill(50);
  rect(0,height*0.6,width,height*0.4);

  // HPバー
  let barWidth = 200;
  let barHeight = 20;
  let leftX = 50;
  fill(255,0,0);
  rect(leftX,20,barWidth,barHeight);
  fill(0,255,0);
  let greenWidth = map(playerHP,0,maxHP,0,barWidth);
  greenWidth = constrain(greenWidth,0,barWidth);
  rect(leftX,20,greenWidth,barHeight);

  // プレイヤー操作
  if(keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if(keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if(keyIsDown(UP_ARROW)) player.y -= player.speed;
  if(keyIsDown(DOWN_ARROW)) player.y += player.speed;
  player.x = constrain(player.x,player.size/2,width-player.size/2);
  player.y = constrain(player.y,height*0.6+player.size/2,height-player.size/2);

  // プレイヤー描画
  imageMode(CENTER);
  image(playerImg,player.x,player.y);

  // 敵動き＋弾発射
  for(let e of enemies){
    e.x += e.vx;
    e.y += e.vy;
    if(e.x<e.w/2||e.x>width-e.w/2) e.vx*=-1;
    if(e.y<0||e.y>height*0.6-e.h/2) e.vy*=-1;
    fill(255,0,255);
    rect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);

    e.shootTimer++;
    if(e.shootTimer%40===0){
      let tiles = [...jiTiles,...manTiles,...pinTiles,...souTiles];
      let tileName = random(tiles);
      enemyBullets.push({x:e.x,y:e.y,vx:0,vy:enemyBulletSpeed,tile:tileName,hit:false});
    }
  }

  // プレイヤー弾更新
  for(let pb of playerBullets){
    pb.y -= playerBulletSpeed;
    fill(255);
    ellipse(pb.x,pb.y,10);

    for(let eb of enemyBullets){
      if(!eb.hit && dist(pb.x,pb.y,eb.x,eb.y)<25){
        if(handTiles.length < maxHand){
          if(!sampleTiles.includes(eb.tile)){
            gameOver("不要牌を取った");
            return;
          }
          let neededCount = (eb.tile.endsWith("m")||eb.tile.endsWith("p")||eb.tile.endsWith("s"))?1:3;
          let currentCount = handTiles.filter(t=>t===eb.tile).length;
          if(currentCount >= neededCount){
            gameOver("牌が多すぎる");
            return;
          }
          handTiles.push(eb.tile);
        }
        eb.hit = true;
        pb.hit = true;
      }
    }
  }
  playerBullets = playerBullets.filter(b=>!b.hit && b.y>-10);

  // 敵弾描画
  for(let b of enemyBullets){
    if(b.hit) continue;
    b.x += b.vx;
    b.y += b.vy;
    drawTile(b.x,b.y,b.tile);
    if(dist(b.x,b.y,player.x,player.y)<10+player.size/2){
      if(frameCount%5===0) playerHP--;
    }
  }
  enemyBullets = enemyBullets.filter(b=>!b.hit && b.y<height+20);

  // 敵HPチェック
  for(let e of enemies){
    if(e.hp<=0) enemies = enemies.filter(obj=>obj!==e);
  }

  // 国士無双見本牌描画
  drawSampleTiles();

  // 手牌描画
  drawHand();

  // 勝利判定
  if(handTiles.length === maxHand){
    if(checkYakuman(handTiles)){
      fill(0,255,255);
      textSize(32);
      text("国士無双完成！", width/2, height/2);
      noLoop();
    }
  }

  // HP0でゲームオーバー
  if(playerHP <= 0){
    gameOver("HP0 GAME OVER");
  }
}

function keyPressed(){
  if(key===" "){
    playerBullets.push({x:player.x,y:player.y-player.size/2,hit:false});
  }
}

// 見本牌描画
function drawSampleTiles(){
  textSize(16);
  fill(255);
  textAlign(CENTER,CENTER);
  text("国士無双に必要な牌", sampleStartX + (sampleTiles.length*spacing)/2, sampleStartY - 30);

  for (let i=0; i<sampleTiles.length; i++){
    drawTile(sampleStartX + i*spacing, sampleStartY, sampleTiles[i]);
  }
}
// 手牌描画（見本牌の下に配置）
function drawHand(){
  for (let i=0; i<sampleTiles.length; i++){
    let tile = sampleTiles[i];
    let count = handTiles.filter(t => t===tile).length;
    for (let j=0; j<count; j++){
      let x = sampleStartX + i*spacing;
      let y = sampleStartY + 50 + j*45;
      drawTile(x,y,tile);
    }
  }
}

// 牌描画
function drawTile(x,y,tile){
  const tileHeight = 40;
  const tileWidth = 30;
  fill(255); stroke(0); strokeWeight(2);
  rectMode(CENTER);
  rect(x,y,tileWidth,tileHeight,5);

  noStroke();
  textAlign(CENTER,CENTER);
  textSize(16);
  textFont('serif');

  if(["東","南","西","北"].includes(tile)){
    fill(0); text(tile,x,y);
  } else if(tile==="發"){ fill(0,128,0); text(tile,x,y);
  } else if(tile==="中"){ fill(255,0,0); text(tile,x,y);
  } else if(tile==="白"){ fill(255); text(tile,x,y); }
  else if(tile.endsWith("m")){
    fill(255,0,0);
    let num = parseInt(tile);
    let chars = [kanjiNums[num-1],"萬"];
    for(let i=0;i<chars.length;i++){
      text(chars[i], x, y - 8 + i*16);
    }
  } else if(tile.endsWith("p")){
    let num = parseInt(tile);
    let positions = [];
    if(num===1) positions=[[0,0]];
    else if(num===2) positions=[[-6,-6],[6,6]];
    else if(num===3) positions=[[-6,-6],[0,0],[6,6]];
    else if(num===4) positions=[[-6,-8],[-6,8],[6,-8],[6,8]];
    else if(num===5) positions=[[-6,-8],[-6,8],[6,-8],[6,8],[0,0]];
    else if(num===6) positions=[[-6,-10],[-6,0],[-6,10],[6,-10],[6,0],[6,10]];
    else if(num===7) positions=[[-6,-10],[-6,0],[-6,10],[6,-10],[6,0],[6,10],[0,-6]];
    else if(num===8) positions=[[-6,-12],[-6,-4],[-6,4],[-6,12],[6,-12],[6,-4],[6,4],[6,12]];
    else if(num===9) positions=[[-6,-12],[-6,0],[-6,12],[0,-12],[0,0],[0,12],[6,-12],[6,0],[6,12]];
    for(let p of positions){
      let px=x+p[0], py=y+p[1];
      fill(0); ellipse(px,py,12);
      fill(255,0,0); ellipse(px,py,6);
    }
  } else if(tile.endsWith("s")){
    let num = parseInt(tile);
    let positions = [];
    if(num===1) positions=[[0,0]];
    else if(num===2) positions=[[-6,-6],[6,6]];
    else if(num===3) positions=[[-6,-6],[0,0],[6,6]];
    else if(num===4) positions=[[-6,-8],[-6,8],[6,-8],[6,8]];
    else if(num===5) positions=[[-6,-8],[-6,8],[6,-8],[6,8],[0,0]];
    else if(num===6) positions=[[-6,-10],[-6,0],[-6,10],[6,-10],[6,0],[6,10]];
    else if(num===7) positions=[[-6,-10],[-6,0],[-6,10],[6,-10],[6,0],[6,10],[0,-6]];
    else if(num===8) positions=[[-6,-12],[-6,-4],[-6,4],[-6,12],[6,-12],[6,-4],[6,4],[6,12]];
    else if(num===9) positions=[[-6,-12],[-6,0],[-6,12],[0,-12],[0,0],[0,12],[6,-12],[6,0],[6,12]];
    for(let p of positions){
      let px=x+p[0], py=y+p[1];
      fill(0,200,0); rect(px,py,6,6,2);
    }
  }
}

// 国士無双判定
function checkYakuman(hand){
  for(let t of sampleTiles){
    let needed = 1;
    if(hand.filter(ht=>ht===t).length !== needed) return false;
  }
  return true;
}

// ゲームオーバー
function gameOver(msg){
  fill(255,0,0);
  textSize(32);
  text(msg, width/2, height/2);
  noLoop();
}