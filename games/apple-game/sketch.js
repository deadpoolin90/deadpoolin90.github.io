let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 50; // 크기 살짝 키움

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
    
    // 선택 시 0.9배로 살짝 작아짐
    if (selected) scale(0.9);

    drawAppleShape(selected);

    // 숫자 스타일: 더 크고 선명하게 (중앙 정렬 보정)
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(28); 
    text(a.val, 0, 5); // 굴곡 때문에 살짝 아래로 내려야 중앙처럼 보임
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

// ★ 굴곡을 대폭 강화한 사과 그리기 함수
function drawAppleShape(selected) {
  // 1. 꼭지와 잎사귀
  stroke(90, 50, 20);
  strokeWeight(3);
  line(0, -18, 0, -28);
  
  noStroke();
  fill(50, 180, 50);
  ellipse(8, -24, 14, 7);

  // 2. 몸통 색상
  if (selected) {
    fill(255, 180, 180); 
    stroke(255, 50, 50);
    strokeWeight(2);
  } else {
    fill(230, 40, 40);
    noStroke();
  }

  // 3. 사과 굴곡 공식 (Cardioid 변형)
  // 위아래가 쏙 들어가고 옆은 빵빵한 하트 형태의 사과 쉐입
  beginShape();
  for (let i = 0; i < TWO_PI; i += 0.1) {
    // 굴곡 강도를 0.1에서 0.25로 대폭 상향
    let r = APPLE_SIZE * 0.5 * (1 - 0.22 * sin(i) + 0.15 * abs(cos(i)));
    let x = r * cos(i) * 1.1; // 가로로 살짝 더 넓게
    let y = r * sin(i);
    vertex(x, y);
  }
  endShape(CLOSE);

  // 4. 입체감을 주는 광택
  if (!selected) {
    fill(255, 255, 255, 150);
    ellipse(-10, -10, 14, 8);
  }
}

// 이하 유틸리티 함수들은 기존과 동일
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
  fill(50); noStroke();
  textAlign(CENTER, TOP);
  textFont("'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif");
  textSize(18);
  text("합이 10이 되게 사과를 드래그하세요!", width/2, 25);
  textSize(28); textAlign(LEFT, BOTTOM);
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
  let sum = 0; let sApples = []; let cX = 0, cY = 0;
  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val; sApples.push(a);
      cX += a.x; cY += a.y;
    }
  }
  if (sum === 10) {
    comboCount++; lastMatchTime = millis();
    score += (1 + comboCount); shakeAmount = 1.5;
    cX /= sApples.length; cY /= sApples.length;
    if (comboCount > 1) floatingTexts.push(new FloatingText(getComboText(comboCount), cX, cY));
    for (let a of sApples) {
      a.active = false;
      for (let i = 0; i < 8; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

class FloatingText {
  constructor(t, x, y) { this.t = t; this.x = x; this.y = y; this.a = 255; this.yO = 0; }
  update() { this.yO -= 1; this.a -= 6; }
  show() {
    push(); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(24);
    fill(255, 50, 50, this.a); stroke(255, 255, 255, this.a); strokeWeight(2);
    text(this.t, this.x, this.y + this.yO); pop();
  }
  finished() { return this.a < 0; }
}

function isSelected(a) {
  if (!selection) return false;
  let xMin = min(selection.x1, selection.x2); let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2); let yMax = max(selection.y1, selection.y2);
  let r = APPLE_SIZE / 2;
  return (xMax > a.x - r && xMin < a.x + r && yMax > a.y - r && yMin < a.y + r);
}

function getComboText(c) {
  const l = ["", "DOUBLE!", "TRIPLE!", "QUAD!", "PENTA!", "SUPER!", "COOL!"];
  return l[min(c - 1, l.length - 1)];
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y; this.vx = random(-3, 3); this.vy = random(-3, 3);
    this.a = 255; this.c = color(255, 100, 100);
  }
  update() { this.x += this.vx; this.y += this.vy; this.a -= 15; }
  show() { noStroke(); fill(red(this.c), green(this.c), blue(this.c), this.a); ellipse(this.x, this.y, random(2, 5)); }
  finished() { return this.a < 0; }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
