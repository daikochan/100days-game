// scene.js

// 各シーンの要素取得
const startScene = document.getElementById("startScene");
const gameScene = document.getElementById("gameScene");
const resultScene = document.getElementById("resultScene");

// 背景切り替え用のクラスもbodyに操作
const body = document.body;

// 現在のシーンを記録
let currentScene = null;

/**
 * シーンを切り替える関数
 * @param {string} sceneName - "start", "game", "result" のいずれか
 */
function changeScene(sceneName) {
  // 全シーン非表示
  [startScene, gameScene, resultScene].forEach(scene => scene.classList.remove("active"));

  // 背景切り替え
  body.classList.remove("start-bg", "game-bg");

  // 対象シーン表示＆背景設定
  if (sceneName === "start") {
    startScene.classList.add("active");
    body.classList.add("start-bg");
  } else if (sceneName === "game") {
    gameScene.classList.add("active");
    body.classList.add("game-bg");
  } else if (sceneName === "result") {
    resultScene.classList.add("active");
    body.classList.add("start-bg");  // リザルト画面もスタートと同じ背景で統一
  }

  currentScene = sceneName;
}

/**
 * 現在のシーンを取得（デバッグ・確認用）
 */
function getCurrentScene() {
  return currentScene;
}
