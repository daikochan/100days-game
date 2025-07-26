// input.js
import { unlockAudio, sfxClick, sfxBlock } from './sound.js';

export function initInput({ tryMove, undo }) {
  // 初回タップでAudioContextを解錠
  const unlock = () => { unlockAudio(); document.removeEventListener('pointerdown', unlock); };
  document.addEventListener('pointerdown', unlock, { once: true });

  // キー入力（PC）
  document.addEventListener('keydown', (e) => {
    let handled = true;
    if (e.key === 'ArrowUp')         handled = !(!tryMove(0,-1));
    else if (e.key === 'ArrowDown')  handled = !(!tryMove(0, 1));
    else if (e.key === 'ArrowLeft')  handled = !(!tryMove(-1,0));
    else if (e.key === 'ArrowRight') handled = !(!tryMove(1, 0));
    else if (e.key === 'Backspace')  { undo(); sfxClick(); }
    else handled = false;
    if (handled) e.preventDefault();
  });

  // Dパッド
  const pad = document.getElementById('dpad');
  if (!pad) return;

  const dirMap = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  let timer = null;

  const step  = (dx,dy)=>{ const ok=tryMove(dx,dy); if(!ok) sfxBlock(); };
  const start = (dx,dy)=>{ step(dx,dy); timer=setInterval(()=>step(dx,dy),140); };
  const stop  = ()=>{ if(timer){ clearInterval(timer); timer=null; } };

  const startHandler = (e) => {
    const dir = e.currentTarget.getAttribute('data-dir');
    const [dx,dy]=dirMap[dir];
    start(dx,dy); sfxClick(); e.preventDefault();
  };

  // 既存の各ボタン
  pad.querySelectorAll('.key').forEach(btn=>{
    btn.addEventListener('mousedown', startHandler);
    btn.addEventListener('touchstart', startHandler, { passive:false });
  });

  // ★パッド全体での入力（ボタン以外の余白も反応させる）
  function dirFromPadPos(clientX, clientY){
    const r = pad.getBoundingClientRect();
    const x = (clientX - r.left) / r.width - 0.5;
    const y = (clientY - r.top)  / r.height - 0.5;
    // どちらに近いかで決定
    if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
    return y < 0 ? 'up' : 'down';
  }
  function startFromEvent(ev){
    const t = ('touches' in ev) ? ev.touches[0] : ev;
    const dir = dirFromPadPos(t.clientX, t.clientY);
    const [dx,dy] = dirMap[dir];
    start(dx,dy); sfxClick();
  }
  pad.addEventListener('mousedown', (e)=> {
    if (!e.target.classList.contains('key')) { startFromEvent(e); e.preventDefault(); }
  });
  pad.addEventListener('touchstart', (e)=> {
    if (!e.target.classList.contains('key')) { startFromEvent(e); e.preventDefault(); }
  }, { passive:false });

  // 停止イベントをグローバルで
  window.addEventListener('mouseup', stop);
  window.addEventListener('touchend', stop);
  window.addEventListener('touchcancel', stop);
  window.addEventListener('blur', stop);
}

/* 背景スクロール完全無効（iOS含む） */
document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive:false });

/* 100vhハック */
function setVh(){ document.documentElement.style.setProperty('--vh', `${window.innerHeight*0.01}px`); }
setVh(); window.addEventListener('resize', setVh);
