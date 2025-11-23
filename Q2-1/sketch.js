// 小手調べ

// sketch.js
// 1画面ボス戦（Cuphead風ミニ）
// 操作:
//  ← → : 移動
//  ↑ or Space : ジャンプ
//  Z : ショット
//  Shift: ダッシュ（左右）
//  Space(ゲームオーバー時): リスタート

// ----- プレイヤー -----
let px, py;
let pvx = 0, pvy = 0;
const G = 0.9;
const PLAYER_SIZE = 48;
let onGround = false;
let facing = 1; // 1:right -1:left
let bullets = [];
let invFrames = 0;
let lives = 3;

// ----- ボス -----
let boss = {
  x: 0, y: 0, w: 240, h: 120,
  hp: 100, maxHp: 100,
  phase: 1,
  timer: 0,
  state: "idle", // idle, shoot, diving, recover
  dx:0, dy:0
};
let bossBullets = [];

// ----- ゲーム状態 -----
let groundY;
let gameOver = false;
let win = false;
let startTime = 0;
let shootCooldown = 0;

function setup(){
  createCanvas(windowWidth, windowHeight);
  resetGame();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  groundY = height * 0.78;
}

function resetGame(){
  groundY = height * 0.78;
  px = width * 0.25;
  py = groundY - PLAYER_SIZE / 2;
  pvx = 0; pvy = 0;
  bullets = [];
  bossBullets = [];
  boss.x = width * 0.75;
  boss.y = groundY - boss.h / 2 - 120; // 少し上
  boss.hp = boss.maxHp;
  boss.phase = 1;
  boss.timer = 0;
  boss.state = "idle";
  boss.dx = boss.dy = 0;
  invFrames = 0;
  lives = 3;
  gameOver = false;
  win = false;
  startTime = millis();
  shootCooldown = 0;
}

// ----- 描画ループ -----
function draw(){
  background(90, 140, 210);

  // 地面
  fill(50, 150, 60);
  noStroke();
  rect(0, groundY, width, height - groundY);

  if (!gameOver && !win) {
    // プレイヤー入力
    handlePlayerControl();

    // 物理(プレイヤー)
    applyPhysicsToPlayer();

    // プレイヤー弾更新
    updateBullets();

    // ボスAI & 攻撃
    updateBoss();

    // ボス弾更新
    updateBossBullets();

    // 衝突判定
    checkCollisions();

    // フェーズ移行
    if (boss.hp <= boss.maxHp/2 && boss.phase === 1){
      boss.phase = 2;
      boss.timer = 0;
      boss.state = "idle";
    }
  }

  // 描画: プレイヤー
  drawPlayer();

  // 描画: 弾
  drawBullets();
  drawBossBullets();

  // 描画: ボス
  drawBoss();

  // UI
  drawUI();

  // ゲームオーバー表示
  if (gameOver){
    fill(0, 170);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME OVER", width/2, height/2 - 40);
    textSize(20);
    text("Space でリスタート", width/2, height/2 + 20);
  }

  if (win){
    fill(255, 200);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("YOU WIN!", width/2, height/2 - 40);
    textSize(20);
    text("Space でリスタート", width/2, height/2 + 20);
  }
}

// ----- プレイヤー制御 -----
function handlePlayerControl(){
  let speed = 4;
  if (keyIsDown(LEFT_ARROW)) {
    px -= speed;
    facing = -1;
    if (keyIsDown(SHIFT)) px -= 3;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    px += speed;
    facing = 1;
    if (keyIsDown(SHIFT)) px += 3;
  }

  // ジャンプ (↑ または Space)
  if ((keyIsDown(38) || keyIsDown(32)) && onGround){
    pvy = -14;
    onGround = false;
  }

  // 発射（連射はクールダウン）
  if (keyIsDown(90)){ // Z
    if (shootCooldown <= 0){
      spawnPlayerBullet();
      shootCooldown = 14; // クールダウンフレーム
    }
  }
  if (shootCooldown > 0) shootCooldown--;

  // 画面端制限
  px = constrain(px, PLAYER_SIZE/2, width - PLAYER_SIZE/2);
}

