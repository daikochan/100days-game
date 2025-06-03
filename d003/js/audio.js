let bgm = null; // 現在再生中のBGMを管理

// BGMを再生（title / ingame）
export function playBGM(name) {
  stopBGM(); // 既存のBGMがあれば停止
  bgm = new Audio(`assets/bgm/${name}.mp3`);
  bgm.loop = true;
  bgm.volume = 0.5;
  bgm.play();
}

// BGMを停止
export function stopBGM() {
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
    bgm = null;
  }
}

// 効果音を再生（start / put / win / lose）
export function playSE(name) {
  const se = new Audio(`assets/se/${name}.mp3`);
  se.volume = 0.7;
  se.play();
}
