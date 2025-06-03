// 画面（scene）の表示切り替えを担当するモジュール

export function showScene(id) {
  // すべての画面を非表示にしてから
  document.querySelectorAll('.scene').forEach(scene => {
    scene.classList.remove('active');
  });

  // 指定された画面だけ表示する
  document.getElementById(id).classList.add('active');
}
