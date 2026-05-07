let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 55; 

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 무지개색 효과를 위해 HSB 모드 사용 (색상, 채도, 명도, 투명도)
  colorMode(RGB); 
  initGame();
}

function initGame() {
  apples = [];
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
    
    if (selected) scale(1.2);

    // ★ 이모지 폰트 강제 설정 (시스템 이모지 우선)
    textFont("'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif");
    textAlign(CENTER, CENTER);
    textSize(APPLE_SIZE);
    
    if (selected) drawingContext.globalAlpha = 0.6;
    text("🍎", 0, 0);
    drawingContext.globalAlpha = 1.0;

    // 숫자 표시 (폰트를 고딕계열로 다시 변경)
    textFont("'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif");
    fill(255);
    stroke(120, 0, 0);
    strokeWeight(3);
    textStyle(BOLD);
    textSize(28);
    text(a.val, 0, 6); 
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

  if (selection) {
    noFill();
    stroke(255, 80, 80, 180);
    strokeWeight(3);
    drawingContext.setLineDash([5, 5]);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    drawingContext.setLineDash([]); 
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
  fill(80, 40, 40);
  noStroke();
  textFont("'Apple SD Gothic Neo', sans-serif");
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

// ★ 무지개색 효과를 가진 FloatingText 클래스
class FloatingText {
  constructor(t, x, y) {
    this.t = t; this.x = x; this.y = y;
    this.a = 255;
    this.hue = 0; // 무지개색 시작점
  }
  update() { 
    this.y -= 2; 
    this.a -= 4; 
    this.hue = (this.hue + 5) % 360; // 매 프레임 색상 변경
  }
  show() {
    push();
    colorMode(HSB); // 잠시 HSB 모드로 전환
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    
    fill(this.hue, 80, 100, this.a / 255); // 무지개색 채우기
    stroke(0, 0, 100, this.a / 255); // 흰색 테두리
    strokeWeight(5);
    
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
