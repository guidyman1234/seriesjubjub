const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

let appData = {};

async function fetchData() {
  const res = await fetch(API_URL);
  appData = await res.json();
  return appData;
}

function formatMoney(num) {
  return "฿" + num.toLocaleString();
}

/* =========================
   Navigation
========================= */
function goHome() { window.location.href = "index.html"; }
function goFund() { window.location.href = "fund.html"; }
function goAnalytics() { window.location.href = "analytics.html"; }
function goTransactionsAll() { window.location.href = "transactions.html"; }

/* =========================
   Render Home
========================= */
async function initHome() {
  await fetchData();
  document.getElementById("cumulative-balance").textContent = formatMoney(appData.cumulative.currentBalance);
  document.getElementById("monthly-income").textContent = formatMoney(appData.monthly.income);
  document.getElementById("monthly-expense").textContent = formatMoney(appData.monthly.expense);
  document.getElementById("monthly-balance").textContent = formatMoney(appData.monthly.balance);

  const container = document.getElementById("transaction-list");
  container.innerHTML = "";
  appData.monthly.list.slice(0,30).forEach(tx=>{
    container.innerHTML += `<div class="tx">
      <span class="tx-date">${tx.date}</span> | 
      <span class="tx-cat">${tx.category}</span>: 
      <span class="tx-desc">${tx.description}</span> 
      <span class="tx-amt">${formatMoney(tx.amount)}</span>
    </div>`;
  });
}

/* =========================
   Render Transactions Page
========================= */
async function initTransactions() {
  await fetchData();
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  const container = document.getElementById("all-transaction-list");

  const years = [...new Set(appData.monthly.list.map(t=>new Date(t.date).getFullYear()))];
  years.forEach(y=>{
    const opt = document.createElement("option"); opt.value=y; opt.text=y; yearSelect.add(opt);
  });

  const months = [...Array(12).keys()].map(m=>m+1);
  months.forEach(m=>{
    const opt = document.createElement("option"); opt.value=m; opt.text=m; monthSelect.add(opt);
  });

  renderTransactions(container, appData.monthly.list);
}

function renderTransactions(container, list) {
  container.innerHTML = "";
  list.forEach(tx=>{
    container.innerHTML += `<div class="tx">
      <span class="tx-date">${tx.date}</span> | 
      <span class="tx-cat">${tx.category}</span>: 
      <span class="tx-desc">${tx.description}</span> 
      <span class="tx-amt">${formatMoney(tx.amount)}</span>
    </div>`;
  });
}

/* =========================
   Render Fund
========================= */
async function initFund() {
  await fetchData();
  document.getElementById("fund-saved").textContent = formatMoney(appData.current.balance);
  document.getElementById("fund-goal").textContent = formatMoney(50000);
  document.getElementById("fund-progress").value = appData.current.balance;
}

/* =========================
   Render Analytics
========================= */
async function initAnalytics() {
  await fetchData();
  const ctx = document.getElementById("analytics-chart").getContext("2d");
  const labels = Object.keys(appData.analytics.daily);
  const data = Object.values(appData.analytics.daily);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Daily Amount",
        data,
        backgroundColor: "rgba(54,162,235,0.5)"
      }]
    },
    options: { responsive:true, maintainAspectRatio:false }
  });
}
