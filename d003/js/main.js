import { initBoard, resetBoard } from './board.js';
import { initGame, startGameWithAI } from './game.js';
import { showScene } from './scene.js';
import { playBGM, stopBGM, playSE } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  initBoard();
  initGame();

  // タイトル→難易度選択
  document.getElementById('start-button').addEventListener('click', () => {
    playBGM('title');
    showScene('scene-select');
  });

  // 難易度選択 → ゲーム開始
  document.querySelectorAll('.difficulty-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      let level = btn.dataset.level;
      if (level === 'easy') level = 'random';
      if (level === 'normal') level = 'blocker';
      if (level === 'hard') level = 'greedy';

      playSE('start');
      stopBGM();
      playBGM('ingame');
      resetBoard();
      startGameWithAI(level);
      showScene('scene-game');
    });
  });

  // リトライ
  document.getElementById('retry-button').addEventListener('click', () => {
    showScene('scene-select');
  });

  // タイトルへ戻る
  document.getElementById('back-button').addEventListener('click', () => {
    stopBGM();
    playBGM('title');
    showScene('scene-title');
  });

  // 難易度選択に戻る（ゲーム中の戻るボタン）
  document.getElementById('back-to-select').addEventListener('click', () => {
    stopBGM();
    playBGM('title');
    showScene('scene-select');
  });
});
