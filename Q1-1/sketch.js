// 神戸市のマーク
// sketch.js
// チンチロ：プレイヤー vs コンピューター（自動）
// クリック / スペースでプレイヤーが振る。振り終えるとコンピューターが自動で振って勝敗を表示。

let player = [1,1,1];
let cpu = [1,1,1];
let rolling = false;
let rollStart = 0;
const ROLL_TIME = 700; // 振動時間(ms)（プレイヤー・CPUそれぞれ）
let phase = 'idle'; // 'idle' | 'playerRolling' | 'cpuRolling' | 'resultShowing'
let cpuRollDelay = 400; // プレイヤーが止まってからCPUが振り始める遅延(ms)
let resultText = '';
let playerWins = 0;
let cpuWins = 0;
let draws = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Noto Sans JP, sans-serif');
  textAlign(CENTER, CENTER);
  resetHands();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(28);

  // タイトル
  fill(255);
  textSize(28);
  text('チンチロ — プレイヤー vs コンピューター', width/2, 36);

  textSize(14);
  fill(200);
  text('クリック / スペース: プレイヤーが振る  |  R: スコアリセット', width/2, 64);

  // サイコロ表示
  const diceSize = min(120, width * 0.12);
  const gap = diceSize * 0.4;
  const centerY = height/2 - 40;

  // プレイヤーラベル
  fill(220);
  textSize(18);
  text('Player', width/2 - (diceSize+gap)*1.6, centerY - diceSize*0.9);

  for (let i = 0; i < 3; i++) {
    const x = width/2 - (diceSize + gap) + i * (diceSize + gap) - (diceSize+gap)*0.6;
    const face = (phase === 'playerRolling') ? Math.ceil(random(1,7)) : player[i];
    drawDie(x, centerY, diceSize, face);
  }

  // CPUラベル
  fill(220);
  textSize(18);
  text('CPU', width/2 + (diceSize+gap)*1.6, centerY - diceSize*0.9);

  for (let i = 0; i < 3; i++) {
    const x = width/2 + (diceSize + gap) - (diceSize+gap)*0.6 + i * (diceSize + gap);
    const face = (phase === 'cpuRolling') ? Math.ceil(random(1,7)) : cpu[i];
    drawDie(x, centerY + diceSize + 30, diceSize, face);
  }

  // ステータス / 結果表示
  fill(240);
  textSize(24);
  if (phase === 'playerRolling') {
    text('プレイヤーを振っています...', width/2, height - 140);
  } else if (phase === 'cpuRolling') {
    text('コンピューターが振っています...', width/2, height - 140);
  } else if (phase === 'resultShowing') {
    text(resultText, width/2, height - 140);
  } else {
    text('クリック / スペースで振ってください', width/2, height - 140);
  }

  // スコア表示
  textSize(16);
  fill(180);
  text(`Score — Player: ${playerWins}  CPU: ${cpuWins}  Draws: ${draws}`, width/2, height - 100);

  // ロールタイマー管理
  const now = millis();

  if (phase === 'playerRolling' && now - rollStart > ROLL_TIME) {
    // プレイヤーの最終値を確定
    player = [randDie(), randDie(), randDie()];
    phase = 'waitingCPU';
    // CPU を遅延して振り始める
    setTimeout(() => {
      phase = 'cpuRolling';
      rollStart = millis();
    }, cpuRollDelay);
  }

  if (phase === 'cpuRolling' && now - rollStart > ROLL_TIME) {
    cpu = [randDie(), randDie(), randDie()];
    // 判定
    const winner = compareHands(player, cpu);
    if (winner > 0) {
      resultText = `プレイヤーの勝ち！ (${handText(player)})  vs  (${handText(cpu)})`;
      playerWins++;
    } else if (winner < 0) {
      resultText = `CPUの勝ち… (${handText(player)})  vs  (${handText(cpu)})`;
      cpuWins++;
    } else {
      resultText = `引き分け (${handText(player)})  vs  (${handText(cpu)})`;
      draws++;
    }
    phase = 'resultShowing';
  }
}

// マウス / キー操作
function mousePressed() {
  playerStartRoll();
}

function keyPressed() {
  if (key === ' ' || key === 'Spacebar') {
    playerStartRoll();
  } else if (key.toLowerCase() === 'r') {
    playerWins = cpuWins = draws = 0;
    resetHands();
    phase = 'idle';
    resultText = '';
  }
}

function playerStartRoll() {
  if (phase === 'idle' || phase === 'resultShowing') {
    phase = 'playerRolling';
    rollStart = millis();
    resultText = '';
  }
}

function resetHands() {
  player = [randDie(), randDie(), randDie()];
  cpu = [randDie(), randDie(), randDie()];
}

// 1..6 のランダム整数
function randDie() {
  return Math.floor(random(1, 7));
}

// サイコロ描画（中心位置で描く）
function drawDie(cx, cy, s, value) {
  push();
  translate(cx, cy);
  stroke(200);
  strokeWeight(2);
  fill(245);
  rectMode(CENTER);
  rect(0, 0, s, s, s*0.12);
  drawPips(0, 0, s, value);
  noStroke();
  fill(30);
  textSize(s * 0.14);
  text(value, 0, s * 0.42);
  pop();
}

function drawPips(cx, cy, s, v) {
  const r = s * 0.08;
  const off = s * 0.22;
  fill(30);
  noStroke();
  const places = {
    1: [[0,0]],
    2: [[-off, -off],[off, off]],
    3: [[-off, -off],[0,0],[off, off]],
    4: [[-off,-off],[off,-off],[-off,off],[off,off]],
    5: [[-off,-off],[off,-off],[0,0],[-off,off],[off,off]],
    6: [[-off,-off],[0,-off],[off,-off],[-off,off],[0,off],[off,off]]
  };
  const pts = places[v] || places[1];
  for (let p of pts) ellipse(cx + p[0], cy + p[1], r*2, r*2);
}

// ハンド（配列）を判定してランクとタイブレイク値を返す
// ランク（数値が大きいほど強い）
// 6: 4-5-6 自動勝ち
// 5: トリプル（3つ同じ） -> tie by the triple number
// 4: ペア -> tie by remaining (点)
// 2: 無点（その他）
// 1: 1-2-3 自動負け
function handRank(arr) {
  const a = arr.slice().sort((x,y)=>x-y);
  const counts = {};
  for (let n of a) counts[n] = (counts[n] || 0) + 1;

  // 1-2-3
  if (a[0]===1 && a[1]===2 && a[2]===3) return {rank:1, t:0, name:'1-2-3'};

  // 4-5-6
  if (a[0]===4 && a[1]===5 && a[2]===6) return {rank:6, t:0, name:'4-5-6'};

  // triple
  if (a[0]===a[2]) return {rank:5, t:a[0], name:`トリプル ${a[0]}`};

  // pair
  for (let k in counts) {
    if (counts[k] === 2) {
      const remaining = a.find(x => x !== Number(k));
      return {rank:4, t:remaining, name:`ペア ${k}（点 ${remaining}）`};
    }
  }

  // other (no point)
  return {rank:2, t:0, name:'無点'};
}

// テキスト化
function handText(arr) {
  const h = handRank(arr);
  return h.name;
}

// 比較：返り値 >0 なら a の勝ち、 <0 なら b の勝ち、 0 なら引き分け
function compareHands(a, b) {
  const A = handRank(a);
  const B = handRank(b);
  if (A.rank !== B.rank) return A.rank - B.rank;
  // 同ランクなら tiebreaker 比較（数値が大きい方が強い）
  if (A.t !== B.t) return A.t - B.t;
  return 0; // 完全に同等
}

