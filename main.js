const API_URL = "https://script.google.com/macros/s/AKfycbxbWaIPKFy6Ei52Qs6ZqMfgEhylJeuC93AQOBMQl6v_HX8GSfPSiYXWpvPDmq68ddlAjA/exec";

/* ---------- FETCH ---------- */
async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

/* ---------- RENDER ---------- */
function renderTransactions(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "tx-row";

    div.innerHTML = `
      <div class="tx-top">
        <span class="tx-date">${t.date}</span>
        <span class="tx-amount ${t.amount >= 0 ? "tx-plus" : "tx-minus"}">
          ${t.amount >= 0 ? "+" : "-"}฿${Math.abs(t.amount).toLocaleString()}
        </span>
      </div>
      <div class="tx-desc">
        ${t.category}${t.description ? " · " + t.description : ""}
      </div>
    `;
    el.appendChild(div);
  });
}
async function initHome() {
  const data = await fetchData();
  const tx = data.allTransactions;

  // TOTAL BALANCE
  document.getElementById("cumulative-balance").textContent =
    "฿" + data.cumulative.currentBalance.toLocaleString();

  // MONTH SUMMARY (เดือนล่าสุดจริง)
  const latest = tx[0];
  let income = 0, expense = 0;

  tx.forEach(t => {
    if (t.year === latest.year && t.month === latest.month) {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    }
  });

  document.getElementById("monthly-income").textContent =
    "฿" + income.toLocaleString();
  document.getElementById("monthly-expense").textContent =
    "฿" + expense.toLocaleString();
  document.getElementById("monthly-balance").textContent =
    "฿" + (income - expense).toLocaleString();

  // TRANSACTIONS → ไหลย้อนหลัง (จำกัด 20 รายการ)
  renderTransactions("transaction-list", tx.slice(0, 20));
}
let ALL_TX = [];

async function initTransactions() {
  const raw = await fetchData();
  ALL_TX = raw.allTransactions || [];

  if (ALL_TX.length === 0) {
    document.getElementById("all-transaction-list").innerHTML =
      "<p>ไม่มีข้อมูล</p>";
    return;
  }

  populateMonthYearSelects();

  // ✅ render เดือนล่าสุดทันที
  filterTransactions();
}


function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  const months = [...new Set(ALL_TX.map(t => t.month))].sort((a,b)=>b-a);
  const years  = [...new Set(ALL_TX.map(t => t.year))].sort((a,b)=>b-a);

  months.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = `เดือน ${m}`;
    monthSelect.appendChild(opt);
  });

  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  // ค่า default = ล่าสุด
  monthSelect.value = months[0];
  yearSelect.value = years[0];

  monthSelect.onchange = filterTransactions;
  yearSelect.onchange = filterTransactions;
}


function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = ALL_TX.filter(t =>
    Number(t.month) === m &&
    Number(t.year) === y
  );

  renderTransactions("all-transaction-list", filtered);
}


function goHome() { location.href = "index.html"; }
function goFund() { location.href = "fund.html"; }
function goAnalytics() { location.href = "analytics.html"; }
function goTransactionsAll() { location.href = "transactions.html"; }
