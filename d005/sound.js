// sound.js
let ctx;
function audio(){ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
export async function unlockAudio(){ try{ await audio().resume(); }catch(_){} }

// ---- SFX（既存） ----
function beep(freq=440, ms=80, vol=0.08, type='square'){
  const ac=audio(); const t0=ac.currentTime;
  const o=ac.createOscillator(), g=ac.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t0);
  g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+ms/1000);
  o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0+ms/1000+0.02);
}
export function sfxMove(){  beep(520,60,0.06,'square'); }
export function sfxBlock(){ beep(180,90,0.10,'sawtooth'); }
export function sfxClick(){ beep(800,40,0.05,'triangle'); }
export function sfxUndo(){  beep(300,60,0.05,'triangle'); }
export function sfxGoal(){
  const ac=audio(); const t0=ac.currentTime;
  const seq=[{f:659,d:.10,v:.08},{f:784,d:.12,v:.09},{f:987,d:.20,v:.10}];
  let t=t0;
  seq.forEach(({f,d,v})=>{
    const o=ac.createOscillator(), g=ac.createGain();
    o.type='square'; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t+d+0.02);
    t+=d*0.9;
  });
}

// ---- BGM（生成音：軽いパッド + ゆっくりLFO） ----
let _bgm = { playing:false };

export function startBGM(vol=0.045){
  const ac=audio();
  stopBGM(true); // すでに鳴っていたら即停止

  const g=ac.createGain(); g.gain.setValueAtTime(0, ac.currentTime);
  const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1200; f.Q.value=0.0001;

  // Gメジャーっぽい穏やかな和音
  const o1=ac.createOscillator(); o1.type='triangle'; o1.frequency.value=196.00;  // G3
  const o2=ac.createOscillator(); o2.type='sine';     o2.frequency.value=246.94;  // B3
  const o3=ac.createOscillator(); o3.type='sine';     o3.frequency.value=293.66;  // D4

  // ゆっくり開閉するLFOでフィルターをモジュレーション
  const lfo=ac.createOscillator(); lfo.frequency.value=0.12;
  const lfoGain=ac.createGain(); lfoGain.gain.value=220;
  lfo.connect(lfoGain).connect(f.frequency);

  o1.connect(f); o2.connect(f); o3.connect(f);
  f.connect(g).connect(ac.destination);

  const t=ac.currentTime;
  [o1,o2,o3,lfo].forEach(o=>o.start(t));
  g.gain.linearRampToValueAtTime(vol, t+1.2); // フェードイン

  _bgm = { g,f,o1,o2,o3,lfo,lfoGain, playing:true };
}

export function stopBGM(immediate=false){
  if(!_bgm.playing) return;
  const ac=audio(); const t=ac.currentTime;
  const g=_bgm.g;
  if(immediate){
    try{_bgm.o1.stop();_bgm.o2.stop();_bgm.o3.stop();_bgm.lfo.stop();}catch(_){}
    _bgm.playing=false; return;
  }
  g.gain.cancelScheduledValues(t);
  g.gain.linearRampToValueAtTime(0, t+0.6);   // フェードアウト
  setTimeout(()=>{
    try{_bgm.o1.stop();}catch(_){}
    try{_bgm.o2.stop();}catch(_){}
    try{_bgm.o3.stop();}catch(_){}
    try{_bgm.lfo.stop();}catch(_){}
    _bgm.playing=false;
  }, 700);
}

export function toggleBGM(){ const on = !_bgm.playing; if(on) startBGM(); else stopBGM(); return on; }
export function isBgmPlaying(){ return !!_bgm.playing; }

