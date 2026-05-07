let apples = [];
let particles = [];
let floatingTexts = []; 
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 48; 

let comboCount = 0;
let lastMatchTime = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  apples = [];
  // 사과 간격 및 상하좌우 여백 조정
  cols = floor(width / 65);
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
  // 1. 화면 흔들림 (아주 미세하게)
  if (shakeAmount > 0) {
    push();
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.6; 
  }

  background(255, 245, 245);
  
  // 2. 사과 그리기 루프
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    translate(a.x, a.y);
    
    // 선택 시 쫀득하게 작아짐 (0.85배)
    if (selected) scale(0.85);

    drawAppleShape(selected); // 사과 쉐입 그리기

    // 숫자 그리기 (흰색 볼드, 정중앙)
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(24);
    text(a.val, 0, 4); 
    pop();
  }

  if (shakeAmount > 0) pop(); // 흔들림 종료

  updateEffects(); // 파티클 및 콤보 텍스트

  // 3. 드래그 박스 (깔끔한 레드 라인)
  if (selection) {
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  drawUI();
}

// 사과 모양 전용 렌더링 함수
function drawAppleShape(selected) {
  // 꼭지
  stroke(101, 67, 33);
  strokeWeight(3);
  line(0, -15, 0, -25);
  
  // 잎사귀
  noStroke();
  fill(34, 139, 34);
  ellipse(8, -22, 12, 6);

  // 몸통 색상 (선택 시 연분홍 하이라이트)
  if (selected) {
    fill(255, 200, 200); 
    stroke(255, 0, 0);
    strokeWeight(2);
  } else {
    fill(230, 50, 50);
    noStroke();
  }

  // 사과 특유의 굴곡진 쉐입 (beginShape)
  beginShape();
  for (let i = 0; i < TWO_PI; i += 0.1) {
    let r = APPLE_SIZE * 0.5 * (1 - 0.1 * sin(i) + 0.1 * abs(cos(i)));
    let x = r * cos(i);
    let y = r * sin(i);
    vertex(x, y);
  }
  endShape(CLOSE);

  // 광택(Highlight) 추가
  if (!selected) {
    fill(255, 255, 255, 130);
    ellipse(-8, -8, 12, 7);
  }
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
    shakeAmount = 1.5; // 화면 흔들림 최소화
    
    cX /= selectedApples.length;
    cY /= selectedApples.length;

    // 터진 위치에 콤보 텍스트 생성
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
