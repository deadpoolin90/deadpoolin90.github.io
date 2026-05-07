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
  initGame();
}

function initGame() {
  apples = [];
  cols = floor(width / 55);
  rows = floor((height - 100) / 55);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 55 + 40,
        y: j * 55 + 80,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function draw() {
  // 1. 화면 흔들기
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
      fill(255, 255, 0); // 선택 시 확실한 노란색
      stroke(255, 0, 0);
      strokeWeight(3);
      ellipse(a.x, a.y, APPLE_SIZE + 5); // 크기 살짝 키움
    } else {
      fill(255, 100, 100);
      noStroke();
      ellipse(a.x, a.y, APPLE_SIZE);
    }
    
    fill(selected ? 0 : 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(a.val, a.x, a.y);
    pop();
  }

  if (shakeAmount > 0) pop(); // 흔들기 끝

  // 3. 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }

  // 4. 드래그 박스 (시각화)
  if (selection) {
    fill(255, 0, 0, 40);
    stroke(255, 0, 0, 200);
    strokeWeight(2);
    let x = min(selection.x1, selection.x2);
    let y = min(selection.y1, selection.y2);
    let w = abs(selection.x2 - selection.x1);
    let h = abs(selection.y2 - selection.y1);
    rect(x, y, w, h);
  }

  // 5. 콤보 문구
  if (comboAlpha > 0) {
    push();
    textAlign(CENTER, CENTER);
    textSize(80);
    textStyle(BOLD);
    fill(255, 50, 50, comboAlpha);
    text(comboMessage, width / 2, height / 2);
    comboAlpha -= 5;
    pop();
  }

  drawUI();
}

function drawUI() {
  fill(50);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(18);
  text("합이 10이 되게 사과를 드래그하세요!", width/2, 20);

  textSize(28);
  textAlign(LEFT, BOTTOM);
  text(`🍎 SCORE: ${score}`, 30, height - 30);
  
  textAlign(RIGHT, BOTTOM);
  let comboText = comboCount > 0 ? ` [${comboCount} COMBO!]` : "";
  text(`⏳ TIME: ${ceil(timeLeft)}${comboText}`, width - 30, height - 30);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

function mousePressed() {
  selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY };
}

function mouseDragged() {
  if (selection) {
    selection.x2 = mouseX;
    selection.y2 = mouseY;
  }
}

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
    shakeAmount = 15;
    comboMessage = getComboText(comboCount);
    comboAlpha = 255;

    for (let a of selectedApples) {
      a.active = false;
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(a.x, a.y));
      }
    }
  }
  selection = null;
}

function isSelected(a) {
  if (!selection) return false;
  
  // 드래그 방향에 상관없이 영역을 계산하도록 min, max 사용
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  
  let r = APPLE_SIZE / 2;
  
  // 사과의 영역과 드래그 영역이 1픽셀이라도 겹치면 인식
  return (xMin < a.x + r && xMax > a.x - r && yMin < a.y + r && yMax > a.y - r);
}

function getComboText(count) {
  if (count <= 1) return "";
  const list = ["", "DOUBLE!", "TRIPLE!", "QUADRUPLE!", "PENTAKILL!", "LEGENDARY!", "UNSTOPPABLE!"];
  return list[min(count - 1, list.length - 1)];
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-7, 7);
    this.vy = random(-7, 7);
    this.alpha = 255;
    this.color = color(255, random(0, 100), 0); // 다양한 빨강~주황색
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // 중력 효과 추가
    this.alpha -= 8;
  }
  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, random(5, 10));
  }
  finished() { return this.alpha < 0; }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
