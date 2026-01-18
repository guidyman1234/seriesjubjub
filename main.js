const API_URL =
  "https://script.google.com/macros/s/AKfycbyVt9RHPNWWgzbOpjlyMk014Ir7MoePNCcrO9QPPh2RIg3VqZM03rpoE4wF1JIjr3LTGw/exec";

/* ================= FETCH ================= */
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    alert("API ERROR: " + e.message);
    throw e;
  }
}

/* ================= RENDER TRANSACTIONS ================= */
function renderTransactions(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";

  if (!list || list.length === 0) {
    el.innerHTML = "<p>ไม่มีข้อมูล</p>";
    return;
  }

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
        ${t.category || ""}${t.description ? " · " + t.description : ""}
      </div>
    `;

    el.appendChild(div);
  });
}

/* ================= HOME ================= */
async function initHome() {
  const data = await fetchData();
  const tx = data.allTransactions || [];

  // cumulative balance
  const lastBal =
    data.cumulative?.[data.cumulative.length - 1]?.balance || 0;

  const balEl = document.getElementById("cumulative-balance");
  if (balEl) balEl.textContent = "฿" + lastBal.toLocaleString();

  if (tx.length === 0) return;

  // latest month summary
  const latestDate = new Date(tx[0].date);
  const latestMonth = latestDate.getMonth() + 1;
  const latestYear = latestDate.getFullYear();

  let income = 0;
  let expense = 0;

  tx.forEach(t => {
    const d = new Date(t.date);
    if (
      d.getMonth() + 1 === latestMonth &&
      d.getFullYear() === latestYear
    ) {
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

  renderTransactions("transaction-list", tx.slice(0, 20));
}

/* ================= TRANSACTIONS PAGE ================= */
let ALL_TX = [];

async function initTransactions() {
  const raw = await fetchData();
  ALL_TX = raw.allTransactions || [];

  const listEl = document.getElementById("all-transaction-list");
  if (!listEl) return;

  if (ALL_TX.length === 0) {
    listEl.innerHTML = "<p>ไม่มีข้อมูล</p>";
    return;
  }

  populateMonthYearSelects();
  filterTransactions();
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  if (!monthSelect || !yearSelect) return;

  const pairs = ALL_TX.map(t => {
    const d = new Date(t.date);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const years = [...new Set(pairs.map(p => p.year))].sort((a, b) => b - a);

  const monthYearMap = {};
  pairs.forEach(p => {
    if (!monthYearMap[p.year]) monthYearMap[p.year] = new Set();
    monthYearMap[p.year].add(p.month);
  });

  yearSelect.innerHTML = "";
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  function updateMonths() {
    const y = Number(yearSelect.value);
    monthSelect.innerHTML = "";
    [...monthYearMap[y]].sort((a, b) => b - a).forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = `เดือน ${m}`;
      monthSelect.appendChild(opt);
    });
  }

  yearSelect.onchange = () => {
    updateMonths();
    filterTransactions();
  };
  monthSelect.onchange = filterTransactions;

  yearSelect.value = years[0];
  updateMonths();
}

function filterTransactions() {
  const mEl = document.getElementById("month-select");
  const yEl = document.getElementById("year-select");
  const listEl = document.getElementById("all-transaction-list");

  if (!mEl || !yEl || !listEl) return;

  const m = Number(mEl.value);
  const y = Number(yEl.value);

  const filtered = ALL_TX.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === m && d.getFullYear() === y;
  });

  renderTransactions("all-transaction-list", filtered);
}

/* ================= ANALYTICS ================= */
/* ================= ANALYTICS ================= */
let CATEGORY_CHART = null;
let MONTHLY_CHART = null;
let ANALYTICS_TX = [];
let SELECTED_CATEGORY = null;

async function initAnalytics() {
  const data = await fetchData();
  ANALYTICS_TX = data.allTransactions || [];

  if (ANALYTICS_TX.length === 0) return;

  renderCategoryChart();
  renderMonthlyChart();
}

/* ===== Expense by Category (PIE) ===== */
function renderCategoryChart() {
  const map = {};

  ANALYTICS_TX.forEach(t => {
    if (t.amount < 0) {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(map);
  const values = Object.values(map);

  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  if (CATEGORY_CHART) CATEGORY_CHART.destroy();

  CATEGORY_CHART = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: {
      responsive: true,
      onClick: (_, elements) => {
        if (!elements.length) return;
        const index = elements[0].index;
        SELECTED_CATEGORY = labels[index];
        renderCategoryList();
      }
    }
  });
}

/* ===== Monthly Income vs Expense (BAR) ===== */
function renderMonthlyChart() {
  const map = {};

  ANALYTICS_TX.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!map[key]) map[key] = { income: 0, expense: 0 };

    if (t.amount >= 0) map[key].income += t.amount;
    else map[key].expense += Math.abs(t.amount);
  });

  const labels = Object.keys(map).sort();
  const income = labels.map(k => map[k].income);
  const expense = labels.map(k => map[k].expense);

  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  if (MONTHLY_CHART) MONTHLY_CHART.destroy();

  MONTHLY_CHART = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Income", data: income },
        { label: "Expense", data: expense }
      ]
    },
    options: {
      responsive: true
    }
  });
}

/* ===== List by Category ===== */
function renderCategoryList() {
  const listEl = document.getElementById("categoryList");
  const titleEl = document.getElementById("categoryTitle");

  if (!listEl || !titleEl || !SELECTED_CATEGORY) return;

  titleEl.textContent = `Transactions: ${SELECTED_CATEGORY}`;
  listEl.innerHTML = "";

  ANALYTICS_TX
    .filter(t => t.category === SELECTED_CATEGORY)
    .forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${t.date}</strong><br>
        ${t.description || ""}<br>
        ฿${Math.abs(t.amount).toLocaleString()}
      `;
      listEl.appendChild(li);
    });
}


/* ================= NAV ================= */
function goHome() { location.href = "index.html"; }
function goFund() { location.href = "fund.html"; }
function goAnalytics() { location.href = "analytics.html"; }
function goTransactionsAll() { location.href = "transactions.html"; }
