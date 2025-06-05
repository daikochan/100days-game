// bomb.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bombImages = {
  red: new Image(),
  blue: new Image(),
};
bombImages.red.src = "assets/images/dot_red.png";
bombImages.blue.src = "assets/images/dot_blue.png";

const bombList = [];

class Bomb {
  constructor(color) {
    this.color = color;
    this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    this.y = canvas.height + 50;
    this.radius = 40;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -1 * (Math.random() * 2 + 1);
    this.timer = 0;
    this.exploded = false;
    this.held = false;
    this.spawnTime = Date.now();
    this.blinking = false;
    this.scale = 1;
    this.opacity = 1;
    this.markedForDeletion = false;
    this.safe = false; // ✅ 成功ゾーンにいる場合true
  }

  update() {
    if (this.held || this.exploded || this.safe) return;

    this.x += this.vx;
    this.y += this.vy;

    const r = this.radius;
    const minX = r;
    const maxX = canvas.width - r;
    const minY = canvas.height * 0.5 + r;
    const maxY = canvas.height - r;

    // 範囲を超えたら反転（自動移動時のみ）
    if (this.x < minX || this.x > maxX) {
      this.vx *= -1;
      this.x = Math.max(minX, Math.min(maxX, this.x));
    }
    if (this.y < minY || this.y > maxY) {
      this.vy *= -1;
      this.y = Math.max(minY, Math.min(maxY, this.y));
    }


    const elapsed = (Date.now() - this.spawnTime) / 1000;

    if (elapsed > 8 && !this.blinking) {
      this.blinking = true;
      playSE("warningBeep");
    }

    if (elapsed > 10 && this.scale < 1.2) {
      this.scale += 0.01;
    }

    if (elapsed >= 12 && !this.exploded) {
      this.explode();
    }

    if (this.markedForDeletion) {
      this.scale += 0.05;
      this.opacity -= 0.05;
      if (this.opacity <= 0) {
        this.exploded = true;

      // ✅ 爆発キャラを bombList から削除
      const index = bombList.indexOf(this);
      if (index !== -1) {
        bombList.splice(index, 1);
      }
    }
  }

  }

  draw() {
    if (this.exploded) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.opacity;

    if (this.blinking && Math.floor(Date.now() / 200) % 2 === 0) {
      ctx.globalAlpha *= 0.3;
    }

    ctx.drawImage(bombImages[this.color], -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  explode() {
    if (this.safe) return; // ✅ 安全地帯にいるなら爆発しない
    this.exploded = true;
    playSE("alarm");
    setTimeout(() => {
      playSE("explosion");
      stopAllBombs();
      if (typeof window.endGame === "function") {
        window.endGame();
      }
    }, 500);
  }
}

function drawBombs() {
  bombList.forEach(bomb => {
    bomb.update();
    bomb.draw();
  });
}

function spawnBomb() {
  const color = Math.random() < 0.5 ? "red" : "blue";
  const bomb = new Bomb(color);
  bombList.push(bomb);
}

function stopAllBombs() {
  bombList.forEach(b => {
    b.vx = 0;
    b.vy = 0;
  });
}

window.bombList = bombList;
window.drawBombs = drawBombs;
window.spawnBomb = spawnBomb;
window.stopAllBombs = stopAllBombs;
