// ----- Ladder & global state -----
const LADDER = [[1, 6, 6, 30], [2, 12, 18, 54], [2, 12, 30, 42], [2, 12, 42, 30], [3, 18, 60, 48], [3, 18, 78, 30], [4, 24, 102, 42], [5, 30, 132, 48], [6, 36, 168, 48], [7, 42, 210, 42], [8, 48, 258, 30], [10, 60, 318, 42], [12, 72, 390, 42], [14, 84, 474, 30], [17, 102, 576, 36], [21, 126, 702, 54], [25, 150, 852, 48], [30, 180, 1032, 48], [36, 216, 1248, 48], [43, 258, 1506, 42], [52, 312, 1818, 54], [62, 372, 2190, 42], [74, 444, 2634, 30], [89, 534, 3168, 36], [107, 642, 3810, 42], [128, 768, 4578, 30], [154, 924, 5502, 42], [185, 1110, 6612, 48], [222, 1332, 7944, 48], [266, 1596, 9540, 36]]; // [mult, totalUnits, entryUnits, netUnits]
let currentSlice = 'A';
let stepCursor = 0;
let affordableStep = 0; // 0 means none

// ----- Slices / drought tracker -----
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
const entryBadge = document.getElementById('entryBadge');
const baseInput = document.getElementById('baseInput');
const bankInput = document.getElementById('bankInput');

function byNumber(n){ if (n === "00") return 37; return Number(n); }
function sliceOf(num) {
  if (num === 0 || num === 37) return null;
  for (const [k, arr] of Object.entries(slices)) if (arr.includes(num)) return k;
  return null;
}

for (const [key, arr] of Object.entries(slices)){
  const el = document.getElementById('nums'+key);
  if (el) el.textContent = arr.join(', ');
  const card = document.querySelector(`.slice-card[data-slice="${key}"]`);
  if (card) card.addEventListener("click", ()=> showProgression(key));
}

const grid = document.querySelector('.grid');
for (let i=1;i<=36;i++){
  const b = document.createElement('button');
  b.className = 'num';
  b.dataset.num = String(i);
  b.textContent = String(i);
  grid.appendChild(b);
}

function computeAffordableStep(base, bank){
  const affordable = LADDER.findLastIndex(row => row[2]*base <= bank);
  return affordable >= 0 ? (affordable+1) : 0;
}

function updateEntryBadge(){
  const base = parseFloat(localStorage.getItem('basePer')|| baseInput?.value || '10');
  const bank = parseFloat(localStorage.getItem('bankroll')|| bankInput?.value || '0');
  affordableStep = computeAffordableStep(base, bank);
  entryBadge.textContent = 'Entry step: ' + (affordableStep || '—');
}

function updateStyles(){
  updateEntryBadge();
  const entries = Object.entries(miss);
  const maxMiss = Math.max(...entries.map(e=>e[1]));
  entries.forEach(([k,v])=>{
    const card = document.querySelector(`.slice-card[data-slice="${k}"]`);
    if (!card) return;
    card.classList.remove('hot','iron','entry');
    if (v >= 24) card.classList.add('iron');
    else if (v >= 18) card.classList.add('hot');
    const mirrored = Math.max(0, 30 - v);
    document.getElementById('miss'+k).textContent = v;
    document.getElementById('bid'+k).textContent = mirrored === 0 ? '—' : 'B'+mirrored;
    if (affordableStep>0 && mirrored>0 && mirrored <= affordableStep) {
      card.classList.add('entry');
    }
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
    if (k === hitSlice) miss[k] = 0; else miss[k] += 1;
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

// ----- Progression page -----
const progTitle = document.getElementById('progTitle');
const progTable = document.getElementById('progTable');
const sliceNumbers = document.getElementById('sliceNumbers');
const avgNet = document.getElementById('avgNet');

function dollarsFromUnits(units){
  const base = parseFloat(baseInput.value||'10');
  return units*base;
}

function refreshProgTable(sliceKey){
  progTitle.textContent = `Entry Run Progression – Slice ${sliceKey}`;
  sliceNumbers.textContent = 'Slice numbers: ' + slices[sliceKey].join(', ');
  const avgNetUnits = LADDER.reduce((s, r)=> s + r[3], 0)/LADDER.length;
  const avgNetDollars = dollarsFromUnits(avgNetUnits);
  avgNet.textContent = 'Average Net Win $: ' + Math.round(avgNetDollars);
  progTable.innerHTML = '';
  const base = parseFloat(baseInput.value||'10');
  const bank = parseFloat(bankInput.value||'0');
  const maxRow = computeAffordableStep(base, bank);
  LADDER.forEach(([mult, units, entryUnits, netUnits], idx)=>{
    const tr = document.createElement('tr');
    const totalDollars = dollarsFromUnits(units);
    const netDollars = dollarsFromUnits(netUnits);
    const entryDollars = dollarsFromUnits(entryUnits);
    tr.innerHTML = `<td>${idx+1}</td><td>$${entryDollars}</td><td>${mult}</td><td>${units}</td><td>$${totalDollars}</td><td>$${netDollars}</td>`;
    if (idx === stepCursor) tr.style.outline = '2px solid #777';
    if (maxRow>0 && (idx+1)===maxRow) tr.style.background = '#0e1a33';
    progTable.appendChild(tr);
  });
  updateEntryBadge();
}

function showProgression(sliceKey){
  currentSlice = sliceKey;
  stepCursor = 0;
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('progressionPage').style.display = 'block';
  refreshProgTable(sliceKey);
}

document.getElementById('backBtn').addEventListener('click', ()=>{
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('progressionPage').style.display = 'none';
});

document.getElementById('hitBtn').addEventListener('click', ()=>{ stepCursor = 0; refreshProgTable(currentSlice); });
document.getElementById('missBtn').addEventListener('click', ()=>{ if (stepCursor < LADDER.length-1) stepCursor++; else stepCursor=0; refreshProgTable(currentSlice); });

function restorePrefs(){
  const savedBase = localStorage.getItem('basePer');
  const savedBank = localStorage.getItem('bankroll');
  if (savedBase) baseInput.value = savedBase;
  if (savedBank) bankInput.value = savedBank;
}

baseInput.addEventListener('input', ()=>{
  localStorage.setItem('basePer', baseInput.value);
  refreshProgTable(currentSlice);
  updateStyles();
});
bankInput.addEventListener('input', ()=>{
  localStorage.setItem('bankroll', bankInput.value);
  refreshProgTable(currentSlice);
  updateStyles();
});

restorePrefs();
updateStyles();
