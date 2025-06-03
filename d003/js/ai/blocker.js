// 難易度：ふつう（greedyを少し弱く調整）

export function decideMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;
  const size = board.length;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === null) {
        const score = evaluateMove(board, x, y);
        if (score > bestScore) {
          bestScore = score;
          bestMove = [x, y];
        }
      }
    }
  }

  return bestMove || [0, 0];
}

function evaluateMove(board, x, y) {
  let score = 0;
  score += getDirectionalScore(board, x, y, 'red') * 1.0;   // 攻撃（強すぎない）
  score += getDirectionalScore(board, x, y, 'black') * 0.9; // 防御（やや抑制）
  return score;
}

function getDirectionalScore(board, x, y, color) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  let total = 0;

  for (let [dx, dy] of directions) {
    let count = 1;

    for (let dir of [-1, 1]) {
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i * dir;
        const ny = y + dy * i * dir;
        if (nx < 0 || ny < 0 || nx >= board.length || ny >= board.length) break;
        if (board[ny][nx] === color) {
          count++;
        } else {
          break;
        }
      }
    }

    // 点数加算（greedyより低め）
    if (count >= 5) total += 800;
    else if (count === 4) total += 80;
    else if (count === 3) total += 24;
    else if (count === 2) total += 8;
  }

  return total;
}
