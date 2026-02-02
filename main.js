/* ================= ANALYTICS ================= */
let ANALYTICS_TX = [];
let CAT_CHART = null;
let MONTH_CHART = null;

async function initAnalytics() {
  const data = await fetchData();
  ANALYTICS_TX = data.allTransactions || [];
  if (ANALYTICS_TX.length === 0) return;

  initAnalyticsSelectors();
  renderAnalytics();
}

/* ===== SELECTORS ===== */
function initAnalyticsSelectors() {
  const yearEl = document.getElementById("analytics-year");
  const monthEl = document.getElementById("analytics-month");
  const locEl = document.getElementById("analytics-location");
  const catEl = document.getElementById("analytics-category");

  const dates = ANALYTICS_TX.map(t => new Date(t.date));
  const years = [...new Set(dates.map(d => d.getFullYear()))].sort((a,b)=>b-a);

  yearEl.innerHTML = "";
  years.forEach(y => yearEl.add(new Option(y, y)));

  function updateMonths() {
    const y = Number(yearEl.value);
    const months = [...new Set(
      dates.filter(d => d.getFullYear() === y).map(d => d.getMonth()+1)
    )].sort((a,b)=>b-a);

    monthEl.innerHTML = "";
    months.forEach(m => monthEl.add(new Option(`เดือน ${m}`, m)));
  }

  yearEl.onchange = () => {
    updateMonths();
    renderAnalytics();
  };
  monthEl.onchange = renderAnalytics;
  locEl.onchange = renderAnalytics;
  catEl.onchange = renderAnalytics;

  yearEl.value = years[0];
  updateMonths();
}

/* ===== MAIN RENDER ===== */
function renderAnalytics() {
  const y = Number(document.getElementById("analytics-year").value);
  const m = Number(document.getElementById("analytics-month").value);
  const loc = document.getElementById("analytics-location").value;
  const cat = document.getElementById("analytics-category").value;

  // 🔹 เดือน + location (ภาพรวม)
  const monthTx = ANALYTICS_TX.filter(t => {
    const d = new Date(t.date);
    return (
      d.getFullYear() === y &&
      d.getMonth()+1 === m &&
      (!loc || t.location === loc)
    );
  });

  populateLocationSelector(monthTx);
  renderMonthlyChart(monthTx);
  renderCategoryChart(monthTx);

  // 🔹 list = category filter
  const listTx = cat
    ? monthTx.filter(t => t.category === cat)
    : monthTx;

  renderTransactionList(listTx, cat);
}

/* ===== LOCATION SELECT ===== */
function populateLocationSelector(tx) {
  const locEl = document.getElementById("analytics-location");
  const current = locEl.value;

  const locations = [...new Set(
    tx.map(t => t.location).filter(Boolean)
  )];

  locEl.innerHTML = `<option value="">All Locations</option>`;
  locations.forEach(l => locEl.add(new Option(l, l)));

  if (locations.includes(current)) locEl.value = current;
}

/* ===== CATEGORY PIE ===== */
function renderCategoryChart(tx) {
  const map = {};
  tx.forEach(t => {
    if (t.amount < 0) {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(map);
  const values = Object.values(map);

  const catEl = document.getElementById("analytics-category");
  catEl.innerHTML = `<option value="">All Categories</option>`;
  labels.forEach(c => catEl.add(new Option(c, c)));

  const ctx = document.getElementById("categoryChart");
  if (CAT_CHART) CAT_CHART.destroy();

  CAT_CHART = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: c => `${c.label}: ฿${c.parsed.toLocaleString()}`
          }
        }
      },
      onClick: (_, el) => {
        if (!el.length) return;
        catEl.value = labels[el[0].index];
        renderAnalytics();
      }
    }
  });
}

/* ===== MONTHLY SUMMARY ===== */
function renderMonthlyChart(tx) {
  let income = 0, expense = 0;
  tx.forEach(t => {
    if (t.amount >= 0) income += t.amount;
    else expense += Math.abs(t.amount);
  });

  const ctx = document.getElementById("monthlyChart");
  if (MONTH_CHART) MONTH_CHART.destroy();

  MONTH_CHART = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: c => `฿${c.parsed.y.toLocaleString()}`
          }
        }
      }
    }
  });
}

/* ===== TRANSACTION LIST ===== */
function renderTransactionList(tx, category) {
  const el = document.getElementById("categoryTxList");
  const title = document.getElementById("categoryTitle");

  el.innerHTML = "";

  title.textContent = category
    ? `Transactions: ${category}`
    : "Transactions";

  if (tx.length === 0) {
    el.innerHTML = "<p>ไม่มีข้อมูล</p>";
    return;
  }

  tx.forEach(t => {
    const div = document.createElement("div");
    div.className = "tx-row";
    div.innerHTML = `
      <div class="tx-top">
        <span class="tx-date">${t.date}</span>
        <span class="tx-amount ${t.amount>=0?'tx-plus':'tx-minus'}">
          ฿${Math.abs(t.amount).toLocaleString()}
        </span>
      </div>
      <div class="tx-desc">
        ${t.category} · ${t.location || ""} ${t.description ? "· "+t.description : ""}
      </div>
    `;
    el.appendChild(div);
  });
}
