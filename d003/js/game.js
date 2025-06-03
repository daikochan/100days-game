import { board, drawStone, boardSize } from './board.js';
import { showScene } from './scene.js';
import { playSE } from './audio.js';
import { showMessage } from './ui.js';

let currentTurn = 'player'; // プレイヤーかCPUか
let gameOver = false;
let ai = null; // AI関数（decideMove）を代入

export function initGame() {
  // プレイヤーの操作をグローバル関数として登録
  window.handlePlayerMove = handlePlayerMove;
}

// 難易度に応じたAI関数を読み込んで準備
export async function startGameWithAI(level) {
  const aiModule = await import(`./ai/${level}.js`);
  ai = aiModule.decideMove; // ← ここを修正：関数だけ代入
  currentTurn = 'player';
  gameOver = false;
  showMessage("あなたの番です");
}

// プレイヤーが石を置いたときに呼ばれる関数
function handlePlayerMove(x, y) {
  if (gameOver || currentTurn !== 'player') return;
  if (!isValidMove(x, y)) return;

  placeStone(x, y, 'black');  // プレイヤーの石
  playSE('put');

  if (checkWin(x, y, 'black')) {
    endGame('あなたの勝ち！');
    playSE('win');
    return;
  }

  currentTurn = 'cpu';
  showMessage("CPUの思考中...");

  // 少し遅らせてCPUの手を実行（思考風演出）
  setTimeout(() => {
    const [aiX, aiY] = ai(board); // ← 関数として実行
    placeStone(aiX, aiY, 'red');  // CPUの石
    playSE('put');

    if (checkWin(aiX, aiY, 'red')) {
      endGame('CPUの勝ち！');
      playSE('lose');
      return;
    }

    currentTurn = 'player';
    showMessage("あなたの番です");
  }, 300);
}

// 石を置いて描画
function placeStone(x, y, color) {
  board[y][x] = color;
  drawStone(x, y, color);
}

// 空きマスかどうか判定
function isValidMove(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize && board[y][x] === null;
}

// 勝利判定（縦横斜め）
function checkWin(x, y, color) {
  return (
    countLine(x, y, 1, 0, color) + countLine(x, y, -1, 0, color) >= 4 ||
    countLine(x, y, 0, 1, color) + countLine(x, y, 0, -1, color) >= 4 ||
    countLine(x, y, 1, 1, color) + countLine(x, y, -1, -1, color) >= 4 ||
    countLine(x, y, 1, -1, color) + countLine(x, y, -1, 1, color) >= 4
  );
}

// 1方向に何個並んでいるか数える
function countLine(x, y, dx, dy, color) {
  let count = 0;
  for (let i = 1; i < 5; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize) break;
    if (board[ny][nx] !== color) break;
    count++;
  }
  return count;
}

function endGame(message) {
  gameOver = true;
  document.getElementById('result-text').textContent = message;

  const commentElement = document.getElementById('result-comment');

  if (message.includes('あなたの勝ち')) {
    commentElement.textContent = '勝利！あなたの読みが冴えわたっています！';
  } else if (message.includes('CPUの勝ち')) {
    commentElement.textContent = '負けても大丈夫！次はもっと良い勝負ができそう！';
  } else {
    commentElement.textContent = '';
  }

  showScene('scene-result');
}
