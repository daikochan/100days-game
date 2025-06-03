const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

export const boardSize = 15;
export const cellSize = canvas.width / boardSize;
export let board = [];

export function initBoard() {
  canvas.addEventListener('click', handleClick); // マスクリック対応
  resetBoard(); // 初期盤面
  drawBoard();
}

// 盤面の状態を初期化
export function resetBoard() {
  board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null)
  );
  drawBoard();
}

// 盤面の罫線を描く
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < boardSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize + cellSize / 2, cellSize / 2);
    ctx.lineTo(i * cellSize + cellSize / 2, canvas.height - cellSize / 2);
    ctx.moveTo(cellSize / 2, i * cellSize + cellSize / 2);
    ctx.lineTo(canvas.width - cellSize / 2, i * cellSize + cellSize / 2);
    ctx.strokeStyle = '#333';
    ctx.stroke();
  }
}

function handleClick(event) {
  event.preventDefault(); // スクロール防止

  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor((clientX - rect.left) * scaleX / cellSize);
  const y = Math.floor((clientY - rect.top) * scaleY / cellSize);

  if (window.handlePlayerMove) {
    window.handlePlayerMove(x, y);
  }
}


// 石を盤面に描画
export function drawStone(x, y, color) {
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize * 0.4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
}
