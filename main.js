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

/* ================= RENDER TX ================= */
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

  /* TOTAL BALANCE (fix mobile crash) */
  const lastBal =
    data.cumulative?.[data.cumulative.length - 1]?.balance || 0;

  const balEl = document.getElementById("cumulative-balance");
  if (balEl)
    balEl.textContent = "฿" + lastBal.toLocaleString();

  if (tx.length === 0) return;

  /* MONTH SUMMARY = เดือนล่าสุดจริง */
 // หาเดือนล่าสุดจริงจาก date
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

  /* TRANSACTIONS STREAM */
  renderTransactions("transaction-list", tx.slice(0, 20));
}

/* ================= TRANSACTIONS PAGE ================= */
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
  filterTransactions();
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  // ดึงจาก date เท่านั้น (ชัวร์)
  const pairs = ALL_TX.map(t => {
    const d = new Date(t.date);
    return {
      month: d.getMonth() + 1,
      year: d.getFullYear()
    };
  });

  // unique year
  const years = [...new Set(pairs.map(p => p.year))].sort((a,b)=>b-a);

  // unique month-year pair
  const monthYearMap = {};
  pairs.forEach(p => {
    if (!monthYearMap[p.year]) monthYearMap[p.year] = new Set();
    monthYearMap[p.year].add(p.month);
  });

  // เติม year
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  // เติมเดือนตามปี
  function updateMonths() {
    const y = Number(yearSelect.value);
    monthSelect.innerHTML = "";

    [...monthYearMap[y]].sort((a,b)=>b-a).forEach(m => {
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

  // ค่าเริ่มต้น = ล่าสุด
  yearSelect.value = years[0];
  updateMonths();
}


function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = ALL_TX.filter(t => {
    const d = new Date(t.date);
    return (
      d.getMonth() + 1 === m &&
      d.getFullYear() === y
    );
  });

  if (filtered.length === 0) {
    document.getElementById("all-transaction-list").innerHTML =
      "<p>ไม่มีข้อมูล</p>";
    return;
  }

  renderTransactions("all-transaction-list", filtered);
}


/* ================= FUND (SAFE) ================= */
function initFund() {
  // placeholder กัน JS crash
}


/* ================= NAV ================= */
function goHome() {
  location.href = "index.html";
}
function goFund() {
  location.href = "fund.html";
}
function goAnalytics() {
  location.href = "analytics.html";
}
function goTransactionsAll() {
  location.href = "transactions.html";
}

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

/* ================= RENDER TX ================= */
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

  /* TOTAL BALANCE (fix mobile crash) */
  const lastBal =
    data.cumulative?.[data.cumulative.length - 1]?.balance || 0;

  const balEl = document.getElementById("cumulative-balance");
  if (balEl)
    balEl.textContent = "฿" + lastBal.toLocaleString();

  if (tx.length === 0) return;

  /* MONTH SUMMARY = เดือนล่าสุดจริง */
 // หาเดือนล่าสุดจริงจาก date
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

  /* TRANSACTIONS STREAM */
  renderTransactions("transaction-list", tx.slice(0, 20));
}

/* ================= TRANSACTIONS PAGE ================= */
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
  filterTransactions();
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  // ดึงจาก date เท่านั้น (ชัวร์)
  const pairs = ALL_TX.map(t => {
    const d = new Date(t.date);
    return {
      month: d.getMonth() + 1,
      year: d.getFullYear()
    };
  });

  // unique year
  const years = [...new Set(pairs.map(p => p.year))].sort((a,b)=>b-a);

  // unique month-year pair
  const monthYearMap = {};
  pairs.forEach(p => {
    if (!monthYearMap[p.year]) monthYearMap[p.year] = new Set();
    monthYearMap[p.year].add(p.month);
  });

  // เติม year
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  // เติมเดือนตามปี
  function updateMonths() {
    const y = Number(yearSelect.value);
    monthSelect.innerHTML = "";

    [...monthYearMap[y]].sort((a,b)=>b-a).forEach(m => {
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

  // ค่าเริ่มต้น = ล่าสุด
  yearSelect.value = years[0];
  updateMonths();
}


function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = ALL_TX.filter(t => {
    const d = new Date(t.date);
    return (
      d.getMonth() + 1 === m &&
      d.getFullYear() === y
    );
  });

  if (filtered.length === 0) {
    document.getElementById("all-transaction-list").innerHTML =
      "<p>ไม่มีข้อมูล</p>";
    return;
  }

  renderTransactions("all-transaction-list", filtered);
}


/* ================= FUND (SAFE) ================= */
function initFund() {
  // placeholder กัน JS crash
}

/* ================= ANALYTICS (SAFE) ================= */
function initAnalytics() {
  // placeholder กัน JS crash
}

/* ================= NAV ================= */
function goHome() {
  location.href = "index.html";
}
function goFund() {
  location.href = "fund.html";
}
function goAnalytics() {
  location.href = "analytics.html";
}
function goTransactionsAll() {
  location.href = "transactions.html";
}

async function initAnalytics() {
  const data = await fetchData();
  const tx = data.allTransactions;

  if (!tx || tx.length === 0) {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<p>ไม่มีข้อมูลสำหรับวิเคราะห์</p>"
    );
    return;
  }

  const select = document.getElementById("analytics-period");
  const ctx = document.getElementById("analytics-chart").getContext("2d");

  let chart;

  function render(type) {
    if (chart) chart.destroy();

    if (type === "daily") {
      chart = renderDaily(ctx, tx);
    } else {
      chart = renderMonthly(ctx, tx);
    }
  }

  select.onchange = () => render(select.value);
  render(select.value);
}

function renderDaily(ctx, tx) {
  const map = {};

  tx.forEach(t => {
    const d = t.date;
    map[d] = (map[d] || 0) + t.amount;
  });

  let balance = 0;
  const labels = [];
  const data = [];

  Object.keys(map).sort().forEach(d => {
    balance += map[d];
    labels.push(d);
    data.push(balance);
  });

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Balance",
        data,
        fill: false,
        tension: 0.3
      }]
    }
  });
}

function renderMonthly(ctx, tx) {
  const map = {};

  tx.forEach(t => {
    if (t.amount < 0) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      map[key] = (map[key] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(map).sort();
  const data = labels.map(l => map[l]);

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Expenses",
        data
      }]
    }
  });
}
function getExpenseByCategory(data) {
  const map = {};

  data.forEach(t => {
    if (t.amount >= 0) return; // เอาเฉพาะ expense
    map[t.category || "อื่นๆ"] =
      (map[t.category || "อื่นๆ"] || 0) + Math.abs(t.amount);
  });

  return {
    labels: Object.keys(map),
    values: Object.values(map)
  };
}
function getMonthlySummary(data) {
  const map = {};

  data.forEach(t => {
    const key = t.date.slice(0, 7); // YYYY-MM

    if (!map[key]) {
      map[key] = { income: 0, expense: 0 };
    }

    if (t.amount >= 0) map[key].income += t.amount;
    else map[key].expense += Math.abs(t.amount);
  });

  const labels = Object.keys(map).sort();
  return {
    labels,
    income: labels.map(m => map[m].income),
    expense: labels.map(m => map[m].expense)
  };
}
