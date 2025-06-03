// UIに関する処理（主にゲーム中の情報表示）

const messageBox = document.getElementById('in-game-message');

export function showMessage(text) {
  messageBox.textContent = text;
}

export function clearMessage() {
  messageBox.textContent = '';
}
