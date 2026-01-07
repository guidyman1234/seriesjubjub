const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

let globalData = null;

async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

// ------------------ HOME ------------------
async function initHome() {
  globalData = await fetchData();

  // Cumulative balance
  document.getElementById("cumulative-balance").textContent = "฿" + globalData.cumulative.currentBalance.toLocaleString();

  // Monthly summary
  document.getElementById("monthly-income").textContent = "฿" + globalData.monthly.income.toLocaleString();
  document.getElementById("monthly-expense").textContent = "฿" + Math.abs(globalData.monthly.expense).toLocaleString();
  document.getElementById("monthly-balance").textContent = "฿" + globalData.monthly.balance.toLocaleString();

  renderTransactions("transaction-list", globalData.monthly.list.slice(0,30));
}

function renderTransactions(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  list.forEach(t => {
    const div = document.createElement("div");
    div.textContent = `${t.date} | ${t.category}: ${t.description} | ${t.amount.toLocaleString()}`;
    container.appendChild(div);
  });
}

// ------------------ NAV ------------------
function goHome() { window.location.href = "index.html"; }
function goFund() { window.location.href = "fund.html"; }
function goAnalytics() { window.location.href = "analytics.html"; }
function goTransactionsAll() { window.location.href = "transactions.html"; }

// ------------------ TRANSACTIONS ------------------
async function initTransactions() {
  if (!globalData) globalData = await fetchData();
  populateMonthYearSelects();
  renderTransactions("all-transaction-list", globalData.monthly.list);
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  for (let m=1; m<=12; m++) {
    const opt = document.createElement("option"); opt.value=m; opt.textContent=m;
    monthSelect.appendChild(opt);
  }

  const year = new Date().getFullYear();
  for (let y=year-2; y<=year; y++) {
    const opt = document.createElement("option"); opt.value=y; opt.textContent=y;
    yearSelect.appendChild(opt);
  }

  monthSelect.value = globalData.current.year;
  yearSelect.value = globalData.current.year;
}

// ------------------ FUND ------------------
async function initFund() {
  if (!globalData) globalData = await fetchData();
  const saved = Math.max(globalData.current.balance,0);
  const goal = 50000;
  document.getElementById("fund-saved").textContent = "฿"+saved.toLocaleString();
  document.getElementById("fund-goal").textContent = "฿"+goal.toLocaleString();
  document.getElementById("fund-progress").value = saved;
}

// ------------------ ANALYTICS ------------------
async function initAnalytics() {
  if (!globalData) globalData = await fetchData();
  const ctx = document.getElementById("analytics-chart").getContext("2d");

  const labels = Object.keys(globalData.analytics.daily);
  const data = Object.values(globalData.analytics.daily);

  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Daily Spend/Income', data, borderColor:'#007bff', fill:false }]},
    options: { responsive:true, maintainAspectRatio:false }
  });
}
