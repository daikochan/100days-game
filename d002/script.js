const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player, fishes = [], keys = {}, touchDir = {}, touchPoint = null;

// 画像
const fishImage = new Image();
fishImage.src = "iwashi.png";

const sharkImage = new Image();
sharkImage.src = "shark.png";

const isoyakeImage = new Image();
isoyakeImage.src = "ocean_isoyake.png";

// 🎵 音
const bgm = new Audio("bgm.mp3");
const eatSE = new Audio("eat.mp3");
const levelupSE = new Audio("levelup.mp3");
const deathSE = new Audio("death.mp3");
bgm.loop = true;

const aspectRatio = 2.4;
const maxEnemySize = canvas.width / 2;

function initGame() {
  player = {
    x: 320,
    y: 180,
    size: 16,
    velocity: { x: 0, y: 0 },
    acceleration: 0.15,
    friction: 0.95,
    score: 0,
    eatCount: 0,
    alive: true
  };
  fishes = [];
  keys = {};
  touchDir = { up: false, down: false, left: false, right: false };

  setInterval(() => {
    for (let i = 0; i < 3; i++) spawnFish();
  }, 750);

  bgm.currentTime = 0;
  bgm.play();
  update();
}

function spawnFish() {
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const size = Math.floor(Math.random() * (maxEnemySize - 5) + 5);
    const direction = Math.random() < 0.5 ? 'left' : 'right';
    const y = Math.random() * (canvas.height - 40) + 20;
    const x = direction === 'left' ? canvas.width + size : -size;
    const speed = Math.random() * 2.75 + 0.5;
    fishes.push({ x, y, size, speed, direction });
  }
}

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

canvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  touchPoint = {
    x: t.clientX - rect.left,
    y: t.clientY - rect.top
  };
});

canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const current = {
    x: t.clientX - rect.left,
    y: t.clientY - rect.top
  };
  const dx = current.x - touchPoint.x;
  const dy = current.y - touchPoint.y;
  const th = 20;
  touchDir = {
    left: dx < -th, right: dx > th,
    up: dy < -th, down: dy > th
  };
});

canvas.addEventListener("touchend", () => {
  touchDir = { up: false, down: false, left: false, right: false };
  touchPoint = null;
});

function getMaxSpeed(size) {
  const minSpeed = 1.7;
  const maxSpeed = 4.5;
  const maxSize = 150;
  const scale = Math.min(size, maxSize) / maxSize;
  return maxSpeed - (maxSpeed - minSpeed) * scale;
}

function updatePlayer() {
  let ax = 0, ay = 0;
  if (keys["ArrowRight"] || touchDir.right) ax += player.acceleration;
  if (keys["ArrowLeft"] || touchDir.left) ax -= player.acceleration;
  if (keys["ArrowUp"] || touchDir.up) ay -= player.acceleration;
  if (keys["ArrowDown"] || touchDir.down) ay += player.acceleration;

  player.velocity.x += ax;
  player.velocity.y += ay;

  const currentMaxSpeed = getMaxSpeed(player.size);
  player.velocity.x = Math.max(-currentMaxSpeed, Math.min(currentMaxSpeed, player.velocity.x));
  player.velocity.y = Math.max(-currentMaxSpeed, Math.min(currentMaxSpeed, player.velocity.y));

  if (ax === 0) player.velocity.x *= player.friction;
  if (ay === 0) player.velocity.y *= player.friction;

  player.x += player.velocity.x;
  player.y += player.velocity.y;

  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

function updateFishes() {
  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    f.x += (f.direction === 'left' ? -1 : 1) * f.speed;
    if (f.x < -50 || f.x > canvas.width + 50) fishes.splice(i, 1);
  }
}

function checkCollision() {
  const scale = 0.85;

  for (let i = fishes.length - 1; i >= 0; i--) {
    const f = fishes[i];
    const pw = player.size * aspectRatio;
    const ph = player.size;
    const fw = f.size * aspectRatio;
    const fh = f.size;

    const dx = player.x - f.x;
    const dy = player.y - f.y;

    const rx1 = pw / 2;
    const ry1 = ph / 2;
    const rx2 = fw / 2;
    const ry2 = fh / 2;

    const normX = dx / ((rx1 + rx2) * scale);
    const normY = dy / ((ry1 + ry2) * scale);
    const distance = normX * normX + normY * normY;

    if (distance < 1) {
      if (f.size <= player.size) {
        const ratio = f.size / player.size;
        const growth = f.size === player.size ? 0.5 : Math.max(0.05, 0.5 * ratio);
        player.size += growth;
        player.eatCount += 1;

        const score = Math.floor(10 + (1024 - 10) * ((f.size - 5) / (maxEnemySize - 5)));
        player.score += score;
        eatSE.currentTime = 0;
        eatSE.play();

        if (player.eatCount === 150) {
          levelupSE.play();
        }

        fishes.splice(i, 1);
      } else {
        player.alive = false;
        bgm.pause();
        deathSE.play();
      }
    }
  }
}

