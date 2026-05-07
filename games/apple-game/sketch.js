let apples = [];
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;
const APPLE_SIZE = 45; // 사과의 히트박스 크기

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 화면 크기에 맞춰 열과 행 계산
  cols = floor(width / 55);
  rows = floor((height - 80) / 55);
  initApples();
}

function initApples() {
  apples = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 55 + 40,
        y: j * 55 + 40,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255, 245, 245);
  
  for (let a of apples) {
    if (!a.active) continue;
    
    let selected = isSelected(a);
    
    push();
    if (selected) {
      fill(255, 255, 150); // 선택 시 밝은 노란색
      stroke(255, 0, 0);
      strokeWeight(3);
    } else {
      fill(255, 100, 100);
      noStroke();
    }
    
    // 사과 그리기
    ellipse(a.x, a.y, APPLE_SIZE); 
    
    // 숫자 그리기
    fill(selected ? 0 : 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(a.val, a.x, a.y);
    pop();
  }

  // 드래그 박스 시각화
  if (selection) {
    fill(255, 0, 0, 30); // 박스 내부 연한 빨간색
    stroke(255, 0, 0, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  // UI 상단 배치
  drawUI();
}

function drawUI() {
  fill(50);
  noStroke();
  textSize(26);
  textAlign(LEFT, TOP);
  text(`🍎 점수: ${score}`, 20, height - 50);
  textAlign(RIGHT, TOP);
  text(`⏳ 시간: ${ceil(timeLeft)}`, width - 20, height - 50);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
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
    for (let a of selectedApples) a.active = false;
    score += selectedApples.length;
  }

  selection = null;
}

// ★ 핵심: 사각형 충돌 판정 (조금이라도 겹치면 true)
function isSelected(a) {
  if (!selection) return false;

  // 드래그 박스 영역 계산
  let selX = min(selection.x1, selection.x2);
  let selY = min(selection.y1, selection.y2);
  let selW = abs(selection.x2 - selection.x1);
  let selH = abs(selection.y2 - selection.y1);

  // 사과를 감싸는 사각형 영역 (히트박스)
  let appleR = APPLE_SIZE / 2;
  let appleX = a.x - appleR;
  let appleY = a.y - appleR;
  let appleW = APPLE_SIZE;
  let appleH = APPLE_SIZE;

  // 두 직사각형이 겹치는지 확인하는 공식
  return (selX < appleX + appleW &&
          selX + selW > appleX &&
          selY < appleY + appleH &&
          selY + selH > appleY);
}
