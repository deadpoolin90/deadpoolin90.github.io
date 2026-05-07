let player;
let bullets = [];
let score = 0;
let difficulty = 1;

function setup() {
    // 브라우저 창 크기에 딱 맞게 생성
    createCanvas(windowWidth, windowHeight);
    player = new Player();
}

// 브라우저 창 크기를 바꾸면 게임 화면도 자동으로 맞춰짐
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(10, 10, 25, 45); // 몽환적인 잔상을 위한 알파값 적용
    
    score += 1;
    difficulty = 1 + score / 1000;

    player.update();
    player.show();

    // 난이도에 따른 탄환 생성
    if (frameCount % max(5, floor(20 / difficulty)) == 0) {
        bullets.push(new Bullet());
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].show();

        if (bullets[i].hits(player)) {
            gameOver();
        }

        if (bullets[i].offscreen()) {
            bullets.splice(i, 1);
        }
    }

    // UI 디자인
    drawUI();
}

function drawUI() {
    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(18);
    text(`⭐ SCORE: ${floor(score/10)}`, 30, 40);
    text(`🔥 LEVEL: ${difficulty.toFixed(1)}`, 30, 70);
}

class Player {
    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.r = 12;
        this.lerpSpeed = 0.15;
    }
    update() {
        let target = createVector(mouseX, mouseY);
        this.pos.lerp(target, this.lerpSpeed);
    }
    show() {
        push();
        fill(200, 255, 255);
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = color(0, 255, 255);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
        pop();
    }
}

class Bullet {
    constructor() {
        let edge = floor(random(4));
        if (edge === 0) { this.pos = createVector(random(width), -20); }
        else if (edge === 1) { this.pos = createVector(random(width), height + 20); }
        else if (edge === 2) { this.pos = createVector(-20, random(height)); }
        else { this.pos = createVector(width + 20, random(height)); }

        let target = createVector(mouseX, mouseY);
        this.vel = p5.Vector.sub(target, this.pos);
        this.vel.setMag(random(3, 6) * difficulty);
        this.r = 5;
    }
    update() { this.pos.add(this.vel); }
    show() {
        push();
        fill(255, 50, 255);
        noStroke();
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color(255, 0, 255);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
        pop();
    }
    hits(player) {
        let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
        return d < this.r + player.r - 2;
    }
    offscreen() {
        return (this.pos.x < -100 || this.pos.x > width + 100 || 
                this.pos.y < -100 || this.pos.y > height + 100);
    }
}

function gameOver() {
    noLoop();
    background(0, 0, 0, 200);
    textAlign(CENTER);
    fill(255, 0, 100);
    textSize(60);
    text("SYSTEM CRASHED", width / 2, height / 2);
    fill(255);
    textSize(20);
    text(`FINAL SCORE: ${floor(score/10)}`, width / 2, height / 2 + 50);
    text("Press F5 to Retry", width / 2, height / 2 + 90);
}
