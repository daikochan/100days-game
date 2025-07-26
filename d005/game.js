// game.js
import { getMazeByDifficulty, generatePuzzle } from './maze.js';
import { initInput } from './input.js';
import {
  sfxMove, sfxBlock, sfxClick, sfxGoal, sfxUndo,
  startBGM, stopBGM, toggleBGM, isBgmPlaying
} from './sound.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const menu  = document.getElementById('menu-screen');
const app   = document.getElementById('game-screen');
const timerEl = document.getElementById('timer');
const btnReset = document.getElementById('btn-reset');
const btnNew   = document.getElementById('btn-new');
const btnBack  = document.getElementById('btn-back');
const btnBgm   = document.getElementById('btn-bgm');

let rows, cols, genOpts;
let targetRow = [], targetCol = [];
let curRow = [], curCol = [];
let visited = [];
let path = [];
let player = { x: 0, y: 0 };
let startTime, timerInterval;
let TILE = 40;

/* ガターは動的に最適化して盤面を最大化する */
let GUTTER = { LEFT: 56, TOP: 34, RIGHT: 56, BOTTOM: 34 };

/* キャラ画像 */
const playerImg = new Image();
playerImg.src = 'assets/images/player.png';

/* BGMボタン表示更新 */
function updateBgmButton(){
  if(!btnBgm) return;
  const on = isBgmPlaying();
  btnBgm.classList.toggle('off', !on);
  btnBgm.setAttribute('aria-pressed', String(on));
  btnBgm.textContent = on ? '♪ BGM On' : '♪ BGM Off';
}

/* 難易度選択 */
menu.addEventListener('click', (e) => {
  const btn = e.target.closest('.diff');
  if (!btn) return;
  const diff = getMazeByDifficulty(btn.dataset.level);
  const { rows: r, cols: c, ...opts } = diff;
  rows = r; cols = c; genOpts = opts;
  sfxClick();
  startGame();
});

/* サイドパネル */
btnReset?.addEventListener('click', () => { sfxClick(); resetPath(); draw(); });
btnNew  ?.addEventListener('click',   () => { sfxClick(); startGame(); });
btnBack ?.addEventListener('click',  () => {
  sfxClick();
  clearInterval(timerInterval);
  stopBGM(); updateBgmButton();
  app.style.display  = 'none';
  menu.style.display = 'grid';
});

/* BGM トグル */
btnBgm?.addEventListener('click', () => {
  sfxClick();
  const on = toggleBGM();
  updateBgmButton();
});

/* ===== キャンバスサイズ調整（盤面を可能な限り大きく） ===== */
function fitBoard() {
  const appRect = app.getBoundingClientRect();

  const leftRect  = document.querySelector('.left')?.getBoundingClientRect();
  const rightRect = document.querySelector('.right')?.getBoundingClientRect();
  const leftW  = leftRect?.width  ?? 0;
  const rightW = rightRect?.width ?? 0;

  const maxH = appRect.height - 16;
  const maxW = appRect.width  - leftW - rightW - 24;

  // --- 1st pass（仮のガターでTILEを決める）
  let g = { LEFT: 44, TOP: 28, RIGHT: 28, BOTTOM: 28 };
  let t = Math.max(12, Math.min(
    Math.floor((maxH - g.TOP - g.BOTTOM) / rows),
    Math.floor((maxW - g.LEFT - g.RIGHT) / cols)
  ));

  // --- 2nd pass（TILEに応じてガターを再計算 → 再度TILE算出）
  const deriveGutter = (tile) => ({
    LEFT:   Math.max(36, Math.floor(tile * 0.90)),
    TOP:    Math.max(26, Math.floor(tile * 0.75)),
    RIGHT:  Math.max(16, Math.floor(tile * 0.40)),
    BOTTOM: Math.max(26, Math.floor(tile * 0.50)),
  });
  g = deriveGutter(t);
  t = Math.max(12, Math.min(
    Math.floor((maxH - g.TOP - g.BOTTOM) / rows),
    Math.floor((maxW - g.LEFT - g.RIGHT) / cols)
  ));

  GUTTER = g;
  TILE = t;

  const cssW = GUTTER.LEFT + cols * TILE + GUTTER.RIGHT;
  const cssH = GUTTER.TOP  + rows * TILE + GUTTER.BOTTOM;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const OFFX = () => GUTTER.LEFT;
const OFFY = () => GUTTER.TOP;
const gridToXY = (x, y) => [OFFX() + x * TILE, OFFY() + y * TILE];

/* ゲーム開始 */
function startGame() {
  menu.style.display = 'none';
  app.style.display  = 'grid';

  fitBoard();
  setTimeout(() => {
    const pz = generatePuzzle(rows, cols, genOpts);
    targetRow = pz.rowCounts;
    targetCol = pz.colCounts;

    curRow = Array(rows).fill(0);
    curCol = Array(cols).fill(0);
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    path = [];

    player = { x: 0, y: 0 };
    markVisit(0, 0);

    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);

    // ★BGM開始
    startBGM();
    updateBgmButton();

    draw();
  }, 0);
}
function updateTimer() {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  timerEl.textContent = `Time: ${elapsed}s`;
}

