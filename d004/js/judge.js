// judge.js

const redSuccessBombs = [];
const blueSuccessBombs = [];

function checkDrop(bomb) {
  const x = bomb.x;
  const y = bomb.y;

  const zoneTop = 0;
  const zoneBottom = canvas.height * 0.4;
  const zoneMid = canvas.width / 2;
  const extendedMargin = 30; // 中央から±30px許容
  
  const inRedZone = (x < zoneMid) && (y < canvas.height / 2);  // 左上1/4
  const inBlueZone = (x >= zoneMid) && (y < canvas.height / 2); // 右上1/4


  if (bomb.color === "red" && inRedZone) {
    placeInZone(bomb, redSuccessBombs, 0.25 * canvas.width);
  } else if (bomb.color === "blue" && inBlueZone) {
    placeInZone(bomb, blueSuccessBombs, 0.75 * canvas.width);
  } else if (inRedZone || inBlueZone) {
    // ❌ 間違った色を置いた → 即爆発
    bomb.explode();
  }
}

function placeInZone(bomb, zoneList, centerX) {
  bomb.held = false;
  bomb.vx = 0;
  bomb.vy = 0;
  bomb.safe = true; // ✅ 成功ゾーンでは爆発しない
  bomb.scale = 0.6; // ✅ 縮小表示

  const index = zoneList.length;
  const totalHeight = canvas.height * 0.4;
  const spacing = totalHeight / 10;
  // X座標を交互に左右にずらす（2列）
  const offsetX = (index % 2 === 0) ? -20 : 20;
  bomb.x = centerX + offsetX;
  bomb.y = canvas.height * 0.4 - (index + 0.5) * spacing;

  zoneList.push(bomb);
  window.addScore();

  if (zoneList.length >= 10) {
    zoneList.forEach(b => {
      const index = bombList.indexOf(b);
      if (index !== -1) {
        bombList.splice(index, 1); // ✅ 完全削除！
      }
    });
    zoneList.length = 0; // 成功ゾーンをリセット
    playSE("reset");
  }

}

window.checkDrop = checkDrop;
