// Canvas と context の取得
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// プレイヤー設定
const player = {
  x: 180,
  y: 550,
  width: 40,
  height: 40,
  color: "cyan",
  speed: 5
};

// 状態変数
let obstacles = [];
let scoreItems = [];
let invincibleItems = [];
let baseScore = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let isInvincible = false;
let invincibleTimer = 0;
let isBlinking = false;
let startTime = 0;
let frame = 0;
let gameOver = false;
let gameStarted = false;
let keys = {};
let obstacleSpeedMultiplier = 1;

// キー入力
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// タッチボタン対応
["mousedown", "touchstart"].forEach(e =>
  document.getElementById("leftBtn").addEventListener(e, () => keys["ArrowLeft"] = true)
);
["mouseup", "mouseleave", "touchend"].forEach(e =>
  document.getElementById("leftBtn").addEventListener(e, () => keys["ArrowLeft"] = false)
);
["mousedown", "touchstart"].forEach(e =>
  document.getElementById("rightBtn").addEventListener(e, () => keys["ArrowRight"] = true)
);
["mouseup", "mouseleave", "touchend"].forEach(e =>
  document.getElementById("rightBtn").addEventListener(e, () => keys["ArrowRight"] = false)
);

function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  document.getElementById("startOverlay").style.display = "none";

  const bgm = document.getElementById("bgm");
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
    const playPromise = bgm.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => console.log("BGM再生失敗:", err));
    }
  }

  startTime = Date.now();
  frame = 0;
  baseScore = 0;
  gameOver = false;

  update();
}

document.getElementById("startOverlay").addEventListener("click", startGame);

function spawnObstacle() {
  const width = Math.random() * 60 + 20;
  const x = Math.random() * (canvas.width - width);
  obstacles.push({ x, y: -20, width, height: 20, speed: 4 * obstacleSpeedMultiplier });
}

function spawnScoreItem() {
  const x = Math.random() * (canvas.width - 20);
  scoreItems.push({ x, y: -20, width: 20, height: 20, speed: 4 });
}

function spawnInvincibleItem() {
  const x = Math.random() * (canvas.width - 30);
  invincibleItems.push({ x, y: -30, width: 30, height: 30, speed: 3 });
}

function update() {
  if (gameOver) return;

  const now = Date.now();
  const elapsedSec = (now - startTime) / 1000;
  score = baseScore + Math.floor(elapsedSec / 0.6);

  if (isInvincible) {
    invincibleTimer--;
    if (invincibleTimer <= 120) isBlinking = true;
    if (invincibleTimer <= 0) {
      isInvincible = false;
      isBlinking = false;
    }
  }

  obstacleSpeedMultiplier = Math.min(1.0 + elapsedSec / 120, 1.3);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

  if (isInvincible && isBlinking) {
    ctx.globalAlpha = Math.floor(frame / 10) % 2 === 0 ? 0.3 : 1.0;
    ctx.fillStyle = "magenta";
  } else {
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = isInvincible ? "magenta" : player.color;
  }
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.globalAlpha = 1.0;

  for (let i = scoreItems.length - 1; i >= 0; i--) {
    const item = scoreItems[i];
    item.y += item.speed;
    ctx.fillStyle = "yellow";
    ctx.fillRect(item.x, item.y, item.width, item.height);
    if (item.y + item.height > player.y && item.y < player.y + player.height &&
        item.x < player.x + player.width && item.x + item.width > player.x) {
      baseScore += 10;
      scoreItems.splice(i, 1);
    }
  }

  for (let i = invincibleItems.length - 1; i >= 0; i--) {
    const item = invincibleItems[i];
    item.y += item.speed;
    ctx.fillStyle = "lime";
    ctx.fillRect(item.x, item.y, item.width, item.height);
    if (item.y + item.height > player.y && item.y < player.y + player.height &&
        item.x < player.x + player.width && item.x + item.width > player.x) {
      isInvincible = true;
      invincibleTimer = 10 * 60;
      isBlinking = false;
      invincibleItems.splice(i, 1);
    }
  }

  for (let o of obstacles) {
    o.y += o.speed;
    ctx.fillStyle = "red";
    ctx.fillRect(o.x, o.y, o.width, o.height);
    if (o.y + o.height > player.y && o.y < player.y + player.height &&
        o.x < player.x + player.width && o.x + o.width > player.x) {
      if (isInvincible) {
        baseScore += 10;
        obstacles.splice(obstacles.indexOf(o), 1);
      } else {
        gameOver = true;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
        const bgm = document.getElementById("bgm");
        if (bgm) {
          bgm.pause();
          bgm.currentTime = 0;
        }
        alert("ゲームオーバー！スコア：" + score);
        location.reload();
        return;
      }
    }
  }

  frame++;
  if (frame % 30 === 0) spawnObstacle();
  if (frame % 60 === 0) spawnScoreItem();
  if (elapsedSec >= 10 && Math.floor((elapsedSec - 10) % 40) === 0 && frame % 60 === 0) {
    spawnInvincibleItem();
  }

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("High Score: " + highScore, 10, 55);
  if (isInvincible) {
    ctx.fillStyle = "aqua";
    ctx.fillText("無敵中!!", 280, 30);
  }

  requestAnimationFrame(update);
}