// ----- 物理 -----
function applyPhysicsToPlayer(){
  // 重力
  pvy += G;
  pvy = constrain(pvy, -30, 40);
  py += pvy;

  // 地面判定
  if (py >= groundY - PLAYER_SIZE / 2){
    py = groundY - PLAYER_SIZE / 2;
    pvy = 0;
    onGround = true;
  } else {
    onGround = false;
  }

  if (invFrames > 0) invFrames--;
}

// ----- 弾処理 -----
function spawnPlayerBullet(){
  let bx = px + facing * (PLAYER_SIZE/2 + 6);
  let by = py;
  bullets.push({ x: bx, y: by, vx: 12 * facing, r: 8 });
}

function updateBullets(){
  for (let i = bullets.length - 1; i >= 0; i--){
    let b = bullets[i];
    b.x += b.vx;
    // 画面外削除
    if (b.x < -50 || b.x > width + 50) bullets.splice(i,1);
  }
}

function drawBullets(){
  fill(255, 240, 60);
  noStroke();
  for (let b of bullets) ellipse(b.x, b.y, b.r*2);
}

// ----- ボス処理 -----
function updateBoss(){
  boss.timer++;

  if (boss.phase === 1){
    // フェーズ1: 弾を放つパターン中心
    if (boss.timer % 90 === 0){
      boss.state = "shoot";
      spawnBossSpread();
    }
    // 小刻みに左右揺れ
    boss.x = width * 0.7 + sin(boss.timer * 0.02) * 40;
  } else {
    // フェーズ2: 頻度増加 + 突進（ダイブ）を混ぜる
    if (boss.timer % 60 === 0){
      boss.state = random() < 0.6 ? "shoot" : "dive";
      if (boss.state === "shoot") spawnBossRing();
      if (boss.state === "dive") beginBossDive();
    }
    boss.x = width * 0.7 + sin(boss.timer * 0.04) * 80;
  }

  // ボスダイブ進行
  if (boss.state === "diving"){
    boss.y += boss.dy;
    boss.x += boss.dx;
    if (boss.y >= groundY - boss.h/2){
      boss.y = groundY - boss.h/2;
      boss.state = "recover";
      boss.timer = 0;
      spawnBossShock();
    }
  } else if (boss.state === "recover"){
    if (boss.timer > 40){
      boss.state = "idle";
      boss.timer = 0;
      boss.y = groundY - boss.h/2 - 120;
    }
  }
}

// ボス弾生成（フェーズ1：扇形）
function spawnBossSpread(){
  let bulletsCount = 9;
  let baseX = boss.x;
  let baseY = boss.y + 30;
  for (let i = 0; i < bulletsCount; i++){
    let a = map(i, 0, bulletsCount-1, -PI/3, PI/3) + random(-0.08,0.08);
    let speed = 3 + random(0,1.5);
    bossBullets.push({ x: baseX, y: baseY, vx: cos(a)*speed, vy: sin(a)*speed, r: 10 });
  }
}

// ボス弾生成（フェーズ2：リング）
function spawnBossRing(){
  let baseX = boss.x;
  let baseY = boss.y + 30;
  let count = 18;
  for (let i = 0; i < count; i++){
    let a = TWO_PI * i / count + random(-0.1, 0.1);
    let speed = 2 + random(0,2);
    bossBullets.push({ x: baseX, y: baseY, vx: cos(a)*speed, vy: sin(a)*speed, r: 9 });
  }
}

// ボス突進開始
function beginBossDive(){
  boss.state = "diving";
  let tx = px;
  let dx = tx - boss.x;
  let dy = (groundY - boss.h/2) - boss.y;
  let dist = sqrt(dx*dx + dy*dy);
  let speed = 12;
  if (dist === 0) dist = 1;
  boss.dx = dx / dist * speed;
  boss.dy = dy / dist * speed;
}

// 衝撃波（短命の弾を作る）
function spawnBossShock(){
  for (let i = 0; i < 12; i++){
    let a = TWO_PI * i / 12;
    bossBullets.push({ x: boss.x, y: boss.y + boss.h/2, vx: cos(a)*6, vy: sin(a)*3, r: 12, life: 30 });
  }
}

