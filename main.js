const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

/* ---------- FETCH ---------- */
async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

/* ---------- RENDER ---------- */
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

/* ========== HOME ========== */
async function initHome() {
  const raw = await fetchData();

  // TOTAL BALANCE
  document.getElementById("cumulative-balance").textContent =
    "฿" + raw.cumulative.currentBalance.toLocaleString();

  // MONTHLY SUMMARY (เดือนปัจจุบันจาก GAS)
  document.getElementById("monthly-income").textContent =
    "฿" + raw.current.income.toLocaleString();
  document.getElementById("monthly-expense").textContent =
    "฿" + Math.abs(raw.current.expense).toLocaleString();
  document.getElementById("monthly-balance").textContent =
    "฿" + raw.current.balance.toLocaleString();

  // TRANSACTIONS (เดือนปัจจุบัน)
  renderTransactions("transaction-list", raw.monthly.list);
}

/* ========== TRANSACTIONS PAGE ========== */
async function initTransactions() {
  const raw = await fetchData();
  renderTransactions("all-transaction-list", raw.monthly.list);
}

/* ---------- NAV ---------- */
function goHome() { window.location.href = "index.html"; }
function goFund() { window.location.href = "fund.html"; }
function goAnalytics() { window.location.href = "analytics.html"; }
function goTransactionsAll() { window.location.href = "transactions.html"; }
