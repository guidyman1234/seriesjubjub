const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

/* ------------------ FETCH ------------------ */
async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

/* ------------------ NORMALIZE ------------------ */
function monthToNumber(m) {
  if (typeof m === "number") return m;
  if (!m) return null;
  return new Date(`${m} 1, 2000`).getMonth() + 1;
}
function normalizeTransactions(list) {
  return list.map((t, i) => {
    const amt = Number(t.AMOUNT ?? t.amount ?? 0);
    return {
      idx: i,
      date: t.DATE ?? t.date ?? "",
      year: Number(t.YEAR ?? t.year),
      month: monthToNumber(t.MONTH ?? t.month),
      amount: amt,
      category: t.CATEGORY ?? t.category ?? "",
      description: t.DESCRIPTION ?? t.description ?? ""
    };
  });
}

/* ------------------ SORT ------------------ */
function sortLatestFirst(list) {
  return list.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

/* ------------------ SUMMARY (LATEST MONTH ONLY) ------------------ */
function calculateLatestMonthSummary(list) {
  if (list.length === 0) return { income: 0, expense: 0, balance: 0 };

  const latest = list[0];
  const y = latest.year;
  const m = latest.month;

  let income = 0;
  let expense = 0;

  list.forEach(t => {
    if (t.year === y && t.month === m) {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    }
  });

  return {
    income,
    expense,
    balance: income - expense
  };
}

/* ------------------ RENDER TRANSACTIONS ------------------ */
function renderTransactions(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  list.forEach(t => {
    const isPlus = t.amount >= 0;

    const row = document.createElement("div");
    row.className = "tx-row";

    row.innerHTML = `
      <div class="tx-top">
        <span class="tx-date">${t.date}</span>
        <span class="tx-amount ${isPlus ? "tx-plus" : "tx-minus"}">
          ${isPlus ? "+" : "-"}฿${Math.abs(t.amount).toLocaleString()}
        </span>
      </div>
      <div class="tx-desc">
        ${t.category}${t.description ? " · " + t.description : ""}
      </div>
    `;

    container.appendChild(row);
  });
}

/* ================== HOME ================== */
async function initHome() {
  const raw = await fetchData();

  // TOTAL BALANCE
  document.getElementById("cumulative-balance").textContent =
    "฿" + raw.cumulative.currentBalance.toLocaleString();

  // MONTHLY SUMMARY (เดือนล่าสุดจาก GAS)
  document.getElementById("monthly-income").textContent =
    "฿" + raw.current.income.toLocaleString();
  document.getElementById("monthly-expense").textContent =
    "฿" + Math.abs(raw.current.expense).toLocaleString();
  document.getElementById("monthly-balance").textContent =
    "฿" + raw.current.balance.toLocaleString();

  // TRANSACTIONS (เดือนปัจจุบัน เรียงใหม่ → เก่า)
  renderTransactions(
    "transaction-list",
    raw.monthly.list
  );
}

/* ================== TRANSACTIONS PAGE ================== */
async function initTransactions() {
  const raw = await fetchData();

  // ใช้ monthly.list ตรง ๆ
  window._txAll = raw.monthly.list;

  renderTransactions("all-transaction-list", window._txAll);
}

function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = window._txAll.filter(
    t => t.month === m && t.year === y
  );

  renderTransactions("all-transaction-list", filtered);
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  }

  const year = new Date().getFullYear();
  for (let y = year - 2; y <= year; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  monthSelect.value = window._txAll[0].month;
  yearSelect.value = window._txAll[0].year;

  monthSelect.onchange = filterTransactions;
  yearSelect.onchange = filterTransactions;
}

/* ------------------ NAV ------------------ */
function goHome() { window.location.href = "index.html"; }
function goFund() { window.location.href = "fund.html"; }
function goAnalytics() { window.location.href = "analytics.html"; }
function goTransactionsAll() { window.location.href = "transactions.html"; }
