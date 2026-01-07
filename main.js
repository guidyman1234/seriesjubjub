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
    const row = document.createElement("div");
    row.className = "tx-row";

    row.innerHTML = `
      <div class="tx-date">${t.date}</div>
      <div class="tx-main">
        <span>${t.category}</span>
        <span>|</span>
        <span>${t.description}</span>
        <span class="tx-amount ${t.amount < 0 ? 'neg' : 'pos'}">
          ${t.amount.toLocaleString()}
        </span>
      </div>
    `;

    container.appendChild(row);
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
  filterTransactions ();
}
function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = globalData.all.filter(t =>
    t.month === m && t.year === y
  );

  renderTransactions("all-transaction-list", filtered);
}
document.getElementById("month-select").onchange = filterTransactions;
document.getElementById("year-select").onchange = filterTransactions;

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

  monthSelect.value = globalData.current.month;
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
  const data = globalData.analytics.byCategory;

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
