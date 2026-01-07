/* =================================================
   CONFIG
================================================= */
const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";
const MAX_RECENT = 30;

/* =================================================
   HELPER
================================================= */
function formatCurrency(n) {
  return "฿" + Number(n || 0).toLocaleString();
}

/* =================================================
   HOME PAGE
================================================= */
async function initHome() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const current = data.current;
    const monthly = data.monthly;
    const cumulative = data.cumulative;

    // cumulative balance top
    document.getElementById("cumulative-balance").innerText = formatCurrency(cumulative.currentBalance);

    // monthly summary
    document.getElementById("monthly-income").innerText = formatCurrency(monthly.income);
    document.getElementById("monthly-expense").innerText = formatCurrency(monthly.expense);
    document.getElementById("monthly-balance").innerText = formatCurrency(monthly.balance);

    // recent transactions (30 รายการล่าสุด)
    const listDiv = document.getElementById("transaction-list");
    listDiv.innerHTML = "";
    monthly.list.slice(0, MAX_RECENT).forEach(tx => {
      const div = document.createElement("div");
      div.className = "transaction-item";
      div.innerText = `${tx.date} | ${tx.category} | ${tx.description} | ${formatCurrency(tx.amount)}`;
      listDiv.appendChild(div);
    });

  } catch(e) {
    console.error(e);
  }
}

function goTransactionsAll() {
  window.location.href = "transactions.html";
}

function goFund() {
  window.location.href = "fund.html";
}

function goHome() {
  window.location.href = "index.html";
}

function goAnalytics() {
  window.location.href = "analytics.html";
}

/* =================================================
   TRANSACTIONS PAGE
================================================= */
async function initTransactions() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const transactions = data.monthly.list;

    // populate month/year selects
    const monthSelect = document.getElementById("month-select");
    const yearSelect = document.getElementById("year-select");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    for(let y=currentYear; y>=currentYear-5; y--) {
      const opt = document.createElement("option");
      opt.value = y; opt.text = y;
      if(y===currentYear) opt.selected=true;
      yearSelect.appendChild(opt);
    }

    for(let m=1; m<=12; m++){
      const opt = document.createElement("option");
      opt.value = m; opt.text = m;
      if(m===currentMonth) opt.selected=true;
      monthSelect.appendChild(opt);
    }

    const renderList = () => {
      const selectedYear = parseInt(yearSelect.value);
      const selectedMonth = parseInt(monthSelect.value);
      const listDiv = document.getElementById("all-transaction-list");
      listDiv.innerHTML = "";

      const filtered = transactions.filter(tx=>tx.date.startsWith(`${selectedYear}-${selectedMonth.toString().padStart(2,"0")}`));
      filtered.forEach(tx=>{
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.innerText = `${tx.date} | ${tx.category} | ${tx.description} | ${formatCurrency(tx.amount)}`;
        listDiv.appendChild(div);
      });
    }

    monthSelect.addEventListener("change", renderList);
    yearSelect.addEventListener("change", renderList);

    renderList();

  } catch(e) {
    console.error(e);
  }
}

/* =================================================
   FUND PAGE
================================================= */
async function initFund() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const monthly = data.monthly;

    const saved = monthly.balance > 0 ? monthly.balance : 0;
    const goal = 50000;

    document.getElementById("fund-saved").innerText = formatCurrency(saved);
    document.getElementById("fund-goal").innerText = formatCurrency(goal);
    document.getElementById("fund-progress").value = saved;
    document.getElementById("fund-progress").max = goal;

  } catch(e) {
    console.error(e);
  }
}

/* =================================================
   ANALYTICS PAGE
================================================= */
async function initAnalytics() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const analytics = data.analytics;

    const ctx = document.getElementById("analytics-chart").getContext("2d");
    let chart;

    const renderChart = (period) => {
      const labels = Object.keys(analytics.daily).sort();
      const values = labels.map(d=>analytics.daily[d]);

      if(chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets:[{
            label: "Balance / Day",
            data: values,
            borderColor: "blue",
            backgroundColor:"rgba(0,0,255,0.2)"
          }]
        },
        options: {
          responsive:true,
          maintainAspectRatio:false
        }
      });
    }

    const periodSelect = document.getElementById("analytics-period");
    periodSelect.addEventListener("change", ()=>renderChart(periodSelect.value));
    renderChart(periodSelect.value);

  } catch(e) {
    console.error(e);
  }
}
