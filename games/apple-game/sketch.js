let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 55; // 이모지 크기에 맞춰 최적화

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  apples = [];
  // 이모지가 겹치지 않도록 간격을 조금 더 넓힘
  cols = floor(width / 75);
  rows = floor((height - 150) / 75);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 75 + 60,
        y: j * 75 + 100,
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
    
    // 선택되었을 때 쫀득한 반응 효과
    if (selected) {
      scale(1.2); // 선택되면 살짝 커지게 변경 (강조 효과)
    }

    // 1. 사과 이모지 그리기
    textAlign(CENTER, CENTER);
    textSize(APPLE_SIZE);
    // 선택되었을 때 투명도를 주어 숫자가 더 잘 보이게 함
    if (selected) {
      drawingContext.globalAlpha = 0.6;
    }
    text("🍎", 0, 0);
    drawingContext.globalAlpha = 1.0;

    // 2. 숫자 그리기 (사과 정중앙)
    fill(255);
    stroke(150, 0, 0); // 사과색과 대비되는 얇은 테두리
    strokeWeight(2);
    textStyle(BOLD);
    textSize(28);
    // 이모지 특성상 중앙 정렬을 위해 y축을 살짝 보정 (+5)
    text(a.val, 0, 5); 
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

  // 드래그 영역 표시
  if (selection) {
    noFill();
    stroke(255, 80, 80, 180);
    strokeWeight(3);
    drawingContext.setLineDash([5, 5]); // 점선 효과
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    drawingContext.setLineDash([]); 
  }

  drawUI();
}

// 나머지 로직은 동일하게 유지 (타격감 및 콤보 시스템)
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
    score += (10 * comboCount); // 점수 체계 상향
    shakeAmount = 3;
    
    cX /= sApples.length;
    cY /= sApples.length;

    if (comboCount > 1) {
      floatingTexts.push(new FloatingText(`${comboCount} COMBO!`, cX, cY));
    }

    for (let a of sApples) {
      a.active = false;
      for (let i = 0; i < 10; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

class FloatingText {
  constructor(t, x, y) { this.t = t; this.x = x; this.y = y; this.a = 255; }
  update() { this.y -= 1.5; this.a -= 5; }
  show() {
    push();
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255, 0, 0, this.a);
    stroke(255, 255, 255, this.a);
    strokeWeight(4);
    text(this.t, this.x, this.y);
    pop();
  }
  finished() { return this.a < 0; }
}

function isSelected(a) {
  if (!selection) return false;
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  return (a.x > xMin && a.x < xMax && a.y > yMin && a.y < yMax);
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
