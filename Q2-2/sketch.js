// チェッカー
function setup() {
  let s = 25;
  let d = 20;
  createCanvas(200, 200);
  background(255)
  noStroke();
  const size = width / 8; // マスの一辺の長さ
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let x = i * size;
      let y = j * size;
      // BLANK[1] ヒント： rectのx座標は size * i, y座標は size * j
      if ((i + j) % 2 == 0) {
        fill(255)
      }
      else fill(122)
      rect(x, y, s, s)

      if (((i + j) % 2 === 1) && (j < 3)) {
        fill(255, 0, 0);
        ellipse(x + s / 2, y + s / 2, d, d);
      }
      if (((i + j) % 2 === 1) && (4 < j)) {
        fill(0);
        ellipse(x + s / 2, y + s / 2, d, d);
      }
    }
  }

}
