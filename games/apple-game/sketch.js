let apples = [];
let cols = 17;
let rows = 10;
let selection = null; // 드래그 영역 저장
let score = 0;
let timeLeft = 120;

function setup() {
  createCanvas(800, 500);
  // 사과 초기화
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 45 + 40,
        y: j * 45 + 40,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

function draw() {
  background(255, 245, 245); // 연분홍색 배경
  
  // 사과 그리기
  for (let a of apples) {
    if (!a.active) continue;
    
    // 선택 영역 안에 있는지 확인
    let selected = isSelected(a);
    
    push();
    if (selected) {
      fill(255, 200, 200); // 선택 시 하이라이트
      stroke(255, 0, 0);
    } else {
      fill(255, 100, 100); // 기본 사과색
      noStroke();
    }
    ellipse(a.x, a.y, 35);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(a.val, a.x, a.y);
    pop();
  }

  // 드래그 박스 그리기
  if (selection) {
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(2);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  // UI
  fill(50);
  textSize(24);
  textAlign(LEFT);
  text(`🍎 SCORE: ${score}`, 20, height - 20);
  text(`⏳ TIME: ${ceil(timeLeft)}`, width - 150, height - 20);
  
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

  // 합이 10이면 제거!
  if (sum === 10) {
    for (let a of selectedApples) a.active = false;
    score += selectedApples.length;
  }

  selection = null;
}

function isSelected(a) {
  if (!selection) return false;
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);
  return a.x > xMin && a.x < xMax && a.y > yMin && a.y < yMax;
}