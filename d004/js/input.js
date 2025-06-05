// input.js

window.heldBomb = null;
let offsetX = 0;
let offsetY = 0;

function getTouchPosition(e) {
  if (e.touches) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  } else {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }
}

function findNearestBomb(x, y) {
  let nearest = null;
  let minDist = Infinity;

  for (const bomb of bombList) {
    if (bomb.exploded || bomb.markedForDeletion) continue; // 削除予定だけ除外

    const dx = bomb.x - x;
    const dy = bomb.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bomb.radius && dist < minDist) {
      nearest = bomb;
      minDist = dist;
    }
  }
  return nearest;
}

function onDown(e) {
  const pos = getTouchPosition(e);
  const target = findNearestBomb(pos.x, pos.y);
  if (target) {
    window.heldBomb = target;
    window.heldBomb.held = true;
    offsetX = pos.x - window.heldBomb.x;
    offsetY = pos.y - window.heldBomb.y;
    playSE("hold");
  }
}

function onMove(e) {
  if (!window.heldBomb) return;
  const pos = getTouchPosition(e);
  let newX = pos.x - offsetX;
  let newY = pos.y - offsetY;
  const r = window.heldBomb.radius;
  const minY = r; // 安全地帯より下のみ
  const maxY = canvas.height - r;

  newX = Math.max(r, Math.min(canvas.width - r, newX));
  newY = Math.max(minY, Math.min(maxY, newY));

  window.heldBomb.x = newX;
  window.heldBomb.y = newY;
}

function onUp(e) {
  if (window.heldBomb) {
    window.heldBomb.held = false;
    playSE("release");
    checkDrop(window.heldBomb);
    window.heldBomb = null;
  }
}

canvas.addEventListener("mousedown", onDown);
canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("mouseup", onUp);

canvas.addEventListener("touchstart", onDown);
canvas.addEventListener("touchmove", onMove);
canvas.addEventListener("touchend", onUp);
