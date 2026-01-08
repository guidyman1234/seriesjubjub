const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

let globalData = null;

async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}
function normalizeTransactions(list) {
  return list.map((t, i) => {
    const amt = Number(t.AMOUNT || t.amount || 0);

    return {
      _idx: i,
      date: t.DATE || "",
      year: Number(t.YEAR),
      month: Number(t.MONTH),
      amount: amt,
      type: amt >= 0 ? "income" : "expense",
      category: t.CATEGORY || "",
      description: t.DESCRIPTION || ""
    };
  });
}
function sortLatestFirst(list) {
  return list.sort((a, b) => b._idx - a._idx);
}

function calculateSummary(list) {
  let income = 0;
  let expense = 0;

  list.forEach(t => {
    if (t.amount >= 0) income += t.amount;
    else expense += Math.abs(t.amount);
  });

  return {
    income,
    expense,
    balance: income - expense
  };
}
// ------------------ HOME ------------------
async function initHome() {
  const raw = await fetchData();
  raw.all = normalizeTransactions(raw.all);
  globalData = raw;

  const summary = calculateSummary(globalData.all);
  setText("total-income", summary.income);
  setText("total-expense", summary.expense);
  setText("total-balance", summary.balance);

  const latest = sortLatestFirst([...globalData.all]).slice(0, 30);
  renderTransactions("transaction-list", latest);
}

function renderTransactions(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  list.forEach(t => {
    const row = document.createElement("div");
    row.className = "tx-row";

    const isPlus = t.amount >= 0;

    row.innerHTML = `
      <div class="tx-top">
        <span class="tx-date">${t.date}</span>
        <span class="tx-amount ${isPlus ? "tx-plus" : "tx-minus"}">
          ${isPlus ? "+" : "-"}฿${Math.abs(t.amount).toLocaleString()}
        </span>
      </div>
      <div class="tx-desc">
        ${t.category} · ${t.description || ""}
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
  const raw = await fetchData();
  raw.all = normalizeTransactions(raw.all);
  globalData = raw;

  populateMonthYearSelects();
  filterTransactions();
}

function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = sortLatestFirst(
  globalData.all.filter(
    t => Number(t.month) === m && Number(t.year) === y
  )
);

  renderTransactions("all-transaction-list", filtered);
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
   monthSelect.innerHTML = "";
   yearSelect.innerHTML ="";

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

  monthSelect.onchange = filterTransactions;
yearSelect.onchange = filterTransactions;
}

// ------------------ FUND ------------------
async function initFund() {
  if (!globalData) globalData = await fetchData();
 const summary = calculateSummary(globalData.all);
 const saved = Math.max(summary.balance, 0);
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
