let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 45; // 기본 크기

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  apples = [];
  cols = floor(width / 60);
  rows = floor((height - 120) / 60);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 60 + 50,
        y: j * 60 + 80,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function draw() {
  // 1. 화면 흔들림 (아주 미세하게 조정)
  if (shakeAmount > 0) {
    push();
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.6; 
  }

  background(255, 245, 245);
  
  // 2. 사과 그리기
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    if (selected) {
      // 선택되었을 때: 연분홍색 + 아주 조금 작아짐
      fill(255, 200, 200); 
      stroke(255, 0, 0);
      strokeWeight(2);
      ellipse(a.x, a.y, APPLE_SIZE * 0.9); // 크기 10% 축소
    } else {
      // 평상시: 원래 코드의 스타일 유지
      fill(255, 100, 100);
      noStroke();
      ellipse(a.x, a.y, APPLE_SIZE);
    }
    
    // 숫자 스타일: 흰색 볼드 유지
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(24);
    // 선택 시 숫자도 사과와 함께 살짝 작아지거나 위치 유지
    text(a.val, a.x, a.y);
    pop();
  }

  if (shakeAmount > 0) pop();

  updateEffects();

  // 3. 드래그 박스
  if (selection) {
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  drawUI();
}

function updateEffects() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    floatingTexts[i].show();
    if (floatingTexts[i].finished()) floatingTexts.splice(i, 1);
  }
}

function drawUI() {
  fill(50);
  noStroke();
  textAlign(CENTER, TOP);
  // 폰트는 예전의 깔끔한 고딕 계열 유지
  textFont("'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif");
  textSize(16);
  text("드래그해서 합을 10으로 만드세요!", width/2, 20);

  textSize(26);
  textAlign(LEFT, BOTTOM);
  text(`🍎 SCORE: ${score}`, 30, height - 30);
  
  textAlign(RIGHT, BOTTOM);
  text(`⏳ TIME: ${ceil(timeLeft)}`, width - 30, height - 30);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }

function mouseReleased() {
  if (!selection) return;
  let sum = 0;
  let selectedApples = [];
  let centerX = 0, centerY = 0;

  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val;
      selectedApples.push(a);
      centerX += a.x;
      centerY += a.y;
    }
  }

  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (1 + comboCount); 
    shakeAmount = 1.5; // 흔들림을 아주 작게 줄임
    
    centerX /= selectedApples.length;
    centerY /= selectedApples.length;

    if (comboCount > 1) {
      floatingTexts.push(new FloatingText(getComboText(comboCount), centerX, centerY));
    }

    for (let a of selectedApples) {
      a.active = false;
      for (let i = 0; i < 8; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

class FloatingText {
  constructor(txt, x, y) {
    this.txt = txt;
    this.x = x;
    this.y = y;
    this.alpha = 255;
    this.yOffset = 0;
  }
  update() {
    this.yOffset -= 1;
    this.alpha -= 6;
  }
  show() {
    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(22); // 작게 표시
    fill(255, 50, 50, this.alpha);
    stroke(255, 255, 255, this.alpha);
    strokeWeight(2);
    text(this.txt, this.x, this.y + this.yOffset);
    pop();
  }
  finished() { return this.alpha < 0; }
}

function isSelected(a) {
  if (!selection) return false;
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  let r = APPLE_SIZE / 2;
  return (xMax > a.x - r && xMin < a.x + r && yMax > a.y - r && yMin < a.y + r);
}

function getComboText(count) {
  const list = ["", "DOUBLE!", "TRIPLE!", "QUAD!", "PENTA!", "GO!", "COOL!"];
  return list[min(count - 1, list.length - 1)];
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
    this.color = color(255, 100, 100);
  }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 15; }
  show() { noStroke(); fill(red(this.color), green(this.color), blue(this.color), this.alpha); ellipse(this.x, this.y, random(2, 5)); }
  finished() { return this.alpha < 0; }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
