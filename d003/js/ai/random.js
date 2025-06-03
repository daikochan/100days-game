// 難易度：かんたん（シンプルな評価式・初心者でも勝てる）

export function decideMove(board) {
  const size = board.length;
  let bestMove = null;
  let bestScore = -Infinity;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === null) {
        // 自分の連結数（軽く評価）だけ見る
        const score = countConnected(board, x, y, 'red') * 1.0 +
                      countConnected(board, x, y, 'black') * 0.5;

        // 20%の確率で少し悪い手も選ばせる（ミスっぽくする）
        const noise = Math.random() < 0.2 ? -Math.random() * 10 : 0;

        if (score + noise > bestScore) {
          bestScore = score + noise;
          bestMove = [x, y];
        }
      }
    }
  }

  return bestMove || [Math.floor(size / 2), Math.floor(size / 2)];
}

// 周囲の連結数だけを数える（簡易評価）
function countConnected(board, x, y, color) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  let count = 0;

  for (const [dx, dy] of directions) {
    for (let dir of [-1, 1]) {
      const nx = x + dx * dir;
      const ny = y + dy * dir;
      if (
        nx >= 0 && ny >= 0 &&
        nx < board.length && ny < board.length &&
        board[ny][nx] === color
      ) {
        count++;
      }
    }
  }

  return count;
}

