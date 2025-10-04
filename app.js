const BASE = 10; // base bet per number
const PROG = [1, 1, 2, 3]; // multipliers per step

function buildProgression(sliceName){
  const tbody = document.getElementById("progTable");
  tbody.innerHTML = "";
  PROG.forEach((mult, i) => {
    const perNumber = BASE * mult;
    const total = perNumber * 6;
    const net = 30 * perNumber;
    const row = `<tr>
      <td>${i+1}</td>
      <td>$${total}</td>
      <td>+$${net}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
  document.getElementById("progTitle").textContent = `Progression – Slice ${sliceName}`;
}

function showProgression(slice){
  document.querySelector("main").style.display = "none";
  document.getElementById("progressionPage").style.display = "block";
  buildProgression(slice);
}

document.getElementById("backBtn").addEventListener("click", ()=>{
  document.querySelector("main").style.display = "block";
  document.getElementById("progressionPage").style.display = "none";
});


const slices = {
  A: [2, 14, 35, 23, 4, 16],
  B: [28, 9, 26, 30, 11, 7],
  C: [20, 32, 17, 5, 22, 34],
  D: [15, 3, 24, 36, 13, 1],
  E: [27, 10, 25, 29, 12, 8],
  F: [19, 31, 18, 6, 21, 33],
};

const miss = { A:0, B:0, C:0, D:0, E:0, F:0 };
const resetOnZeroEl = document.getElementById('resetOnZero');

function byNumber(n){
  if (n === "00") return 37;
  return Number(n);
}
function sliceOf(num) {
  if (num === 0 || num === 37) return null;
  for (const [k, arr] of Object.entries(slices)) {
    if (arr.includes(num)) return k;
  }
  return null;
}

for (const [key, arr] of Object.entries(slices)){
  document.getElementById('nums'+key).textContent = arr.join(', ');
}
const card = document.querySelector(`.slice-card[data-slice="${key}"]`);
card.addEventListener("click", ()=> showProgression(key));


const grid = document.querySelector('.grid');
for (let i=1;i<=36;i++){
  const b = document.createElement('button');
  b.className = 'num';
  b.dataset.num = String(i);
  b.textContent = String(i);
  grid.appendChild(b);
}

function updateStyles(){
  const entries = Object.entries(miss);
  const maxMiss = Math.max(...entries.map(e=>e[1]));
  entries.forEach(([k,v])=>{
    const card = document.querySelector(`.slice-card[data-slice="${k}"]`);
    card.classList.remove('hot','iron');
    if (v >= 24) card.classList.add('iron');
    else if (v >= 18) card.classList.add('hot');
    document.getElementById('miss'+k).textContent = v;
    const mirrored = Math.max(0, 30 - v);
    document.getElementById('bid'+k).textContent = mirrored === 0 ? '—' : 'B'+mirrored;
  });
  entries.forEach(([k,v])=>{
    const card = document.querySelector(`.slice-card[data-slice="${k}"]`);
    card.style.outline = (v === maxMiss && v>0) ? '2px solid #777' : 'none';
  });
}

function spin(num){
  const zeroReset = resetOnZeroEl.checked;
  if ((num === 0 || num === 37) && zeroReset){
    Object.keys(miss).forEach(k=>miss[k]=0);
    updateStyles();
    return;
  }
  const hitSlice = sliceOf(num);
  for (const k of Object.keys(miss)){
    if (k === hitSlice) miss[k] = 0;
    else miss[k] += 1;
  }
  updateStyles();
}

document.body.addEventListener('click', (e)=>{
  const btn = e.target.closest('.num');
  if (!btn) return;
  const raw = btn.dataset.num;
  const n = byNumber(raw);
  spin(n);
});

document.getElementById('resetAll').addEventListener('click', ()=>{
  Object.keys(miss).forEach(k=>miss[k]=0);
  updateStyles();
});

updateStyles();