/* 入力初期化 */
initInput({
  tryMove: (dx, dy) => attemptMove(dx, dy),
  undo:    () => { const ok = undoStep(); if (ok) sfxUndo(); }
});

/* 移動処理 */
function attemptMove(dx, dy) {
  const nx = player.x + dx, ny = player.y + dy;

  if (path.length >= 2) {
    const [bx, by] = path[path.length - 2];
    if (nx === bx && ny === by) { undoStep(); sfxUndo(); draw(); return true; }
  }
  if (nx < 0 || nx >= cols || ny < 0 || ny >= rows)  { sfxBlock(); return false; }
  if (visited[ny][nx])                                { sfxBlock(); return false; }
  if (curRow[ny] + 1 > targetRow[ny])                 { sfxBlock(); return false; }
  if (curCol[nx] + 1 > targetCol[nx])                 { sfxBlock(); return false; }

  markVisit(nx, ny);
  sfxMove();
  draw();
  checkWin();
  return true;
}

function markVisit(x, y) {
  visited[y][x] = true;
  curRow[y] += 1;
  curCol[x] += 1;
  player.x = x; player.y = y;
  path.push([x, y]);
}

function undoStep() {
  if (path.length <= 1) return false;
  const [x, y] = path.pop();
  visited[y][x] = false;
  curRow[y] -= 1;
  curCol[x] -= 1;
  const [px, py] = path[path.length - 1];
  player.x = px; player.y = py;
  return true;
}

function resetPath() {
  curRow.fill(0);
  curCol.fill(0);
  for (let y = 0; y < rows; y++) visited[y].fill(false);
  path = [];
  markVisit(0, 0);
}

/* 描画 */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const [px, py] = gridToXY(x, y);
      ctx.fillStyle = visited[y][x] ? '#cfe3ff' : '#ffffff';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = '#39424e';
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    }
  }

  drawBadge(0, 0, '#2e7d32', 'S');
  drawBadge(cols - 1, rows - 1, '#ef6c00', 'G');

  let rowPx = Math.max(12, Math.floor(TILE * 0.34));
  ctx.font = `${rowPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (let y = 0; y < rows; y++) {
    const cur = curRow[y], tar = targetRow[y];
    ctx.fillStyle = cur > tar ? '#d32f2f' : (cur === tar ? '#1b5e20' : '#222');
    ctx.fillText(`${cur}/${tar}`, OFFX() - 6, OFFY() + y * TILE + TILE / 2);
  }

  ctx.textAlign = 'center';
  for (let x = 0; x < cols; x++) {
    const cur = curCol[x], tar = targetCol[x];
    const text = `${cur}/${tar}`;
    let px = Math.max(10, Math.floor(TILE * 0.34));
    ctx.font = `${px}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    while (ctx.measureText(text).width > (TILE - 6) && px > 9) {
      px -= 1; ctx.font = `${px}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    }
    ctx.fillStyle = cur > tar ? '#d32f2f' : (cur === tar ? '#1b5e20' : '#444');
    const yTop = OFFY() - Math.max(12, Math.floor(px * 0.45));
    ctx.fillText(text, OFFX() + x * TILE + TILE / 2, yTop);
  }

  const [cx, cy] = gridToXY(player.x, player.y);
  if (playerImg.complete && playerImg.naturalWidth > 0) {
    const pad = Math.floor(TILE * 0.08);
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(playerImg, cx + pad, cy + pad, TILE - pad*2, TILE - pad*2);
    ctx.imageSmoothingEnabled = prev;
  } else {
    ctx.fillStyle = 'crimson';
    ctx.beginPath();
    ctx.arc(cx + TILE/2, cy + TILE/2, TILE/3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBadge(x, y, bg, text) {
  const [px, py] = gridToXY(x, y);
  const w = Math.max(18, Math.floor(TILE * 0.45));
  ctx.fillStyle = bg;
  ctx.fillRect(px + 4, py + 4, w, w);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(10, Math.floor(TILE * 0.32))}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText(text, px + 4 + w/2, py + 4 + w/2);
}

/* クリア判定 */
function checkWin() {
  const atGoal = (player.x === cols - 1 && player.y === rows - 1);
  if (!atGoal) return;

  const sumVisited = path.length;
  const sumTarget = targetRow.reduce((a,b)=>a+b,0);
  if (sumVisited !== sumTarget) return;

  for (let y = 0; y < rows; y++) if (curRow[y] !== targetRow[y]) return;
  for (let x = 0; x < cols; x++) if (curCol[x] !== targetCol[x]) return;

  clearInterval(timerInterval);
  stopBGM(); updateBgmButton();     // ★ クリアでフェードアウト
  sfxGoal();
  setTimeout(() => alert(`クリア！ Time: ${((Date.now() - startTime) / 1000).toFixed(1)}秒`), 100);
}

/* リサイズ */
window.addEventListener('resize', () => { fitBoard(); draw(); });
