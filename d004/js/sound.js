// sound.js

// 音声ファイルの読み込み・管理
const sounds = {
  startBGM: new Audio('assets/sounds/start_bgm.mp3'),
  gameBGM: new Audio('assets/sounds/game_bgm.mp3'),
  startAlert: new Audio('assets/sounds/start_alert.mp3'),
  buttonClick: new Audio('assets/sounds/button_click.mp3'),
  hold: new Audio('assets/sounds/hold.mp3'),
  release: new Audio('assets/sounds/release.mp3'),
  dropFail: new Audio('assets/sounds/drop_fail.mp3'),
  warningBeep: new Audio('assets/sounds/warning_beep.mp3'),
  alarm: new Audio('assets/sounds/alarm.mp3'),
  explosion: new Audio('assets/sounds/explosion.mp3'),
  result: new Audio('assets/sounds/result.mp3'),
  reset: new Audio('assets/sounds/reset.mp3'),
};

// BGMはループ設定
sounds.startBGM.loop = true;
sounds.gameBGM.loop = true;

/**
 * 効果音を再生（同時再生用にclone）
 * @param {string} name - サウンド名（key）
 */
function playSE(name) {
  if (sounds[name]) {
    const clone = sounds[name].cloneNode();
    clone.play();
  }
}

/**
 * BGMを再生（同じBGMを二重再生しない）
 * @param {string} name - "startBGM" や "gameBGM"
 */
function playBGM(name) {
  stopAllBGM();
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play();
  }
}

/**
 * BGMをすべて停止
 */
function stopAllBGM() {
  ['startBGM', 'gameBGM'].forEach(name => {
    if (sounds[name]) {
      sounds[name].pause();
      sounds[name].currentTime = 0;
    }
  });
}
