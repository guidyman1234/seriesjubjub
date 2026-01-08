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
