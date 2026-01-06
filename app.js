const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

let DATA = null;

/* =========================
   LOAD
========================= */
async function loadData() {
  const res = await fetch(API_URL);
  DATA = await res.json();
  showHome();
}

/* =========================
   HOME
========================= */
function showHome() {
  const { cumulative, monthly } = DATA;

  document.getElementById("content").innerHTML = `
    <div class="balance">
      <small>Total Balance</small>
      <h1>${format(cumulative.currentBalance)}</h1>
    </div>

    <div class="card">
      <b>This Month</b><br/>
      Income: ${format(monthly.income)}<br/>
      Expense: ${format(monthly.expense)}<br/>
      Net: ${format(monthly.balance)}
    </div>

    <div class="card">
      <b>Transactions</b>
      ${monthly.list.map(t => `
        <div class="tx">
          <div class="left">
            ${t.category}<br/>
            <small>${t.description}</small>
          </div>
          <div class="right ${t.amount >= 0 ? 'plus' : 'minus'}">
            ${format(t.amount)}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* =========================
   FUND
========================= */
function showFund() {
  const goal = 500000; // ปรับทีหลัง
  const saved = DATA.cumulative.currentBalance;
  const percent = Math.min(100, Math.round(saved / goal * 100));

  document.getElementById("content").innerHTML = `
    <div class="balance">
      <small>UK Fund Goal</small>
      <h1>${percent}%</h1>
    </div>

    <div class="card">
      Goal: ${format(goal)}<br/>
      Saved: ${format(saved)}
    </div>
  `;
}

/* =========================
   ANALYTICS
========================= */
function showAnalytics() {
  document.getElementById("content").innerHTML = `
    <div class="card">
      <b>Analytics (Raw)</b>
      <pre>${JSON.stringify(DATA.analytics, null, 2)}</pre>
    </div>
  `;
}

/* =========================
   UTIL
========================= */
function format(n) {
  return Number(n).toLocaleString();
}

loadData();
