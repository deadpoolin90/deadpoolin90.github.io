let apples = [];
let cols, rows;
let selection = null;
let score = 0;
let timeLeft = 120;

function setup() {
  // 브라우저 창 크기에 맞게 캔버스 생성
  createCanvas(windowWidth, windowHeight);
  
  // 화면 크기에 맞춰 사과 개수 조절 (가로세로 50픽셀 간격)
  cols = floor(width / 50);
  rows = floor((height - 60) / 50);
  
  initApples();
}

function initApples() {
  apples = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      apples.push({
        x: i * 50 + 30,
        y: j * 50 + 30,
        val: floor(random(1, 10)),
        active: true
      });
    }
  }
}

// 창 크기가 바뀌면 게임 화면도 다시 맞춤
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / 50);
  rows = floor((height - 60) / 50);
  initApples(); // 새로 고침 (원치 않으면 이 줄은 빼도 돼)
}

function draw() {
  background(255, 245, 245);
  
  for (let a of apples) {
    if (!a.active) continue;
    let selected = isSelected(a);
    
    push();
    if (selected) {
      fill(255, 200, 200);
      stroke(255, 0, 0);
      strokeWeight(2);
    } else {
      fill(255, 100, 100);
      noStroke();
    }
    ellipse(a.x, a.y, 40); // 사과 크기 살짝 키움
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(a.val, a.x, a.y);
    pop();
  }

  if (selection) {
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(3);
    rect(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
  }

  // UI 위치를 화면 아래쪽에 고정
  fill(50);
  noStroke();
  textSize(24);
  textAlign(LEFT);
  text(`🍎 SCORE: ${score}`, 20, height - 25);
  textAlign(RIGHT);
  text(`⏳ TIME: ${ceil(timeLeft)}`, width - 20, height - 25);
  
  if (frameCount % 60 == 0 && timeLeft > 0) timeLeft--;
}

// mousePressed, mouseDragged, mouseReleased, isSelected 함수는 기존과 동일하게 유지
function mousePressed() { selection = { x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }; }
function mouseDragged() { if (selection) { selection.x2 = mouseX; selection.y2 = mouseY; } }
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

function isSelected(a) {
  if (!selection) return false;

  // 드래그 박스의 최소/최대 좌표 계산
  let xMin = min(selection.x1, selection.x2);
  let xMax = max(selection.x1, selection.x2);
  let yMin = min(selection.y1, selection.y2);
  let yMax = max(selection.y1, selection.y2);

  // 사과의 반지름 (현재 원 크기가 40이므로 반지름은 20)
  let r = 20; 

  // 핵심 로직: 사과의 중심에서 드래그 박스와 가장 가까운 지점을 찾음
  let closestX = constrain(a.x, xMin, xMax);
  let closestY = constrain(a.y, yMin, yMax);

  // 사과 중심과 그 지점 사이의 거리 계산
  let distanceX = a.x - closestX;
  let distanceY = a.y - closestY;

  // 피타고라스 정리에 의해 거리의 제곱이 반지름의 제곱보다 작으면 닿은 것!
  let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  return distanceSquared < (r * r);
}
