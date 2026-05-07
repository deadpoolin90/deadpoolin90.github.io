let apples = [];
let particles = [];
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 45;

// 콤보 및 효과 변수
let comboCount = 0;
let lastMatchTime = 0;
let comboMessage = "";
let comboAlpha = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 안내 문구가 들어갈 상단 여백(40px)과 하단 여백(60px)을 고려해 배치
  cols = floor(width / 55);
  rows = floor((height - 100) / 55);
  initApples();
}

function initApples() {
  apples = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 55 + 40,
        y: j * 55 + 60, // 상단 안내 문구 공간 확보
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function draw() {
  if (shakeAmount > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.9;
  }

  background(255, 245, 245);
  
  // 사과 그리기
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    push();
    if (selected) {
      fill(255, 255, 100);
      stroke(255, 0, 0);
      strokeWeight(3);
    } else {
      fill(255, 100, 100);
      noStroke();
    }
    ellipse(a.x, a.y, APPLE_SIZE);
    fill(selected ? 0 : 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(a.val, a.x, a.y);
    pop();
  }

  // 파티클 효과
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }

  // 드래그 박스
  if (selection) {
    fill(255, 0, 0, 30);
    stroke(255, 0, 0, 150);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  // 콤보 텍스트
  if (comboAlpha > 0) {
    push();
    textAlign(CENTER);
    textSize(60);
    fill(255, 50, 50, comboAlpha);
    text(comboMessage, width / 2, height / 2);
    comboAlpha -= 4;
    pop();
  }

  drawUI();
}

function drawUI() {
  fill(80);
  noStroke();
  
  // 상단 안내 문구 (사과를 가리지 않음)
  textAlign(CENTER, TOP);
  textSize(16);
  text("드래그해서 숫자의 합을 10으로 만드세요!", width / 2, 15);

  // 하단 점수 및 시간
  textSize(24);
  textAlign(LEFT, BOTTOM);
  text(`🍎 SCORE: ${score}`, 20, height - 20);
  
  textAlign(RIGHT, BOTTOM);
  let comboBonus = comboCount > 1 ? ` (+${comboCount} COMBO!)` : "";
  text(`⏳ TIME: ${ceil(timeLeft)}${comboBonus}`, width - 20, height - 20);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }

function mouseReleased() {
  if (!selection) return;
  let sum = 0;
  let selectedApples = [];
  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val;
      selectedApples.push(a);
    }
  }

  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (1 + comboCount); 
    shakeAmount = 10;
    
    if (comboCount > 1) {
      comboMessage = getComboText(comboCount);
      comboAlpha = 255;
    }

    for (let a of selectedApples) {
      a.active = false;
      for (let i = 0; i < 10; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

function getComboText(count) {
  let texts = ["", "DOUBLE!", "TRIPLE!", "QUADRUPLE!", "PENTAKILL!", "UNSTOPPABLE!", "GODLIKE!"];
  return texts[Math.min(count - 1, texts.length - 1)];
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.alpha = 255;
  }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 7; }
  show() { noStroke(); fill(255, 100, 100, this.alpha); ellipse(this.x, this.y, 8); }
  finished() { return this.alpha < 0; }
}

function isSelected(a) {
  if (!selection) return false;
  let selX = min(selection.x1, selection.x2);
  let selY = min(selection.y1, selection.y2);
  let selW = abs(selection.x2 - selection.x1);
  let selH = abs(selection.y2 - selection.y1);
  let appleR = APPLE_SIZE / 2;
  // 직사각형 충돌 판정: 조금이라도 겹치면 선택
  return (selX < a.x + appleR && selX + selW > a.x - appleR &&
          selY < a.y + appleR && selY + selH > a.y - appleR);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
