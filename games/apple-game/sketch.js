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
  if (shakeAmount > 0) {
    push();
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.6; 
  }

  background(255, 250, 245);
  
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    translate(a.x, a.y);
    if (selected) scale(1.15); 

    drawRealisticApple(selected); 

    // ★ 숫자 가독성 개선: 번짐 삭제 및 얇은 테두리 추가
    fill(255);
    stroke(0, 0, 0, 150); // 아주 얇고 투명도 있는 검정 테두리
    strokeWeight(1.5);    // 테두리 두께
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(26);
    text(a.val, 0, 0); 
    pop();
  }

  if (shakeAmount > 0) pop();
  updateEffects();

  if (selection) {
    noFill();
    stroke(200, 50, 50, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  drawUI();
}

function drawRealisticApple(selected) {
  push();
  let grad = drawingContext.createRadialGradient(-5, -5, 2, 0, 0, APPLE_SIZE / 2);
  
  if (selected) {
    grad.addColorStop(0, '#ffcfcf'); 
    grad.addColorStop(0.5, '#ff7070');
    grad.addColorStop(1, '#cc4040');
  } else {
    grad.addColorStop(0, '#fff2a8'); 
    grad.addColorStop(0.3, '#ff4d4d'); 
    grad.addColorStop(1, '#a10000');   
  }
  
  drawingContext.fillStyle = grad;
  noStroke(); // 구체 자체에는 선을 없앰
  ellipse(0, 0, APPLE_SIZE, APPLE_SIZE);

  // 느낌표 모양 곡선 하이라이트
  push();
  rotate(-QUARTER_PI);
  noFill();
  stroke(255, 255, 255, 180);
  strokeWeight(4);
  strokeCap(ROUND);
  arc(0, 0, APPLE_SIZE * 0.7, APPLE_SIZE * 0.7, PI + 0.2, PI + 0.8);
  
  noStroke();
  fill(255, 255, 255, 150);
  ellipse(-APPLE_SIZE * 0.35, 5, 4, 4);
  pop();

  // 하단 반사광
  fill(255, 255, 255, 30);
  ellipse(5, APPLE_SIZE * 0.25, APPLE_SIZE * 0.4, APPLE_SIZE * 0.15);
  pop();
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
  text(`SCORE: ${score}`, 40, height - 40);
  textAlign(RIGHT, BOTTOM);
  text(`TIME: ${ceil(timeLeft)}s`, width - 40, height - 40);
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
  if (millis() - lastMatchTime > 5000) comboCount = 0;
}

function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }
function mouseReleased() {
  if (!selection) return;
  let sum = 0, sApples = [], cX = 0, cY = 0;
  for (let a of apples) {
    if (a.active && isSelected(a)) {
      sum += a.val; sApples.push(a);
      cX += a.x; cY += a.y;
    }
  }
  if (sum === 10) {
    comboCount++;
    lastMatchTime = millis();
    score += (10 * comboCount); 
    shakeAmount = 5;
    cX /= sApples.length; cY /= sApples.length;
    if (comboCount > 1) floatingTexts.push(new FloatingText(`${comboCount} COMBO!`, cX, cY));
    for (let a of sApples) {
      a.active = false;
      for (let i = 0; i < 12; i++) particles.push(new Particle(a.x, a.y));
    }
  }
  selection = null;
}

class FloatingText {
  constructor(t, x, y) { this.t = t; this.x = x; this.y = y; this.a = 255; this.hue = 0; }
  update() { this.y -= 2.5; this.a -= 4; this.hue = (this.hue + 8) % 360; }
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

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-5, 5); this.vy = random(-5, 5);
    this.a = 255;
  }
  update() { this.x += this.vx; this.y += this.vy; this.a -= 10; }
  show() {
    noStroke();
    fill(200, 50, 50, this.a);
    ellipse(this.x, this.y, random(4, 8));
  }
  finished() { return this.a < 0; }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
