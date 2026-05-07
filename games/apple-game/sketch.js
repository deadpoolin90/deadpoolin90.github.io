let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 50; 

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  apples = [];
  cols = floor(width / 70);
  rows = floor((height - 120) / 70);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 70 + 60,
        y: j * 70 + 100,
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
    if (selected) scale(1.1); // 선택되면 살짝 커짐

    drawCuteApple(selected); // 귀여운 사과 그리기

    // 숫자 표시
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(26);
    text(a.val, 0, 2); 
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

  // 드래그 박스
  if (selection) {
    noFill();
    stroke(255, 80, 80, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  drawUI();
}

// ★ 귀여운 명암이 들어간 동그란 사과 함수
function drawCuteApple(selected) {
  // 꼭지
  stroke(100, 60, 20);
  strokeWeight(4);
  line(0, -15, 0, -25);
  
  // 잎사귀
  noStroke();
  fill(80, 200, 80);
  ellipse(7, -22, 12, 6);

  // 몸통 기본 (선택 시 색상 변화)
  let baseColor = selected ? color(255, 150, 150) : color(255, 80, 80);
  let shadowColor = selected ? color(230, 100, 100) : color(200, 40, 40);
  
  // 1. 메인 몸통 (약간 둥글넙적한 귀여운 원형)
  fill(baseColor);
  ellipse(0, 0, APPLE_SIZE, APPLE_SIZE * 0.95);

  // 2. 하단 그림자 명암 (입체감)
  fill(shadowColor);
  arc(0, 0, APPLE_SIZE, APPLE_SIZE * 0.95, 0, PI);

  // 3. 다시 메인 색상으로 덮기 (그림자를 아래쪽에만 남김)
  fill(baseColor);
  ellipse(0, -2, APPLE_SIZE, APPLE_SIZE * 0.9);

  // 4. 상단 하이라이트 (광택 - 귀여움의 핵심!)
  fill(255, 255, 255, 180);
  ellipse(-10, -10, 15, 8);
}

// ★ 민감한 선택 판정 (직사각형이 사과에 조금이라도 닿으면 선택)
function isSelected(a) {
  if (!selection) return false;
  
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  
  let r = APPLE_SIZE / 2;
  
  // 사과의 바운딩 박스와 드래그 박스가 겹치는지 체크 (AABB)
  return (xMax > a.x - r && xMin < a.x + r && 
          yMax > a.y - r && yMin < a.y + r);
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
  fill(80, 40, 40);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text("🍎 숫자의 합이 10이 되게 드래그하세요!", width/2, 30);
  textSize(30);
  textAlign(LEFT, BOTTOM);
  text(`점수: ${score}`, 40, height - 40);
  textAlign(RIGHT, BOTTOM);
  text(`남은시간: ${ceil(timeLeft)}초`, width - 40, height - 40);
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }
function mouseReleased() {
  if (!selection) return;
  let sum = 0;
  let sApples = [];
  let cX = 0, cY = 0;
  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val;
      sApples.push(a);
      cX += a.x; cY += a.y;
    }
  }
  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (10 * comboCount); 
    shakeAmount = 4;
    cX /= sApples.length; cY /= sApples.length;
    if (comboCount > 1) floatingTexts.push(new FloatingText(`${comboCount} COMBO!`, cX, cY));
    for (let a of sApples) {
      a.active = false;
      for (let i = 0; i < 10; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

class FloatingText {
  constructor(t, x, y) {
    this.t = t; this.x = x; this.y = y;
    this.a = 255;
    this.hue = 0;
  }
  update() { 
    this.y -= 2; 
    this.a -= 4; 
    this.hue = (this.hue + 5) % 360;
  }
  show() {
    push();
    colorMode(HSB);
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    fill(this.hue, 80, 100, this.a / 255);
    stroke(0, 0, 100, this.a / 255);
    strokeWeight(5);
    text(this.t, this.x, this.y);
    pop();
  }
  finished() { return this.a < 0; }
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
    this.a = 255;
  }
  update() { this.x += this.vx; this.y += this.vy; this.a -= 10; }
  show() {
    noStroke();
    fill(255, 50, 50, this.a);
    ellipse(this.x, this.y, 6);
  }
  finished() { return this.a < 0; }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
