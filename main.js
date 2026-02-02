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

/* ================= RENDER TRANSACTIONS (SHARED) ================= */
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
        ${t.category || ""}
        ${t.description ? " · " + t.description : ""}
        ${t.location ? " · 📍" + t.location : ""}
      </div>
    `;
    el.appendChild(div);
  });
}

/* ================= HOME ================= */
async function initHome() {
  const data = await fetchData();
  const tx = data.allTransactions || [];

  const lastBal =
    data.cumulative?.[data.cumulative.length - 1]?.balance || 0;

  const balEl = document.getElementById("cumulative-balance");
  if (balEl) balEl.textContent = "฿" + lastBal.toLocaleString();

  if (tx.length === 0) return;

  const latestDate = new Date(tx[0].date);
  const latestMonth = latestDate.getMonth() + 1;
  const latestYear = latestDate.getFullYear();

  let income = 0;
  let expense = 0;

  tx.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() + 1 === latestMonth && d.getFullYear() === latestYear) {
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

  if (ALL_TX.length === 0) return;

  populateMonthYearSelects();
  filterTransactions();
}

function populateMonthYearSelects() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  if (!monthSelect || !yearSelect) return;

  const dates = ALL_TX.map(t => new Date(t.date));
  const years = [...new Set(dates.map(d => d.getFullYear()))].sort((a,b)=>b-a);

  yearSelect.innerHTML = "";
  years.forEach(y => yearSelect.add(new Option(y, y)));

  function updateMonths() {
    const y = Number(yearSelect.value);
    const months = [...new Set(
      dates.filter(d => d.getFullYear() === y).map(d => d.getMonth()+1)
    )].sort((a,b)=>b-a);

    monthSelect.innerHTML = "";
    months.forEach(m => monthSelect.add(new Option(`เดือน ${m}`, m)));
  }

  yearSelect.onchange = () => { updateMonths(); filterTransactions(); };
  monthSelect.onchange = filterTransactions;

  yearSelect.value = years[0];
  updateMonths();
}

function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const filtered = ALL_TX.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === m && d.getFullYear() === y;
  });

  renderTransactions("all-transaction-list", filtered);
}

/* ================= ANALYTICS ================= */
let ANALYTICS_TX = [];
let ANALYTICS_CHART = null;

async function initAnalytics() {
  console.log("INIT ANALYTICS");

  const data = await fetchData();
  ANALYTICS_TX = data.allTransactions || [];

  console.log("TX:", ANALYTICS_TX.length);

  if (!ANALYTICS_TX.length) return;

  initFilters();
  renderAnalytics();
}

function initFilters() {
  const yEl = document.getElementById("analytics-year");
  const mEl = document.getElementById("analytics-month");

  const dates = ANALYTICS_TX.map(t => new Date(t.date));
  const years = [...new Set(dates.map(d => d.getFullYear()))].sort((a,b)=>b-a);

  yEl.innerHTML = "";
  years.forEach(y => yEl.add(new Option(y,y)));
  yEl.value = years[0];

  yEl.onchange = () => {
    updateMonths();
    renderAnalytics();
  };
  mEl.onchange = renderAnalytics;

  updateMonths();
}

function updateMonths() {
  const y = Number(document.getElementById("analytics-year").value);
  const mEl = document.getElementById("analytics-month");

  const months = [...new Set(
    ANALYTICS_TX
      .filter(t => new Date(t.date).getFullYear() === y)
      .map(t => new Date(t.date).getMonth()+1)
  )].sort((a,b)=>b-a);

  mEl.innerHTML = "";
  months.forEach(m => mEl.add(new Option(`เดือน ${m}`, m)));
}

function renderAnalytics() {
  const y = Number(document.getElementById("analytics-year").value);
  const m = Number(document.getElementById("analytics-month").value);

  const tx = ANALYTICS_TX.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear()===y && d.getMonth()+1===m;
  });

  let income = 0, expense = 0;
  tx.forEach(t=>{
    if(t.amount>=0) income+=t.amount;
    else expense+=Math.abs(t.amount);
  });

  document.getElementById("sum-income").textContent = income.toLocaleString();
  document.getElementById("sum-expense").textContent = expense.toLocaleString();
  document.getElementById("sum-balance").textContent =
    (income-expense).toLocaleString();

  drawChart(income, expense);
  renderTx(tx);
}

function drawChart(income, expense) {
  const ctx = document.getElementById("analyticsChart");

  if (ANALYTICS_CHART) ANALYTICS_CHART.destroy();

  ANALYTICS_CHART = new Chart(ctx,{
    type:"bar",
    data:{
      labels:["Income","Expense"],
      datasets:[{
        data:[income,expense]
      }]
    },
    options:{
      plugins:{
        tooltip:{
          callbacks:{
            label:c=>`฿${c.parsed.y.toLocaleString()}`
          }
        }
      }
    }
  });
}

function renderTx(tx){
  const el=document.getElementById("categoryTxList");
  el.innerHTML="";
  tx.forEach(t=>{
    el.innerHTML+=`
      <div class="tx-row">
        ${t.date} · ${t.category} · ฿${Math.abs(t.amount).toLocaleString()}
      </div>`;
  });
}



/* ================= NAV ================= */
function goHome() { location.href = "index.html"; }
function goFund() { location.href = "fund.html"; }
function goAnalytics() { location.href = "analytics.html"; }
function goTransactionsAll() { location.href = "transactions.html"; }
