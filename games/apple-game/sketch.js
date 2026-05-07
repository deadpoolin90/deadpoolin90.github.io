let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 48; // 사과 크기 살짝 키움

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  apples = [];
  cols = floor(width / 65); // 간격 조정
  rows = floor((height - 120) / 65);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 65 + 50,
        y: j * 65 + 100,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function draw() {
  if (shakeAmount > 0) {
    push();
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.6; 
  }

  background(255, 245, 245);
  
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    translate(a.x, a.y);
    
    // 선택 시 아주 조금 작아지는 효과
    if (selected) scale(0.9);

    // 1. 사과 꼭지와 잎사귀 (디테일 추가)
    strokeWeight(2);
    stroke(100, 50, 0); // 갈색 꼭지
    line(0, -APPLE_SIZE/2, 0, -APPLE_SIZE/2 - 8);
    noStroke();
    fill(50, 200, 50); // 초록 잎사귀
    ellipse(5, -APPLE_SIZE/2 - 5, 10, 5);

    // 2. 사과 몸통 (약간 하트 쉐입 느낌의 타원)
    if (selected) {
      fill(255, 200, 200); 
      stroke(255, 0, 0);
      strokeWeight(2);
    } else {
      fill(255, 80, 80); // 조금 더 진한 사과색
      noStroke();
    }
    // 사과 특유의 둥글넙적한 모양
    ellipse(0, 0, APPLE_SIZE, APPLE_SIZE * 0.9);
    
    // 3. 숫자 (가독성 극대화)
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(26); // 숫자 크기 키움
    // 텍스트 베이스라인 오차 보정을 위해 y좌표 미세 조정(+2)
    text(a.val, 0, 2);
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

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
  textFont("'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif");
  textSize(18);
  text("합이 10이 되게 사과를 드래그하세요!", width/2, 25);

  textSize(28);
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
  let cX = 0, cY = 0;

  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val;
      selectedApples.push(a);
      cX += a.x; cY += a.y;
    }
  }

  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (1 + comboCount); 
    shakeAmount = 1.5;
    
    cX /= selectedApples.length;
    cY /= selectedApples.length;

    if (comboCount > 1) {
      floatingTexts.push(new FloatingText(getComboText(comboCount), cX, cY));
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
    this.txt = txt; this.x = x; this.y = y;
    this.alpha = 255; this.yO = 0;
  }
  update() { this.yO -= 1; this.alpha -= 6; }
  show() {
    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(22);
    fill(255, 50, 50, this.alpha);
    stroke(255, 255, 255, this.alpha);
    strokeWeight(2);
    text(this.txt, this.x, this.y + this.yO);
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
  const list = ["", "DOUBLE!", "TRIPLE!", "QUAD!", "PENTA!", "SUPER!", "COOL!"];
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
