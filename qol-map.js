/* ==========================================================================
   Neighborhood choropleth — Quality of Life Explorer data (qol-data.js)
   ========================================================================== */
(function () {
  "use strict";
  if (typeof QOL === "undefined") return;

  const NS = "http://www.w3.org/2000/svg";
  const $ = (s) => document.querySelector(s);
  const tip = $("#tooltip");
  const state = { m: 0, y: null, pinned: null, top: false };
  const pathById = {};
  const juris = {};
  QOL.npas.forEach((n) => { juris[n.id] = n.j; });

  function fmt(v, f) {
    if (v === undefined || v === null || isNaN(v)) return "No data";
    if (f === "money") return "$" + Math.round(v).toLocaleString("en-US");
    if (f === "pct") return v.toFixed(1) + "%";
    if (f === "rate") return v.toFixed(1) + " per 100 units";
    return v.toLocaleString("en-US");
  }
  function fmtShort(v, f) {
    if (f === "money") return v >= 1000 && v >= 10000 ? "$" + Math.round(v / 1000) + "k" : "$" + Math.round(v).toLocaleString("en-US");
    if (f === "pct") return (v < 10 ? v.toFixed(1) : Math.round(v)) + "%";
    return v < 1 ? v.toFixed(2) : v.toFixed(1);
  }
  const placeName = (id) => {
    const j = juris[id] || [];
    return `Neighborhood ${id}` + (j.length ? ` · ${j.join(" / ")}` : "");
  };

  /* ---------- build svg once ---------- */
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${QOL.width} ${QOL.height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Map of Mecklenburg County neighborhoods shaded by the selected measure");
  const gPolys = document.createElementNS(NS, "g");
  svg.appendChild(gPolys);
  QOL.npas.forEach((n) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", n.d);
    p.setAttribute("class", "npa");
    p.dataset.id = n.id;
    gPolys.appendChild(p);
    pathById[n.id] = p;
  });
  const gLabels = document.createElementNS(NS, "g");
  QOL.labels.forEach((l) => {
    if (l.dot) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", l.x); c.setAttribute("cy", l.y); c.setAttribute("r", 5); c.setAttribute("class", "map-dot");
      gLabels.appendChild(c);
    }
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", l.dot ? l.x + 9 : l.x); t.setAttribute("y", l.dot ? l.y + 4 : l.y);
    t.setAttribute("text-anchor", l.dot ? "start" : "middle");
    t.setAttribute("class", "map-label");
    t.textContent = l.name;
    gLabels.appendChild(t);
  });
  svg.appendChild(gLabels);
  $("#qolMap").appendChild(svg);

  /* ---------- controls ---------- */
  const chips = [];
  QOL.metrics.forEach((m, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "qol-chip"; b.textContent = m.title;
    b.addEventListener("click", () => { state.m = i; state.y = null; render(); });
    $("#qolMetrics").appendChild(b);
    chips.push(b);
  });
  const slider = $("#qolYear");
  slider.addEventListener("input", () => { state.y = +slider.value; render(); });

  /* ---------- helpers ---------- */
  function current() {
    const m = QOL.metrics[state.m];
    const yi = state.y === null ? m.years.length - 1 : state.y;
    const year = m.years[yi];
    return { m, yi, year, vals: m.values[year], county: m.county[year] };
  }
  // Quintile breaks; if many neighborhoods are exactly 0, give zero its own class
  // and split the rest into quartiles.
  function quintiles(arr) {
    const s = arr.slice().sort((a, b) => a - b);
    const zeros = s.filter((v) => v === 0).length;
    if (zeros / s.length > 0.15) {
      const pos = s.filter((v) => v > 0);
      return [0, ...[0.25, 0.5, 0.75].map((q) => pos[Math.floor(q * (pos.length - 1))])];
    }
    return [0.2, 0.4, 0.6, 0.8].map((q) => s[Math.floor(q * (s.length - 1))]);
  }
  function cls(v, br) { let k = 0; while (k < br.length && v > br[k]) k++; return k; }
  function needRanked(m, vals) {
    const ids = Object.keys(vals);
    if (m.need === "low") ids.sort((a, b) => vals[a] - vals[b]);
    else ids.sort((a, b) => vals[b] - vals[a]);
    return ids;
  }

  /* ---------- render ---------- */
  function render() {
    const { m, yi, year, vals, county } = current();
    chips.forEach((c, i) => c.setAttribute("aria-pressed", String(i === state.m)));
    $("#qolTitle").textContent = m.title;
    $("#qolSubtitle").textContent = `${m.subtitle} · Mecklenburg County: ${fmt(county, m.format)}`;

    // year slider
    const wrap = $("#qolYearWrap");
    wrap.style.visibility = m.years.length > 1 ? "visible" : "hidden";
    slider.max = m.years.length - 1; slider.value = yi;
    $("#qolYearLabel").textContent = year;

    // fill
    const nums = Object.values(vals);
    const br = quintiles(nums);
    const ranked = needRanked(m, vals);
    const topSet = new Set(m.need === "neutral" ? [] : ranked.slice(0, Math.round(ranked.length * 0.1)));
    Object.entries(pathById).forEach(([id, p]) => {
      const v = vals[id];
      if (v === undefined) { p.setAttribute("class", "npa npa-nodata"); p.style.fill = ""; }
      else {
        p.style.fill = `var(--q${cls(v, br) + 1})`;
        p.setAttribute("class", "npa" + (state.top && topSet.has(id) ? " top-need" : "") + (state.pinned === id ? " pinned" : ""));
      }
    });
    if (state.top) topSet.forEach((id) => gPolys.appendChild(pathById[id]));
    if (state.pinned) gPolys.appendChild(pathById[state.pinned]);

    // legend
    const mn = Math.min(...nums), mx = Math.max(...nums);
    const edges = [mn, ...br, mx];
    let lg = "";
    for (let k = 0; k < 5; k++) {
      const label = (k === 0 && br[0] === 0 && mn === 0) ? "None" : `${fmtShort(k === 1 && br[0] === 0 ? Math.min(...nums.filter((v) => v > 0)) : edges[k], m.format)}–${fmtShort(edges[k + 1], m.format)}`;
      lg += `<div class="lg"><i style="background:var(--q${k + 1})"></i><span>${label}</span></div>`;
    }
    lg += `<div class="lg nd"><i style="background:var(--nodata)"></i><span>No data</span></div>`;
    $("#qolLegend").innerHTML = lg;

    // info panel
    const needText = m.need === "high" ? "Higher values = more pressure" : m.need === "low" ? "Lower values = more pressure" : "Context measure (neither high nor low is 'bad')";
    const sol = SOLUTIONS.find((s) => s.id === m.solution);
    $("#qolInfo").innerHTML = `
      <span class="need-tag">${needText}</span>
      <h4>Why it matters</h4>
      <p>${m.why}</p>
      <p class="muted" style="font-size:13.5px">Source: ${m.source} (via Quality of Life Explorer).${m.note ? " " + m.note : ""}</p>
      <p>Related solution: <button class="link-btn" id="qolSol">${SOLUTIONS.indexOf(sol) + 1}. ${sol.title} →</button></p>
      ${m.need === "neutral" ? "" : `<label class="toggle-row"><input type="checkbox" id="qolTop" ${state.top ? "checked" : ""}> Outline the 10% of neighborhoods with the most pressure</label>`}`;
    $("#qolSol").addEventListener("click", () => { window.selectSolution && window.selectSolution(sol.id); document.getElementById("map").scrollIntoView(); });
    const tg = $("#qolTop");
    if (tg) tg.addEventListener("change", () => { state.top = tg.checked; render(); });

    renderPinned();
    renderTable(m, vals, ranked);
  }

  function renderPinned() {
    const el = $("#qolPinned");
    const { m, year, vals, county } = current();
    if (!state.pinned) {
      el.innerHTML = `<h4>Neighborhood detail</h4><p class="muted">Tap or click a neighborhood on the map to see its numbers here.</p>`;
      return;
    }
    const id = state.pinned, v = vals[id];
    const ranked = needRanked(m, vals);
    const rank = ranked.indexOf(id) + 1;
    let trend = "";
    if (m.years.length > 1) {
      const first = m.years.find((y) => m.values[y][id] !== undefined);
      if (first && first !== year && v !== undefined) trend = `<p>In ${first}: ${fmt(m.values[first][id], m.format)} → ${year}: ${fmt(v, m.format)}</p>`;
    }
    el.innerHTML = `<h4>${placeName(id)}</h4>
      <p class="big">${fmt(v, m.format)}</p>
      <p class="muted">${m.title}, ${year} · County: ${fmt(county, m.format)}</p>
      ${v !== undefined && m.need !== "neutral" ? `<p>Ranks <b>#${rank}</b> of ${ranked.length} neighborhoods for pressure on this measure.</p>` : ""}
      ${trend}`;
  }

  function renderTable(m, vals, ranked) {
    const rows = (m.need === "neutral" ? Object.keys(vals).sort((a, b) => vals[b] - vals[a]) : ranked).slice(0, 15);
    $("#qolTable").innerHTML = `<table><caption>${m.title} (${current().year}) — ${m.need === "neutral" ? "highest values" : "most pressure first"}</caption>
      <thead><tr><th>#</th><th>Neighborhood</th><th>Value</th></tr></thead>
      <tbody>${rows.map((id, i) => `<tr><td>${i + 1}</td><td>${placeName(id)}</td><td class="num">${fmt(vals[id], m.format)}</td></tr>`).join("")}</tbody></table>`;
  }

  /* ---------- interaction ---------- */
  function moveTip(e) {
    const pad = 14; let x = e.clientX + pad, y = e.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  gPolys.addEventListener("pointerover", (e) => {
    const id = e.target.dataset && e.target.dataset.id; if (!id) return;
    const { m, year, vals } = current();
    tip.innerHTML = `<b>${placeName(id)}</b><br>${m.title} (${year}): <b>${fmt(vals[id], m.format)}</b>`;
    tip.hidden = false; moveTip(e);
  });
  gPolys.addEventListener("pointermove", moveTip);
  gPolys.addEventListener("pointerout", () => { tip.hidden = true; });
  gPolys.addEventListener("click", (e) => {
    const id = e.target.dataset && e.target.dataset.id; if (!id) return;
    state.pinned = state.pinned === id ? null : id;
    render();
  });

  render();
})();
