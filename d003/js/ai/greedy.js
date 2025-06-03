// 難易度：むずかしい（評価＋両端空き＋勝ち筋強化）

export function decideMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;
  const size = board.length;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === null) {
        const attack = evaluateMove(board, x, y, 'red');
        const defend = evaluateMove(board, x, y, 'black');
        const score = attack * 1.2 + defend * 1.1;
        if (score > bestScore) {
          bestScore = score;
          bestMove = [x, y];
        }
      }
    }
  }

  return bestMove || [0, 0];
}

function evaluateMove(board, x, y, color) {
  let score = 0;
  score += getDirectionalScore(board, x, y, color, true);  // 両端空き考慮
  return score;
}

function getDirectionalScore(board, x, y, color, considerOpenEnds = false) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  let total = 0;

  for (let [dx, dy] of directions) {
    let count = 1;
    let openEnds = 0;

    for (let dir of [-1, 1]) {
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i * dir;
        const ny = y + dy * i * dir;
        if (nx < 0 || ny < 0 || nx >= board.length || ny >= board.length) break;
        if (board[ny][nx] === color) {
          count++;
        } else if (board[ny][nx] === null) {
          openEnds++;
          break;
        } else {
          break;
        }
      }
    }

    // 強化スコア（活路2を高評価）
    if (count >= 5) total += 2000;
    else if (count === 4 && openEnds === 2) total += 600;
    else if (count === 4 && openEnds === 1) total += 300;
    else if (count === 3 && openEnds === 2) total += 150;
    else if (count === 3 && openEnds === 1) total += 60;
    else if (count === 2 && openEnds === 2) total += 40;
    else if (count === 2 && openEnds === 1) total += 20;
  }

  return total;
}

