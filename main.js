const API_URL = "https://script.google.com/macros/s/AKfycbxbWaIPKFy6Ei52Qs6ZqMfgEhylJeuC93AQOBMQl6v_HX8GSfPSiYXWpvPDmq68ddlAjA/exec";

document.addEventListener("DOMContentLoaded", loadHome);

async function loadHome() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    renderSummary(data);
    renderTransactions(data.transactions);

  } catch (err) {
    console.error("Load home error:", err);
  }
}

function renderSummary(data) {
  // total balance
  document.getElementById("totalBalance").innerText =
    formatMoney(data.totalBalance);

  // monthly summary (latest month)
  document.getElementById("income").innerText =
    formatMoney(data.monthly.income);

  document.getElementById("expense").innerText =
    formatMoney(data.monthly.expense);

  document.getElementById("balance").innerText =
    formatMoney(data.monthly.balance);
}

function renderTransactions(list) {
  const container = document.getElementById("transactionList");
  container.innerHTML = "";

  list.forEach(tx => {
    const row = document.createElement("div");
    row.className = "tx-row";

    row.innerHTML = `
      <div class="tx-top">
        <span class="tx-date">${formatDate(tx.date)}</span>
        <span class="tx-amount ${tx.type}">
          ${tx.type === "income" ? "+" : "-"}฿${tx.amount}
        </span>
      </div>
      <div class="tx-bottom">
        ${tx.category} · ${tx.note || ""}
      </div>
    `;

    container.appendChild(row);
  });
}

function formatMoney(n) {
  return "฿" + Number(n).toLocaleString();
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
