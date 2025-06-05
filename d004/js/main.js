// main.js

let score = 0;
let highScore = 0;
let finalScoreElement = null;
let highScoreResultElement = null;


window.addEventListener("DOMContentLoaded", () => {
  // スコア表示要素取得
  const scoreElement = document.getElementById("score");
  const highScoreElement = document.getElementById("highScore");
  finalScoreElement = document.getElementById("finalScore");
  highScoreResultElement = document.getElementById("highScoreResult"); // ✅ 必須

  // ボタン取得
  const startButton = document.getElementById("startButton");
  const retryButton = document.getElementById("retryButton");

  // ローカルストレージからハイスコア取得
  if (localStorage.getItem("bombHighScore")) {
    highScore = parseInt(localStorage.getItem("bombHighScore"));
    highScoreElement.textContent = highScore;
  }

  // スタートボタン
  startButton.addEventListener("click", () => {
    playSE("buttonClick");
    playSE("startAlert");
    changeScene("game");
    playBGM("gameBGM");

    startGame();
  });

  // リトライボタン
  retryButton.addEventListener("click", () => {
    playSE("buttonClick");
    changeScene("start");

    // 成功ゾーンのキャラもリセット
    redSuccessBombs.length = 0;
    blueSuccessBombs.length = 0;

    playBGM("startBGM");
  });

  // ゲーム開始処理
  function startGame() {
    score = 0;
    updateScore();
    startGameLoop(() => {
      // ゲーム終了後の処理
      playSE("result");
      changeScene("result");
      finalScoreElement.textContent = score;
      highScoreResultElement.textContent = highScore; // ✅ 結果画面にも反映

      // ハイスコア更新
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("bombHighScore", highScore);
        highScoreElement.textContent = highScore;
        highScoreResultElement.textContent = highScore; // ✅ ハイスコアも更新
      }

      stopAllBGM();
    });
  }

  window.addScore = function () {
    score++;
    console.log("加算後のスコア:", score); // ✅ 確認用
    updateScore();
  };


  function updateScore() {
    scoreElement.textContent = score;
  }

  // 初期画面設定
  changeScene("start");
  playBGM("startBGM");
});

// ゲーム強制終了（爆発時用）
window.endGame = function () {
  cancelAnimationFrame(gameInterval);
  playSE("result");
  changeScene("result");

  finalScoreElement.textContent = score;
  highScoreResultElement.textContent = highScore; // ✅ 結果画面にも反映

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("bombHighScore", highScore);
    document.getElementById("highScore").textContent = highScore;
    highScoreResultElement.textContent = highScore; // ✅ ハイスコアも更新
  }

  stopAllBGM();
};
