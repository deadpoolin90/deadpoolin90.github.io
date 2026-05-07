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
  // 구슬들이 화면에 꽉 차도록 간격 설정
  cols = floor(width / 70);
  rows = floor((height - 150) / 70);
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
  // 화면 흔들림 효과
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
    if (selected) scale(1.15); // 선택 시 쫀득하게 커짐

    // 입체적인 구(Sphere) 그리기
    drawSphere(selected); 

    // 숫자 표시
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(26);
    text(a.val, 0, 0); 
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

  // 드래그 박스 표시 (점선 스타일)
  if (selection) {
    noFill();
    stroke(255, 80, 80, 180);
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    drawingContext.setLineDash([]); 
  }

  drawUI();
}

// 입체적인 구(Sphere) 그리기 함수
function drawSphere(selected) {
  noStroke();
  
  // 1. 하단 어두운 면 (Shadow)
  let shadowCol = selected ? color(200, 50, 50) : color(160, 0, 0);
  fill(shadowCol);
  ellipse(0, 0, APPLE_SIZE, APPLE_SIZE);

  // 2. 중간 밝은 면 (Mid-tone)
  let midCol = selected ? color(255, 130, 130) : color(240, 50, 50);
  fill(midCol);
  ellipse(0, -2, APPLE_SIZE * 0.92, APPLE_SIZE * 0.88);

  // 3. 상단 하이라이트 (Highlight)
  fill(255, 255, 255, 220);
  ellipse(-12, -12, 16, 10);
  
  // 4. 하단 반사광 (Rim light)
  fill(255, 255, 255, 60);
  ellipse(0, APPLE_SIZE * 0.3, APPLE_SIZE * 0.4, APPLE_SIZE * 0.15);
}

// 민감한 선택 판정 (박스가 구슬 영역에 살짝만 닿아도 선택)
function isSelected(a) {
  if (!selection) return false;
  
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  
  let r = APPLE_SIZE / 2;
  
  // AABB 충돌 체크: 사각형과 사각형이 겹치는지 확인
  return (xMax > a.x - r && xMin < a.x + r && 
          yMax > a.y - r && yMin < a.y + r);
}

function updateEffects() {
  // 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }
  // 콤보 텍스트 업데이트
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    floatingTexts[i].show();
    if (floatingTexts[i].finished()) floatingTexts.splice(i, 1);
  }
}

function drawUI() {
  fill(100, 50, 50);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text("🔴 숫자의 합이 10이 되게 드래그하세요!", width/2, 30);

  textSize(30);
  textAlign(LEFT, BOTTOM);
  text(`SCORE: ${score}`, 40, height - 40);
  
  textAlign(RIGHT, BOTTOM);
  text(`TIME: ${ceil(timeLeft)}s`, width - 40, height - 40);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0; // 5초간 못 맞추면 콤보 리셋
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
  let sApples = [];
  let cX = 0, cY = 0;

  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val;
      sApples.push(a);
      cX += a.x; cY += a.y;
    }
  }

  // 합이 10이면 팡!
  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (10 * comboCount); 
    shakeAmount = 5; // 타격감 강화
    
    cX /= sApples.length;
    cY /= sApples.length;

    if (comboCount > 1) {
      floatingTexts.push(new FloatingText(`${comboCount} COMBO!`, cX, cY));
    }

    for (let a of sApples) {
      a.active = false;
      for (let i = 0; i < 12; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

// 무지개색 콤보 텍스트 클래스
class FloatingText {
  constructor(t, x, y) {
    this.t = t; this.x = x; this.y = y;
    this.a = 255;
    this.hue = 0;
  }
  update() { 
    this.y -= 2.5; 
    this.a -= 4; 
    this.hue = (this.hue + 8) % 360; 
  }
  show() {
    push();
    colorMode(HSB);
    textAlign(CENTER, CENTER);
    textSize(45);
    textStyle(BOLD);
    fill(this.hue, 80, 100, this.a / 255);
    stroke(0, 0, 100, this.a / 255);
    strokeWeight(6);
    text(this.t, this.x, this.y);
    pop();
  }
  finished() { return this.a < 0; }
}

// 팡 터지는 파티클 클래스
class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.a = 255;
  }
  update() { this.x += this.vx; this.y += this.vy; this.a -= 10; }
  show() {
    noStroke();
    fill(255, 80, 80, this.a);
    ellipse(this.x, this.y, random(4, 8));
  }
  finished() { return this.a < 0; }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
