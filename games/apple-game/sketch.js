let apples = [];
let particles = [];
let floatingTexts = []; // 터진 위치에 뜰 텍스트들
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 45;

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
  // 1. 화면 흔들림 (수치 대폭 낮춤: 15 -> 4)
  if (shakeAmount > 0) {
    push();
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.8;
  }

  background(255, 245, 245);
  
  // 2. 사과 그리기
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    if (selected) {
      // (수정) 노란색 대신 맨 처음의 '테두리 강조' 스타일
      fill(255, 100, 100);
      stroke(255, 255, 255); // 흰색 테두리
      strokeWeight(4);
      ellipse(a.x, a.y, APPLE_SIZE + 4);
    } else {
      fill(255, 100, 100);
      noStroke();
      ellipse(a.x, a.y, APPLE_SIZE);
    }
    
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(24);
    text(a.val, a.x, a.y);
    pop();
  }

  if (shakeAmount > 0) pop();

  // 3. 파티클 및 떠다니는 텍스트 업데이트
  updateEffects();

  // 4. 드래그 박스 (선명한 화이트 테두리 버전)
  if (selection) {
    fill(255, 255, 255, 40);
    stroke(255, 100, 100);
    strokeWeight(2);
    let x = min(selection.x1, selection.x2);
    let y = min(selection.y1, selection.y2);
    let w = abs(selection.x2 - selection.x1);
    let h = abs(selection.y2 - selection.y1);
    rect(x, y, w, h, 10); // 둥근 모서리
  }

  drawUI();
}

function updateEffects() {
  // 파티클
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }
  // 떠다니는 콤보 텍스트
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    floatingTexts[i].show();
    if (floatingTexts[i].finished()) floatingTexts.splice(i, 1);
  }
}

function drawUI() {
  fill(80);
  noStroke();
  textAlign(CENTER, TOP);
  // 통통 튀는 느낌의 폰트 설정
  textFont("'Arial Rounded MT Bold', 'Helvetica', sans-serif");
  textSize(18);
  text("합이 10이 되게 사과를 드래그하세요!", width/2, 20);

  textSize(28);
  textAlign(LEFT, BOTTOM);
  text(`🍎 SCORE: ${score}`, 30, height - 30);
  
  textAlign(RIGHT, BOTTOM);
  text(`⏳ TIME: ${ceil(timeLeft)}`, width - 30, height - 30);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

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
    shakeAmount = 4; // (수정) 흔들림 낮춤
    
    centerX /= selectedApples.length;
    centerY /= selectedApples.length;

    // (수정) 터진 위치에 콤보 문구 추가
    if (comboCount > 1) {
      floatingTexts.push(new FloatingText(getComboText(comboCount), centerX, centerY));
    }

    for (let a of selectedApples) {
      a.active = false;
      for (let i = 0; i < 12; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

// 떠다니는 텍스트 클래스
class FloatingText {
  constructor(txt, x, y) {
    this.txt = txt;
    this.x = x;
    this.y = y;
    this.vy = -3; // 위로 솟아오름
    this.alpha = 255;
    this.scale = 0.5; // 커지는 효과
  }
  update() {
    this.y += this.vy;
    this.vy *= 0.95; // 점점 느려짐
    this.alpha -= 4;
    if (this.scale < 1.2) this.scale += 0.1;
  }
  show() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(40);
    // 통통 튀는 빨간색 계열
    fill(255, 50, 50, this.alpha);
    stroke(255, 255, 255, this.alpha);
    strokeWeight(4);
    text(this.txt, 0, 0);
    pop();
  }
  finished() { return this.alpha < 0; }
}

// Particle, isSelected, mousePressed 등 나머지 함수는 이전과 동일하게 유지...
function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }
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
  const list = ["", "DOUBLE!", "TRIPLE!", "QUADRUPLE!", "PENTAKILL!", "LEGENDARY!", "UNSTOPPABLE!"];
  return list[min(count - 1, list.length - 1)];
}
class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.alpha = 255;
    this.color = color(255, random(50, 150), 50);
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += 0.2; this.alpha -= 10; }
  show() { noStroke(); fill(red(this.color), green(this.color), blue(this.color), this.alpha); ellipse(this.x, this.y, random(4, 8)); }
  finished() { return this.alpha < 0; }
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
