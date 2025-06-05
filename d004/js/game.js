let gameInterval = null;
let spawnTimer = 0;
let spawnInterval = 3000;
let gameStartTime = 0;

/**
 * ゲームループを開始する
 * @param {Function} onGameOverCallback - ゲーム終了後の処理
 */
function startGameLoop(onGameOverCallback) {
  gameStartTime = Date.now();
  spawnInterval = 3000;
  bombList.length = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOverlay();    // ✅ 安全地帯・移動範囲
    drawBombs();      // ✅ ボムの描画

    const now = Date.now();
    const elapsed = (now - gameStartTime) / 1000;

    if (elapsed > 60) {
      spawnInterval = 1000;
    } else if (elapsed > 30) {
      spawnInterval = 2000;
    }

    if (now - spawnTimer > spawnInterval) {
      const count = Math.min(2 + Math.floor(elapsed / 30), 3);
      for (let i = 0; i < count; i++) {
        spawnBomb();
      }
      spawnTimer = now;
    }

    gameInterval = requestAnimationFrame(loop);
  }

  loop();

  // ※ ここではタイムアウト終了は使わない（爆発で終了）
  setTimeout(() => {
    cancelAnimationFrame(gameInterval);
    onGameOverCallback();
  }, 90000);
}

/**
 * ✅ 常時表示のオーバーレイ（安全地帯＋移動範囲）
 */
function drawOverlay() {
  const zoneTop = 0;
  const zoneBottom = canvas.height * 0.5;
  const zoneMid = canvas.width / 2;

  // グレーの移動範囲（画面下部）
  ctx.fillStyle = "#888"; // 灰色をはっきり表示（透過なし）
  ctx.fillRect(0, zoneBottom, canvas.width, canvas.height - zoneBottom);

  // 赤ゾーン（左）
  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
  ctx.fillRect(0, zoneTop, zoneMid, zoneBottom);

  // 青ゾーン（右）
  ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
  ctx.fillRect(zoneMid, zoneTop, zoneMid, zoneBottom);
}