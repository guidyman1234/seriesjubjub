/* =================================================
   CONFIG
================================================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyVt9RHPNWWgzbOpjlyMk014Ir7MoePNCcrO9QPPh2RIg3VqZM03rpoE4wF1JIjr3LTGw/exec";

/* =================================================
   FETCH
================================================= */
async function fetchData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("API ERROR");
  return await res.json();
}

/* =================================================
   SHARED: TRANSACTION RENDER
================================================= */
function renderTransactions(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";

  if (!list.length) {
    el.innerHTML = `<p style="text-align:center;color:#888">ไม่มีข้อมูล</p>`;
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
        ${t.location ? " · 📍" + t.location : ""}
        ${t.description ? " · " + t.description : ""}
      </div>
    `;
    el.appendChild(div);
  });
}

/* =================================================
   HOME
================================================= */
async function initHome() {
  const data = await fetchData();
  const tx = data.allTransactions || [];
  const cum = data.cumulative || [];

  if (!tx.length) return;

  document.getElementById("cumulative-balance").textContent =
    "฿" + (cum.at(-1)?.balance || 0).toLocaleString();

  const latest = new Date(tx[0].date);
  const m = latest.getMonth();
  const y = latest.getFullYear();

  let income = 0, expense = 0;
  tx.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === m && d.getFullYear() === y) {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    }
  });

  document.getElementById("monthly-income").textContent = "฿" + income.toLocaleString();
  document.getElementById("monthly-expense").textContent = "฿" + expense.toLocaleString();
  document.getElementById("monthly-balance").textContent =
    "฿" + (income - expense).toLocaleString();

  renderTransactions("transaction-list", tx.slice(0, 20));
}

/* =================================================
   TRANSACTIONS PAGE
================================================= */
let ALL_TX = [];

async function initTransactions() {
  const data = await fetchData();
  ALL_TX = data.allTransactions || [];
  if (!ALL_TX.length) return;

  populateMonthYear();
  filterTransactions();
}

function populateMonthYear() {
  const mEl = document.getElementById("month-select");
  const yEl = document.getElementById("year-select");

  const dates = ALL_TX.map(t => new Date(t.date));
  const years = [...new Set(dates.map(d => d.getFullYear()))].sort((a,b)=>b-a);

  yEl.innerHTML = "";
  years.forEach(y => yEl.add(new Option(y, y)));

  function updateMonths() {
    const y = Number(yEl.value);
    const months = [...new Set(
      dates.filter(d => d.getFullYear() === y).map(d => d.getMonth()+1)
    )].sort((a,b)=>b-a);

    mEl.innerHTML = "";
    months.forEach(m => mEl.add(new Option(`เดือน ${m}`, m)));
  }

  yEl.onchange = () => { updateMonths(); filterTransactions(); };
  mEl.onchange = filterTransactions;

  yEl.value = years[0];
  updateMonths();
}

function filterTransactions() {
  const m = Number(document.getElementById("month-select").value);
  const y = Number(document.getElementById("year-select").value);

  const list = ALL_TX.filter(t => {
    const d = new Date(t.date);
    return d.getMonth()+1 === m && d.getFullYear() === y;
  });

  renderTransactions("all-transaction-list", list);
}

/* =================================================
   ANALYTICS
================================================= */
let analyticsChart;
let ANALYTICS_TX = [];

async function initAnalytics() {
  const data = await fetchData();
  ANALYTICS_TX = data.allTransactions || [];
  if (!ANALYTICS_TX.length) return;

  setupAnalyticsFilters();
  renderAnalytics();
}

function setupAnalyticsFilters() {
  const yEl = document.getElementById("filterYear");
  const mEl = document.getElementById("filterMonth");
  const lEl = document.getElementById("filterLocation");
  const cEl = document.getElementById("filterCategory");

  const dates = ANALYTICS_TX.map(t => new Date(t.date));
  const years = [...new Set(dates.map(d => d.getFullYear()))].sort((a,b)=>b-a);

  yEl.innerHTML = `<option value="ALL">All</option>`;
  years.forEach(y => yEl.add(new Option(y, y)));

  yEl.onchange = () => fillMonths();
  [yEl, mEl, lEl, cEl].forEach(el =>
    el.addEventListener("change", renderAnalytics)
  );

  fillMonths();
}

function fillMonths() {
  const y = document.getElementById("filterYear").value;
  const mEl = document.getElementById("filterMonth");

  const months = [...new Set(
    ANALYTICS_TX.filter(t => y==="ALL" || new Date(t.date).getFullYear()==y)
      .map(t => new Date(t.date).getMonth()+1)
  )].sort((a,b)=>b-a);

  mEl.innerHTML = `<option value="ALL">All</option>`;
  months.forEach(m => mEl.add(new Option(`เดือน ${m}`, m)));
}

function renderAnalytics() {
  const y = document.getElementById("filterYear").value;
  const m = document.getElementById("filterMonth").value;
  const l = document.getElementById("filterLocation").value;
  const c = document.getElementById("filterCategory").value;

  const filtered = ANALYTICS_TX.filter(t => {
    const d = new Date(t.date);
    return (
      (y==="ALL" || d.getFullYear()==y) &&
      (m==="ALL" || d.getMonth()+1==m) &&
      (!l || t.location===l) &&
      (!c || t.category===c)
    );
  });

  populateLocationCategory(filtered);
  renderSummary(filtered);
  renderStackedChart(filtered);
  renderTransactions("txList", filtered);
}

function populateLocationCategory(tx) {
  const lEl = document.getElementById("filterLocation");
  const cEl = document.getElementById("filterCategory");

  const locs = [...new Set(tx.map(t=>t.location).filter(Boolean))];
  const cats = [...new Set(tx.map(t=>t.category).filter(Boolean))];

  lEl.innerHTML = `<option value="">All Locations</option>`;
  locs.forEach(v => lEl.add(new Option(v,v)));

  cEl.innerHTML = `<option value="">All Categories</option>`;
  cats.forEach(v => cEl.add(new Option(v,v)));
}

function renderSummary(tx) {
  let income=0, expense=0;
  tx.forEach(t=>{
    if(t.amount>=0) income+=t.amount;
    else expense+=Math.abs(t.amount);
  });

  document.getElementById("sumIncome").textContent = income.toLocaleString();
  document.getElementById("sumExpense").textContent = expense.toLocaleString();
  document.getElementById("sumBalance").textContent =
    (income-expense).toLocaleString();
}

function renderStackedChart(tx) {
  const income = {}, expense = {};

  tx.forEach(t=>{
    const map = t.amount>=0 ? income : expense;
    map[t.category] = (map[t.category]||0) + Math.abs(t.amount);
  });

  const cats = [...new Set([...Object.keys(income), ...Object.keys(expense)])];

  const datasets = cats.map(c=>({
    label: c,
    data: [income[c]||0, expense[c]||0]
  }));

  if (analyticsChart) analyticsChart.destroy();

  analyticsChart = new Chart(
    document.getElementById("analyticsChart"),
    {
      type:"bar",
      data:{
        labels:["Income","Expense"],
        datasets
      },
      options:{
        responsive:true,
        scales:{ x:{stacked:true}, y:{stacked:true} },
        plugins:{ legend:{position:"bottom"} }
      }
    }
  );
}

/* =================================================
   NAV
================================================= */
function goHome(){location.href="index.html";}
function goTransactionsAll(){location.href="transactions.html";}
function goAnalytics(){location.href="analytics.html";}
