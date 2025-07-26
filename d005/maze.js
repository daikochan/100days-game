// maze.js
const DIFF = {
  easy:   { rows: 6,  cols: 7,  minLenRatio: 0.40,
            minRowOnes: 1, maxRowOnes: 5, minColOnes: 1, maxColOnes: 5,
            minRowTwos: 1,               minColTwos: 1,
            attempts: 200 },
  normal: { rows: 8,  cols: 9,  minLenRatio: 0.52,
            minRowOnes: 2, maxRowOnes: 4, minColOnes: 2, maxColOnes: 4,
            minRowTwos: 2,               minColTwos: 2,
            attempts: 300 },
  hard:   { rows: 10, cols: 11, minLenRatio: 0.60,
            minRowOnes: 1, maxRowOnes: 3, minColOnes: 1, maxColOnes: 3,
            minRowTwos: 2,               minColTwos: 2,
            attempts: 500 },
  extreme:{ rows: 12, cols: 13, minLenRatio: 0.66,
            minRowOnes: 0, maxRowOnes: 1, minColOnes: 0, maxColOnes: 1,
            minRowTwos: 1,               minColTwos: 1,
            attempts: 600 },
};
export function getMazeByDifficulty(level) { return DIFF[level] ?? DIFF.easy; }

export function generatePuzzle(rows, cols, opts = {}) {
  const {
    minLenRatio = 0.5, attempts = 300,
    minRowOnes = 0, maxRowOnes = Infinity,
    minColOnes = 0, maxColOnes = Infinity,
    minRowTwos = 0, maxRowTwos = Infinity,
    minColTwos = 0, maxColTwos = Infinity,
  } = opts;

  const total = rows * cols;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const ok = (x,y)=>x>=0&&x<cols&&y>=0&&y<rows;

  function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]];} return a; }

  function buildPath(){
    const vis = Array.from({length:rows},()=>Array(cols).fill(false));
    const par = new Array(rows*cols).fill(-1);
    const st=[[0,0]]; vis[0][0]=true;
    while(st.length){
      const [x,y]=st.pop();
      const ns=[];
      for(const [dx,dy] of dirs){ const nx=x+dx, ny=y+dy; if(ok(nx,ny)&&!vis[ny][nx]) ns.push([nx,ny]); }
      shuffle(ns);
      for(const [nx,ny] of ns){ vis[ny][nx]=true; par[ny*cols+nx]=y*cols+x; st.push([nx,ny]); }
    }
    const p=[]; let x=cols-1, y=rows-1; p.push([x,y]);
    let guard=rows*cols+5;
    while(!(x===0&&y===0)&&guard-- >0){ const t=par[y*cols+x]; if(t<0)break; x=t%cols; y=(t/cols)|0; p.push([x,y]); }
    p.reverse(); return p;
  }

  function counts(path){
    const r = Array(rows).fill(0), c = Array(cols).fill(0);
    for(const [x,y] of path){ r[y]++; c[x]++; }
    return { rowCounts:r, colCounts:c };
  }

  function score(R,C,len){
    const r1=R.filter(v=>v===1).length, c1=C.filter(v=>v===1).length;
    const r2=R.filter(v=>v===2).length, c2=C.filter(v=>v===2).length;
    const need = Math.floor(minLenRatio*total);
    let s = len>=need ? 0 : 2+Math.ceil((need-len)/5);
    s += Math.max(0,minRowOnes-r1)+Math.max(0,r1-maxRowOnes);
    s += Math.max(0,minColOnes-c1)+Math.max(0,c1-maxColOnes);
    s += Math.max(0,minRowTwos-r2)+Math.max(0,r2-maxRowTwos);
    s += Math.max(0,minColTwos-c2)+Math.max(0,c2-maxColTwos);
    return s;
  }

  let best=null;
  for(let t=0;t<attempts;t++){
    const path=buildPath();
    const {rowCounts, colCounts}=counts(path);
    const s = score(rowCounts, colCounts, path.length);
    if(s===0) return { rowCounts, colCounts, solutionPath:path };
    if(!best || s<best.s) best={s,rowCounts,colCounts,solutionPath:path};
  }
  console.warn('条件未達のため最良候補を採用:', best);
  return { rowCounts: best.rowCounts, colCounts: best.colCounts, solutionPath: best.solutionPath };
}
