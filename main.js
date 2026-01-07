const API_URL = "https://script.google.com/macros/s/AKfycbwWk-tBt9j77Wh1WJaetaObiKxcriRAtqLJO_CbGpIn3ypSaM0z7mBCLNRngbzODk0qtQ/exec";

async function fetchData() {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data;
}

// ---------- NAVIGATION ----------
function goHome() { window.location.href = "index.html"; }
function goTransactionsAll() { window.location.href = "transactions.html"; }
function goFund() { window.location.href = "fund.html"; }
function goAnalytics() { window.location.href = "analytics.html"; }

// ---------- HOME ----------
async function initHome() {
    const data = await fetchData();
    document.getElementById("cumulative-balance").textContent = `฿${data.cumulative.currentBalance.toLocaleString()}`;
    document.getElementById("monthly-income").textContent = `฿${data.current.income.toLocaleString()}`;
    document.getElementById("monthly-expense").textContent = `฿${data.current.expense.toLocaleString()}`;
    document.getElementById("monthly-balance").textContent = `฿${data.current.balance.toLocaleString()}`;
    renderTransactionsList(data.monthly.list, "transaction-list", 30);
}

// ---------- TRANSACTIONS ----------
async function initTransactions() {
    const data = await fetchData();
    populateMonthYearSelect(data.current.year, data.current.month);
    renderTransactionsList(data.monthly.list, "all-transaction-list", data.monthly.list.length);
}

function populateMonthYearSelect(currentYear, currentMonth) {
    const monthSelect = document.getElementById("month-select");
    const yearSelect = document.getElementById("year-select");
    for (let m = 1; m <= 12; m++) monthSelect.append(new Option(m, m, m===currentMonth, m===currentMonth));
    for (let y = currentYear-1; y <= currentYear+1; y++) yearSelect.append(new Option(y, y, y===currentYear, y===currentYear));
}

// ---------- FUND ----------
async function initFund() {
    const data = await fetchData();
    const goal = 50000;
    const saved = data.current.balance;
    document.getElementById("fund-saved").textContent = `฿${saved.toLocaleString()}`;
    document.getElementById("fund-goal").textContent = `฿${goal.toLocaleString()}`;
    document.getElementById("fund-progress").value = saved;
}

// ---------- ANALYTICS ----------
async function initAnalytics() {
    const data = await fetchData();
    const ctx = document.getElementById("analytics-chart").getContext("2d");
    const labels = Object.keys(data.analytics.daily);
    const values = Object.values(data.analytics.daily);
    new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets:[{label:"Daily", data: values, backgroundColor:"#4caf50"}] },
        options:{responsive:true, maintainAspectRatio:false}
    });
}

// ---------- HELPER ----------
function renderTransactionsList(list, containerId, limit=30) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    list.slice(0, limit).forEach(item => {
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.textContent = `${item.date} | ${item.amount.toLocaleString()} | ${item.category} | ${item.description}`;
        container.appendChild(div);
    });
}