// 更新
function updateBossBullets(){
  for (let i = bossBullets.length - 1; i >=0; i--){
    let b = bossBullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.life !== undefined){
      b.life--;
      if (b.life <= 0) bossBullets.splice(i,1);
    }
    if (b.x < -100 || b.x > width + 100 || b.y > height + 100 || b.y < -200){
      bossBullets.splice(i,1);
    }
  }
}

function drawBossBullets(){
  fill(230, 80, 80);
  noStroke();
  for (let b of bossBullets) ellipse(b.x, b.y, b.r*2);
}

// ----- 衝突判定 -----
function checkCollisions(){
  // プレイヤー弾 ⇒ ボス
  for (let i = bullets.length - 1; i >= 0; i--){
    let b = bullets[i];
    let rx = clamp(b.x, boss.x - boss.w/2, boss.x + boss.w/2);
    let ry = clamp(b.y, boss.y - boss.h/2, boss.y + boss.h/2);
    let dx = b.x - rx;
    let dy = b.y - ry;
    if (dx*dx + dy*dy <= b.r * b.r){
      bullets.splice(i,1);
      boss.hp -= 4;
      boss.x += random(-8,8);
      for (let k = 0; k < 3; k++){
        bossBullets.push({ x: b.x, y: b.y, vx: random(-3,3), vy: random(-4,-1), r: 6, life: 40 });
      }
    }
  }

  // ボス弾 ⇒ プレイヤー
  if (invFrames <= 0){
    for (let i = bossBullets.length - 1; i >= 0; i--){
      let b = bossBullets[i];
      let dx = b.x - px;
      let dy = b.y - py;
      let rr = (b.r + PLAYER_SIZE/2);
      if (dx*dx + dy*dy <= rr*rr){
        bossBullets.splice(i,1);
        hurtPlayer();
        break;
      }
    }
  }

  // ボス本体がプレイヤーとぶつかった場合
  if ((boss.state === "diving" || boss.state === "recover") && invFrames <= 0){
    let dx = boss.x - px;
    let dy = boss.y - py;
    let rr = (max(boss.w,boss.h)/2 + PLAYER_SIZE/2) * 0.8;
    if (dx*dx + dy*dy <= rr*rr){
      hurtPlayer();
    }
  }

  // 勝利判定
  if (boss.hp <= 0 && !win){
    win = true;
  }
}

function hurtPlayer(){
  invFrames = 90;
  lives--;
  if (px < boss.x) px -= 40; else px += 40;
  pvy = -8;
  if (lives <= 0){
    gameOver = true;
  }
}

// ----- 描画 -----
function drawPlayer(){
  push();
  translate(px, py);
  if (invFrames > 0 && frameCount % 6 < 3) { pop(); return; } // 点滅
  fill(20);
  noStroke();
  ellipse(0, 0, PLAYER_SIZE);
  fill(255);
  triangle(10 * facing, -6, 18 * facing, 0, 10 * facing, 6);
  pop();
}

function drawBoss(){
  push();
  translate(boss.x, boss.y);
  fill(80, 30, 120);
  rectMode(CENTER);
  rect(0, 0, boss.w, boss.h, 12);
  fill(255);
  ellipse(-boss.w*0.18, -boss.h*0.18, 18, 18);
  ellipse(boss.w*0.18, -boss.h*0.18, 18, 18);
  fill(0);
  arc(0, 10, boss.w*0.5, 28, 0, PI);
  pop();

  // HPバー
  let barW = width * 0.4;
  let bx = width*0.5 - barW/2;
  let by = 28;
  fill(30);
  rect(bx, by, barW, 18, 6);
  fill(200,40,40);
  let hpW = map(max(0,boss.hp), 0, boss.maxHp, 0, barW);
  rect(bx - barW/2 + hpW/2, by, hpW, 14, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("BOSS", width/2, by - 22);
}

function drawUI(){
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  text("LIVES: " + lives, 16, 16);
  let t = floor((millis() - startTime) / 1000);
  text("TIME: " + t, 16, 40);
}

// ----- ヘルパー -----
function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }

function keyPressed(){
  // スペースでリスタート（ゲームオーバー時または勝利時）
  if (key === ' '){
    if (gameOver || win) resetGame();
  }
}