function drawBackground() {
  if (player.eatCount >= 150) {
    ctx.drawImage(isoyakeImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawPlayer() {
  ctx.filter = "none";
  const w = player.size * aspectRatio;
  const h = player.size;

  const img = player.eatCount >= 150 ? sharkImage : fishImage;

  ctx.save();
  if (player.velocity.x > 0.1) {
    ctx.translate(player.x + w / 2, player.y - h / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
  } else {
    ctx.translate(player.x - w / 2, player.y - h / 2);
    ctx.drawImage(img, 0, 0, w, h);
  }
  ctx.restore();
}

function drawFishes() {
  ctx.filter = "brightness(0.7) saturate(1.2)";
  for (const f of fishes) {
    const w = f.size * aspectRatio;
    const h = f.size;
    ctx.save();
    if (f.direction === 'right') {
      ctx.translate(f.x + w / 2, f.y - h / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(fishImage, 0, 0, w, h);
    } else {
      ctx.translate(f.x - w / 2, f.y - h / 2);
      ctx.drawImage(fishImage, 0, 0, w, h);
    }
    ctx.restore();
  }
  ctx.filter = "none";
}

function drawTouchPoint() {
  if (touchPoint) {
    ctx.beginPath();
    ctx.arc(touchPoint.x, touchPoint.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
    ctx.fill();
  }
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + player.score, 10, 30);

  if (player.eatCount >= 150) {
    ctx.fillStyle = "red";
  } else if (player.eatCount >= 100) {
    ctx.fillStyle = "orange";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fillText("Eaten: " + player.eatCount, 170, 30);
}

function getTitle(score) {
  if (score < 150) return "しらす";
  if (score < 300) return "いわし";
  if (score < 1000) return "イワシ界のスター";
  if (score < 3000) return "魚の世界の有名人";
  if (score < 10000) return "深淵を覗きし者";
  return "暴虐王";
}

function showGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "36px Arial";
  ctx.fillText("しんでしまった！", canvas.width / 2 - 140, canvas.height / 2 - 60);

  const title = getTitle(player.score);
  ctx.font = "28px Arial";
  ctx.fillText("称号: " + title, canvas.width / 2 - 100, canvas.height / 2 - 10);

  ctx.font = "24px Arial";
  ctx.fillText("スコア: " + player.score, canvas.width / 2 - 70, canvas.height / 2 + 30);

  ctx.font = "18px Arial";
  ctx.fillText("画面をタップしてもう一度プレイ", canvas.width / 2 - 130, canvas.height / 2 + 70);

  setTimeout(() => {
    canvas.addEventListener("touchstart", handleRestart, { once: true });
    canvas.addEventListener("mousedown", handleRestart, { once: true });
  }, 100);
}

function showGameClear() {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  ctx.font = "36px Arial";
  ctx.fillText("ゲームクリア！", canvas.width / 2 - 110, canvas.height / 2 - 60);

  const title = getTitle(player.score);
  ctx.font = "28px Arial";
  ctx.fillText("称号: " + title, canvas.width / 2 - 100, canvas.height / 2 - 10);

  ctx.font = "24px Arial";
  ctx.fillText("スコア: " + player.score, canvas.width / 2 - 70, canvas.height / 2 + 30);

  ctx.font = "18px Arial";
  ctx.fillText("画面をタップしてもう一度プレイ", canvas.width / 2 - 130, canvas.height / 2 + 70);

  setTimeout(() => {
    canvas.addEventListener("touchstart", handleRestart, { once: true });
    canvas.addEventListener("mousedown", handleRestart, { once: true });
  }, 100);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (player.eatCount >= 200) {
    showGameClear();
    return;
  }

  if (player.alive) {
    updatePlayer();
    updateFishes();
    checkCollision();
    drawFishes();
    drawPlayer();
    drawTouchPoint();
    drawScore();
    requestAnimationFrame(update);
  } else {
    drawFishes();
    drawPlayer();
    showGameOver();
  }
}

function handleRestart() {
  canvas.removeEventListener("touchstart", handleRestart);
  canvas.removeEventListener("mousedown", handleRestart);
  location.reload();
}

initGame();

