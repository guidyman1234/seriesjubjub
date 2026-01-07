const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";
let appData = null;

// =====================
// FETCH DATA FROM API
// =====================
async function fetchData() {
  if (appData) return appData; // cache
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    appData = data;
    return data;
  } catch (err) {
    console.error("Error fetching API:", err);
    return null;
  }
}

// =====================
// HOME PAGE
// =====================
async function initHome() {
  const data = await fetchData();
  if (!data) return;

  // Cumulative balance
  document.getElementById("cumulative-balance").innerText = `฿${formatNumber(data.cumulative.currentBalance)}`;

  // Monthly summary
  const m = data.monthly;
  document.getElementById("monthly-income").innerText = `฿${formatNumber(m.income)}`;
  document.getElementById("monthly-expense").innerText = `฿${formatNumber(Math.abs(m.expense))}`;
  document.getElementById("monthly-balance").innerText = `฿${formatNumber(m.balance)}`;

  // Transactions list (30 ล่าสุด)
  const listEl = document.getElementById("transaction-list");
  listEl.innerHTML = "";
  const latest = m.list.slice(0,30);
  latest.forEach(t => {
    const div = document.createElement("div");
    div.className = "transaction-item";
    div.innerText = `${t.date} | ${t.amount>0?'+':'-'}${formatNumber(Math.abs(t.amount))} | ${t.category} | ${t.description}`;
    listEl.appendChild(div);
  });
}

// =====================
// TRANSACTIONS PAGE
// =====================
async function initTransactions() {
  const data = await fetchData();
  if (!data) return;

  const allList = data.monthly.list; // ใช้เดือนปัจจุบันเป็น default
  const listEl = document.getElementById("all-transaction-list");
  listEl.innerHTML = "";
  allList.forEach(t => {
    const div = document.createElement("div");
    div.className = "transaction-item";
    div.innerText = `${t.date} | ${t.amount>0?'+':'-'}${formatNumber(Math.abs(t.amount))} | ${t.category} | ${t.description}`;
    listEl.appendChild(div);
  });

  // populate month/year select
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";
  const today = new Date();
  for(let i=1;i<=12;i++){
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = i;
    if(i===today.getMonth()+1) opt.selected = true;
    monthSelect.appendChild(opt);
  }
  for(let y=today.getFullYear(); y>=today.getFullYear()-5; y--){
    const opt = document.createElement("option");
    opt.value = y;
    opt.text = y;
    if(y===today.getFullYear()) opt.selected = true;
    yearSelect.appendChild(opt);
  }
}

// =====================
// FUND PAGE
// =====================
async function initFund() {
  const data = await fetchData();
  if (!data) return;

  // สมมติเอา cumulative balance เป็น fund
  const saved = data.cumulative.currentBalance > 0 ? data.cumulative.currentBalance : 0;
  const goal = 50000; // ตัวอย่าง
  document.getElementById("fund-saved").innerText = `฿${formatNumber(saved)}`;
  document.getElementById("fund-goal").innerText = `฿${formatNumber(goal)}`;
  const progress = document.getElementById("fund-progress");
  progress.value = saved;
  progress.max = goal;
}

// =====================
// ANALYTICS PAGE
// =====================
async function initAnalytics() {
  const data = await fetchData();
  if (!data) return;

  const ctx = document.getElementById('analytics-chart').getContext('2d');
  const period = document.getElementById('analytics-period').value;

  let labels = [];
  let values = [];

  if(period === 'daily'){
    labels = Object.keys(data.analytics.daily);
    values = Object.values(data.analytics.daily);
  } else if(period === 'monthly'){
    // แปลงข้อมูลรายเดือน
    const monthly = {};
    Object.entries(data.analytics.daily).forEach(([date,val])=>{
      const m = date.slice(0,7); // YYYY-MM
      monthly[m] = (monthly[m]||0)+val;
    });
    labels = Object.keys(monthly);
    values = Object.values(monthly);
  }

  if(window.analyticsChart) window.analyticsChart.destroy();
  window.analyticsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false
    }
  });

  // update on change
  document.getElementById('analytics-period').onchange = initAnalytics;
}

// =====================
// HELPER
// =====================
function formatNumber(num){
  return num.toLocaleString('en-US',{maximumFractionDigits:2});
}

// =====================
// NAVIGATION
// =====================
function goHome(){ showPage('home'); }
function goFund(){ showPage('fund'); }
function goAnalytics(){ showPage('analytics'); }
function goTransactionsAll(){ showPage('transactions'); }
