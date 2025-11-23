// 最終課題を制作しよう


let questions = [
  {q: "「力のあるものが、機会をじっと窺っている様子」のことを、「虎」という漢字を使った四字熟語で何というでしょう。", a: "虎視眈々"},
  {q: "第二次世界大戦中に空襲の標的にならないために黒い布で覆われていたという歴史がある、兵庫県姫路市の世界遺産は何でしょう。", a: "姫路城"},
  {q: "途切れることなく次から次へと話し続けることを、大量の銃弾を自動で発射し続ける武器の名前から「何トーク」というでしょう。", a: "マシンガン"},
  {q: "イタリア語で「光の装飾」という意味の名前がつけられている、阪神・淡路大震災の犠牲者の鎮魂と復興を祈って始まった、1月に開催される神戸のイベントは何。", a: "ルミナリエ"},
  {q: "フランス語で「稲妻」という言葉が由来である、細長いシュークリームにチョコレートをかけたお菓子は何でしょう。", a: "エクレア"},
  {q: "兵庫県神戸市を構成する区のうち、漢字一字で表記されるものとは、北区、西区と何でしょう。", a: "灘区"},
  {q: "漢数字の「百」から「一」を引くということから、99歳のお祝いのことを何というでしょう。", a: "白寿"},
  {q: "「コンピューターグラフィックスの描画方式」、「カードゲームにおいてカードを引く行為」、「引き分け」、に共通して用いられる言葉は何でしょう。", a: "ドロー"},
  {q: "実際には無害であるにもかかわらず、思い込みによって体に悪影響が表れる現象を、良い効果が表れるプラシーボ効果に対して何という。", a: "ノセボ効果"},
  {q: "気象予報士の業界用語で安定して晴れる天気のことを、これ以上崩れないことからある硬貨を使った俗称で何天気という？", a: "一円玉"},
  {q: "一般的なギターの弦の数は何本でしょう。", a: "６"},
  {q: "エタノールが酸化するとアセトアルデヒドになりますが、アセトアルデヒドがさらに酸化すると何になるでしょう。", a: "酢酸"},
  {q: "原住民の言葉で「偉大な存在」を意味する、標高約6,190mと北米大陸最高峰の山は何でしょう。", a: "デナリ"},
  {q: "アルジェリアの首都はアルジェですが、ナイジェリアの首都はどこでしょう。", a: "アブジャ"},
  {q: "日本の飛鳥時代の仏像によく見られる、口元がわずかに微笑んで見える表情のことを何というでしょう。", a: "アルカイックスマイル"},
  {q: "６、２８、４９６のように、自身を除く約数の和が自身と等しくなるような数はなんでしょう。", a: "完全数"}
];

let qIndex = 0;
let question = "";
let displayText = "";
let charIndex = 0;
let playing = true; 
let charInterval = 120; //表示速度の調整
let lastCharTime = 0;

let answerInput;
let resultText = "";
let awaitingNext = false; //失敗して足りない部分をAIに聞いて入れたコード

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
  textSize(40);
  textAlign(LEFT, TOP);
  frameRate(60);

  loadQuestion(qIndex);

 
  answerInput = createInput('');
  answerInput.attribute('placeholder', '答えを入力');
  answerInput.position(500, 500);
//テキスト欄の大きさ調整。
  answerInput.style('width', '400px');   // 横幅
  answerInput.style('height', '50px');   // 高さ
  answerInput.style('font-size', '24px');  // 文字の大きさ
  answerInput.hide();
}
//サンプルもらった
function loadQuestion(i) {
  qIndex = i % questions.length;
  question = questions[qIndex].q;
  displayText = "";
  charIndex = 0;
  playing = true;
  resultText = "";
  awaitingNext = false;
  lastCharTime = millis();
  if (answerInput) answerInput.hide();
}

function draw() {
  background(30);
  fill(255);

  // 一文字ずつ表示する部分
  if (playing && charIndex < question.length) {
    if (millis() - lastCharTime > charInterval) {
      displayText += question.charAt(charIndex);
      charIndex++;
      lastCharTime = millis();
      if (charIndex >= question.length) {
        playing = false;
        showAnswerInput();
      }
    }
  }

  drawWrappedText(displayText, 20, 160, width - 40, 48); //改行。のちに追加したからいらないかも

  
  if (resultText) {
    textSize(40);
    text(resultText, 20, height - 80);
    textSize(40);
  }

 push();
  textSize(20);
  fill(180);
  textAlign(RIGHT, BOTTOM);
  text("spaceで解答  Enterで解答送信  その後Enterで次の問題", width - 20, height - 10);
  pop();

  
}

//入力欄のやり方。
function showAnswerInput() {
  answerInput.show();
  answerInput.elt.focus();
  answerInput.value('');
}


function checkAnswer() {
  const user = answerInput.value().trim();
  const correct = questions[qIndex].a.trim();
  if (user === "") {
    resultText = "答えを入力してください。";
    return;
  }

 
  displayText = question;
  charIndex = question.length;
  playing = false;

  
  if (user === correct) {
    resultText = "正解！ ";
  } else {
    resultText = `不正解。正解は: ${correct}`;
  }

  
  answerInput.hide();
  awaitingNext = true;
}


function nextQuestion() {
  loadQuestion(qIndex + 1);
}

function keyPressed() {
  
  if (key === ' ' && playing) {
    playing = false;
    showAnswerInput();
    return; 
  }

  
  if (keyCode === ENTER || key === 'Enter') {
    // 入力中のenter 
    if (!playing && answerInput && answerInput.elt.style.display !== 'none') {
      checkAnswer();
      return;
    }
    // 結果表示中のenter 
    if (awaitingNext) {
      nextQuestion();
      return;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



function drawWrappedText(txt, x, y, maxWidth, lineHeight) {
  
  textSize(40);

  let line = "";
  let yy = y;

  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];

    
    if (ch === '\n') {
      if (line !== "") {
        text(line, x, yy);
      }
      line = "";
      yy += lineHeight;
      continue;
    }

    const testLine = line + ch;
    const w = textWidth(testLine);
　　//以下、問題文が長い時に文字が右に飛び出してしまい、日本語の文章の改行の仕方がわからなかったためAIに聞いた。
    // 幅を超えたら改行（行が空で幅超過した場合はその文字をそのまま表示）
    if (w > maxWidth && line !== "") {
      text(line, x, yy);
      line = ch;
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }

  // 残りの行を描画
  if (line !== "") {
    text(line, x, yy);
  }
}











