const API_URL = 'https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec'; // ใส่ลิงค์ Apps Script ของคุณ

function formatCurrency(num){ return '฿'+num.toLocaleString(); }

async function fetchData(){ 
  const res = await fetch(API_URL); 
  return await res.json(); 
}

// --- Home ---
async function initHome(){
  const data = await fetchData();
  document.getElementById('cumulative-balance').innerText=formatCurrency(data.cumulative.currentBalance);
  document.getElementById('monthly-income').innerText=formatCurrency(data.current.income);
  document.getElementById('monthly-expense').innerText=formatCurrency(data.current.expense);
  document.getElementById('monthly-balance').innerText=formatCurrency(data.current.balance);

  const container = document.getElementById('transaction-list');
  container.innerHTML='';
  data.monthly.list.slice(0,30).forEach(t=>{
    const div=document.createElement('div'); div.className='transaction-item';
    div.innerHTML=`<div class="transaction-info">${t.date} | ${t.category} | ${t.description}</div><div class="transaction-amount">${formatCurrency(t.amount)}</div>`;
    container.appendChild(div);
  });
}

// --- Modal ---
async function showTransactionsAll(){
  document.getElementById('transactions-modal').style.display='block';
  await initTransactions();
}
function closeTransactionsModal(){ document.getElementById('transactions-modal').style.display='none'; }

async function initTransactions(){
  const data = await fetchData();
  const container = document.getElementById('all-transaction-list');
  container.innerHTML='';
  data.monthly.list.forEach(t=>{
    const div=document.createElement('div'); div.className='transaction-item';
    div.innerHTML=`<div class="transaction-info">${t.date} | ${t.category} | ${t.description}</div><div class="transaction-amount">${formatCurrency(t.amount)}</div>`;
    container.appendChild(div);
  });
}

// --- Navigation ---
document.getElementById('home-btn').onclick=initHome;
document.getElementById('fund-btn').onclick=()=>alert('Fund / Goal page placeholder');
document.getElementById('analytics-btn').onclick=()=>alert('Analytics page placeholder');
document.getElementById('view-all-btn').onclick=showTransactionsAll;
document.getElementById('close-modal-btn').onclick=closeTransactionsModal;

// --- INIT ---
initHome();
