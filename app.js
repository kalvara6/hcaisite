/* ==========================================================================
   HomeMap CLT — interactivity (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (n) => n.toLocaleString("en-US");

  function svgEl(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, attrs = {}, html) {
    const e = document.createElement(tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function srcLinks(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    return list.map((k) => {
      const s = SOURCES[k];
      const n = sourceOrder.indexOf(k) + 1;
      return `<a class="src-link" href="${s.url}" target="_blank" rel="noopener" title="${s.label}">[${n}]</a>`;
    }).join(" ");
  }

  /* ---------- source numbering (stable order of first use) ---------- */
  const sourceOrder = Object.keys(SOURCES);

  /* ---------- tooltip ---------- */
  const tip = $("#tooltip");
  function showTip(html, evt) {
    tip.innerHTML = html;
    tip.hidden = false;
    moveTip(evt);
  }
  function moveTip(evt) {
    const pad = 14;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function hideTip() { tip.hidden = true; }
  function bindTip(node, html, onEnter, onLeave) {
    node.addEventListener("pointerenter", (e) => { showTip(html, e); onEnter && onEnter(); });
    node.addEventListener("pointermove", moveTip);
    node.addEventListener("pointerleave", () => { hideTip(); onLeave && onLeave(); });
  }

  /* ---------- hero stats ---------- */
  const heroStats = $("#heroStats");
  STATS.forEach((s) => {
    const d = h("div", { class: "stat" });
    d.innerHTML = `<span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span><span class="stat-src">Source ${srcLinks(s.src)}</span>`;
    heroStats.appendChild(d);
  });

  /* ---------- chart helpers ---------- */
  const W = 480, H = 250, M = { t: 24, r: 16, b: 32, l: 48 };
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;

  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * p;
  }
  function frame(container, maxV, ticks = 4) {
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}` });
    const g = svgEl("g", { transform: `translate(${M.l},${M.t})` }, svg);
    const y = (v) => innerH - (v / maxV) * innerH;
    for (let i = 0; i <= ticks; i++) {
      const v = (maxV / ticks) * i;
      if (i > 0) svgEl("line", { class: "gridline", x1: 0, x2: innerW, y1: y(v), y2: y(v) }, g);
      const t = svgEl("text", { class: "tick-label", x: -8, y: y(v) + 4, "text-anchor": "end" }, g);
      t.textContent = v >= 1000 ? (v / 1000) + "k" : fmt(v);
    }
    svgEl("line", { class: "baseline", x1: 0, x2: innerW, y1: innerH, y2: innerH }, g);
    container.appendChild(svg);
    return { svg, g, y };
  }
  // bar path with 4px rounded top corners only, anchored to baseline
  function barPath(x, yTop, w, hgt, r = 4) {
    r = Math.min(r, w / 2, hgt);
    const yb = yTop + hgt;
    return `M${x},${yb} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + w - r} Q${x + w},${yTop} ${x + w},${yTop + r} V${yb} Z`;
  }

  /* ---------- Chart 1: unsheltered line ---------- */
  (function () {
    const c = $("#chartUnsheltered .chart");
    const maxV = 600;
    const { g, y } = frame(c, maxV, 3);
    const years = UNSHELTERED.map((d) => d.year);
    const x0 = 2020, x1 = 2026;
    const x = (yr) => ((yr - x0) / (x1 - x0)) * innerW;
    // year ticks
    for (let yr = x0; yr <= x1; yr++) {
      const t = svgEl("text", { class: "tick-label", x: x(yr), y: innerH + 20, "text-anchor": "middle" }, g);
      t.textContent = yr;
    }
    // gap: dashed segment 2020→2023 (no comparable data between)
    const p0 = UNSHELTERED[0], p1 = UNSHELTERED[1];
    svgEl("path", { d: `M${x(p0.year)},${y(p0.value)} L${x(p1.year)},${y(p1.value)}`, class: "series-line", "stroke-dasharray": "4 6", opacity: 0.6 }, g);
    const rest = UNSHELTERED.slice(1);
    svgEl("path", { d: "M" + rest.map((d) => `${x(d.year)},${y(d.value)}`).join(" L"), class: "series-line" }, g);
    UNSHELTERED.forEach((d, i) => {
      svgEl("circle", { class: "series-dot", cx: x(d.year), cy: y(d.value), r: 5 }, g);
      if (i === 0 || i === UNSHELTERED.length - 1) {
        const t = svgEl("text", { class: "val-label", x: x(d.year), y: y(d.value) - 12, "text-anchor": i === 0 ? "start" : "end" }, g);
        t.textContent = fmt(d.value);
      }
    });
    // hit targets per point
    UNSHELTERED.forEach((d) => {
      const hit = svgEl("rect", { class: "hit", x: x(d.year) - 26, y: 0, width: 52, height: innerH }, g);
      const prev = UNSHELTERED[UNSHELTERED.indexOf(d) - 1];
      const chg = prev ? ` <br>${d.value > prev.value ? "+" : ""}${Math.round(((d.value - prev.value) / prev.value) * 100)}% vs. ${prev.year}` : "";
      bindTip(hit, `<b>${d.year}</b><br>${fmt(d.value)} people unsheltered${chg}`);
    });
  })();

  /* ---------- Chart 2: PIT stacked bars ---------- */
  (function () {
    const c = $("#chartPIT .chart");
    const maxV = 2500;
    const { g, y } = frame(c, maxV, 5);
    const band = innerW / PIT.length, bw = Math.min(84, band * 0.5);
    PIT.forEach((d, i) => {
      const cx = band * i + band / 2, x = cx - bw / 2;
      const yS = y(d.sheltered), hS = innerH - yS;
      const yU = y(d.sheltered + d.unsheltered), hU = yS - yU - 2; // 2px surface gap
      const grp = svgEl("g", {}, g);
      svgEl("rect", { class: "bar-1", x, y: yS, width: bw, height: hS }, grp);
      svgEl("path", { class: "bar-2", d: barPath(x, yU, bw, hU) }, grp);
      const lbl = svgEl("text", { class: "val-label", x: cx, y: yU - 8, "text-anchor": "middle" }, g);
      lbl.textContent = fmt(d.total);
      const t = svgEl("text", { class: "tick-label", x: cx, y: innerH + 20, "text-anchor": "middle" }, g);
      t.textContent = d.year;
      const hit = svgEl("rect", { class: "hit", x: cx - band / 2 + 4, y: 0, width: band - 8, height: innerH }, g);
      bindTip(hit, `<b>January ${d.year}</b><br>Total: <b>${fmt(d.total)}</b><br>Sheltered: ${fmt(d.sheltered)}<br>Unsheltered: ${fmt(d.unsheltered)}`);
    });
  })();

  /* ---------- Generic single-series bar ---------- */
  function simpleBars(sel, rows, maxV, ticks, tipFn) {
    const c = $(sel + " .chart");
    const { g, y } = frame(c, maxV, ticks);
    const band = innerW / rows.length, bw = Math.min(72, band * 0.5);
    rows.forEach((d) => {
      const i = rows.indexOf(d);
      const cx = band * i + band / 2, x = cx - bw / 2, yy = y(d.value);
      svgEl("path", { class: "bar-1", d: barPath(x, yy, bw, innerH - yy) }, g);
      const lbl = svgEl("text", { class: "val-label", x: cx, y: yy - 8, "text-anchor": "middle" }, g);
      lbl.textContent = d.display || fmt(d.value);
      const t = svgEl("text", { class: "tick-label", x: cx, y: innerH + 20, "text-anchor": "middle" }, g);
      t.textContent = d.label || d.year;
      const hit = svgEl("rect", { class: "hit", x: cx - band / 2 + 4, y: 0, width: band - 8, height: innerH }, g);
      bindTip(hit, tipFn(d, i));
    });
  }
  simpleBars("#chartOneNumber", ONE_NUMBER, 3000, 3, (d, i) => {
    const p = ONE_NUMBER[i - 1];
    const chg = p ? `<br>${d.value > p.value ? "+" : ""}${Math.round(((d.value - p.value) / p.value) * 100)}% vs. ${p.label}` : "";
    return `<b>${d.label}</b><br>${fmt(d.value)} people${chg}`;
  });
  simpleBars("#chartEvictions", EVICTIONS.map((d) => ({ ...d, display: d.year === "2025" ? "52,000+" : fmt(d.value) })), 60000, 3,
    (d) => `<b>${d.year}</b><br>${d.display} filings<br>${d.note}`);

  /* ---------- data tables ---------- */
  (function () {
    const wrap = $("#dataTables");
    const grid = h("div", { class: "tables-grid" });
    grid.innerHTML = `
      <table><caption>Point-in-Time Count</caption>
        <thead><tr><th>Year</th><th>Sheltered</th><th>Unsheltered</th><th>Total</th><th>Source</th></tr></thead>
        <tbody>${PIT.map((d) => `<tr><td>${d.year}</td><td class="num">${fmt(d.sheltered)}</td><td class="num">${fmt(d.unsheltered)}</td><td class="num">${fmt(d.total)}</td><td>${srcLinks(d.src)}</td></tr>`).join("")}</tbody></table>
      <table><caption>Unsheltered (PIT)</caption>
        <thead><tr><th>Year</th><th>People</th><th>Source</th></tr></thead>
        <tbody>${UNSHELTERED.map((d) => `<tr><td>${d.year}</td><td class="num">${fmt(d.value)}</td><td>${srcLinks(d.src)}</td></tr>`).join("")}</tbody></table>
      <table><caption>One Number (June)</caption>
        <thead><tr><th>Month</th><th>People</th><th>Source</th></tr></thead>
        <tbody>${ONE_NUMBER.map((d) => `<tr><td>${d.label}</td><td class="num">${fmt(d.value)}</td><td>${srcLinks(d.src)}</td></tr>`).join("")}</tbody></table>
      <table><caption>Eviction filings</caption>
        <thead><tr><th>Year</th><th>Filed</th><th>Note</th><th>Source</th></tr></thead>
        <tbody>${EVICTIONS.map((d) => `<tr><td>${d.year}</td><td class="num">${d.year === "2025" ? "52,000+" : fmt(d.value)}</td><td>${d.note}</td><td>${srcLinks(d.src)}</td></tr>`).join("")}</tbody></table>`;
    wrap.appendChild(grid);
  })();

  /* ---------- journey ---------- */
  (function () {
    const list = $("#journeyList"), detail = $("#journeyDetail");
    const buttons = [];
    function select(i) {
      buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
      const s = JOURNEY[i];
      const sol = SOLUTIONS.find((x) => x.id === s.solution);
      detail.innerHTML = `
        <div><h4>Stage ${i + 1} · ${s.step}</h4><p class="quote">${s.feel}</p></div>
        <div><h4>What the data shows</h4><p>${s.fact} ${srcLinks(s.src)}</p></div>
        <div><h4>Where we could step in</h4><p><button class="link-btn" data-sol="${sol.id}">${sol.title} →</button><br><span class="muted">${sol.summary.split(". ")[0].replace(/\.$/, "")}.</span></p></div>`;
      detail.querySelector("[data-sol]").addEventListener("click", () => {
        selectMap({ type: "solution", id: sol.id });
        document.getElementById("map").scrollIntoView();
      });
    }
    JOURNEY.forEach((s, i) => {
      const li = h("li");
      const b = h("button", { type: "button", "aria-pressed": "false" }, `<span class="node">${i + 1}</span><span>${s.step}</span>`);
      b.addEventListener("click", () => select(i));
      buttons.push(b);
      li.appendChild(b);
      list.appendChild(li);
    });
    select(2);
  })();

  /* ---------- solution map ---------- */
  const causeCol = $("#causeCol"), solCol = $("#solutionCol"), linksSvg = $("#mapLinks"), panel = $("#detailPanel");
  const nodeEls = {};
  let selection = { type: "solution", id: "s1" };

  CAUSES.forEach((c) => {
    const n = SOLUTIONS.filter((s) => s.causes.includes(c.id)).length;
    const b = h("button", { type: "button", class: "node-btn cause" }, `<span>${c.title}</span><small>${n} solutions</small>`);
    b.addEventListener("click", () => selectMap({ type: "cause", id: c.id }));
    causeCol.appendChild(b);
    nodeEls[c.id] = b;
  });
  SOLUTIONS.forEach((s, i) => {
    const b = h("button", { type: "button", class: "node-btn solution" }, `<span>${i + 1}. ${s.title}</span><small>${s.tag}</small>`);
    b.addEventListener("click", () => selectMap({ type: "solution", id: s.id }));
    solCol.appendChild(b);
    nodeEls[s.id] = b;
  });

  const edges = [];
  SOLUTIONS.forEach((s) => s.causes.forEach((c) => edges.push({ c, s: s.id })));

  function drawLinks() {
    linksSvg.innerHTML = "";
    if (getComputedStyle(linksSvg).display === "none") return;
    const shell = linksSvg.parentElement.getBoundingClientRect();
    const svgBox = linksSvg.getBoundingClientRect();
    linksSvg.setAttribute("viewBox", `0 0 ${svgBox.width} ${svgBox.height}`);
    edges.forEach((e) => {
      const a = nodeEls[e.c].getBoundingClientRect(), b = nodeEls[e.s].getBoundingClientRect();
      const x1 = a.right - svgBox.left, y1 = a.top + a.height / 2 - svgBox.top;
      const x2 = b.left - svgBox.left, y2 = b.top + b.height / 2 - svgBox.top;
      const mx = (x1 + x2) / 2;
      const p = svgEl("path", { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` }, linksSvg);
      p.dataset.c = e.c; p.dataset.s = e.s;
    });
    paintLinks();
    void shell;
  }
  function paintLinks() {
    linksSvg.querySelectorAll("path").forEach((p) => {
      const on = selection.type === "cause" ? p.dataset.c === selection.id : p.dataset.s === selection.id;
      p.classList.toggle("on", on);
      p.classList.toggle("off", !on);
    });
  }

  function selectMap(sel) {
    selection = sel;
    let related;
    if (sel.type === "cause") {
      related = new Set([sel.id, ...SOLUTIONS.filter((s) => s.causes.includes(sel.id)).map((s) => s.id)]);
    } else {
      const s = SOLUTIONS.find((x) => x.id === sel.id);
      related = new Set([sel.id, ...s.causes]);
    }
    Object.entries(nodeEls).forEach(([id, el]) => {
      el.classList.toggle("active", id === sel.id);
      el.classList.toggle("dim", !related.has(id));
      el.setAttribute("aria-pressed", String(id === sel.id));
    });
    paintLinks();
    renderPanel();
  }

  function renderPanel() {
    if (selection.type === "cause") {
      const c = CAUSES.find((x) => x.id === selection.id);
      const sols = SOLUTIONS.filter((s) => s.causes.includes(c.id));
      panel.innerHTML = `
        <span class="tag" style="background:color-mix(in srgb, var(--series-2) 18%, transparent);color:var(--ink)">Root cause</span>
        <h3>${c.title}</h3>
        <p class="summary">${c.detail} ${srcLinks(c.src)}</p>
        <div class="detail-grid"><div><h4>Solutions that address this</h4>
          <p>${sols.map((s) => `<button class="link-btn" data-sol="${s.id}">${SOLUTIONS.indexOf(s) + 1}. ${s.title}</button>`).join(" &nbsp;·&nbsp; ")}</p></div></div>`;
      panel.querySelectorAll("[data-sol]").forEach((b) => b.addEventListener("click", () => selectMap({ type: "solution", id: b.dataset.sol })));
    } else {
      const s = SOLUTIONS.find((x) => x.id === selection.id);
      const causes = s.causes.map((id) => CAUSES.find((c) => c.id === id).title);
      panel.innerHTML = `
        <span class="tag">${s.tag}</span>
        <h3>${SOLUTIONS.indexOf(s) + 1}. ${s.title}</h3>
        <p class="summary">${s.summary}</p>
        <div class="detail-grid">
          <div><h4>Where AI helps</h4><p>${s.ai}</p></div>
          <div><h4>Where people stay in charge</h4><p>${s.human}</p></div>
          <div><h4>Safeguards</h4><p>${s.safeguards}</p></div>
          <div><h4>How we'd measure success</h4><p>${s.measure}</p></div>
          <div><h4>Addresses</h4><p>${causes.join(" · ")}</p></div>
        </div>
        ${s.precedent ? `<div class="precedent"><b>Already happening:</b> ${s.precedent} ${srcLinks(s.precedentSrc)}</div>` : ""}`;
    }
  }

  /* ---------- HCAI matrix (automation × human control) ---------- */
  (function () {
    const c = $("#hcaiMatrix");
    const MW = 640, MH = 360, m = { t: 12, r: 16, b: 44, l: 40 };
    const iw = MW - m.l - m.r, ih = MH - m.t - m.b;
    const svg = svgEl("svg", { viewBox: `0 0 ${MW} ${MH}` });
    const g = svgEl("g", { transform: `translate(${m.l},${m.t})` }, svg);
    const x = (v) => v * iw, y = (v) => ih - v * ih;
    svgEl("rect", { class: "quad-good", x: x(0.5), y: 0, width: iw / 2, height: ih / 2, rx: 6 }, g);
    svgEl("line", { class: "gridline", x1: x(0.5), x2: x(0.5), y1: 0, y2: ih }, g);
    svgEl("line", { class: "gridline", x1: 0, x2: iw, y1: y(0.5), y2: y(0.5) }, g);
    svgEl("line", { class: "baseline", x1: 0, x2: iw, y1: ih, y2: ih }, g);
    svgEl("line", { class: "baseline", x1: 0, x2: 0, y1: 0, y2: ih }, g);
    const q = [
      [x(0.75), y(0.5) - 12, "Reliable, safe & trustworthy"],
      [x(0.25), y(0.5) - 12, "Human-led, low automation"],
      [x(0.75), ih - 10, "Risk: excessive automation"],
      [x(0.25), ih - 10, "Low value"]
    ];
    q.forEach(([qx, qy, t]) => { const e = svgEl("text", { class: "quad-label", x: qx, y: qy, "text-anchor": "middle" }, g); e.textContent = t; });
    const xl = svgEl("text", { class: "tick-label", x: iw / 2, y: ih + 30, "text-anchor": "middle" }, g); xl.textContent = "Level of automation →";
    const yl = svgEl("text", { class: "tick-label", transform: `translate(-16,${ih / 2}) rotate(-90)`, "text-anchor": "middle" }, g); yl.textContent = "Level of human control →";
    ["Low", "High"].forEach((t, i) => {
      const a = svgEl("text", { class: "tick-label", x: i ? iw : 0, y: ih + 14, "text-anchor": i ? "end" : "start" }, g); a.textContent = t;
    });
    SOLUTIONS.forEach((s, i) => {
      const cx = x(s.automation), cy = y(s.control);
      const grp = svgEl("g", { style: "cursor:pointer" }, g);
      svgEl("circle", { class: "m-dot", cx, cy, r: 11 }, grp);
      const n = svgEl("text", { x: cx, y: cy + 4, "text-anchor": "middle", fill: "#fff", "font-size": "11", "font-weight": "700", "pointer-events": "none" }, grp);
      n.textContent = i + 1;
      bindTip(grp, `<b>${i + 1}. ${s.title}</b><br>${s.tag}`);
      grp.addEventListener("click", () => selectMap({ type: "solution", id: s.id }));
    });
    c.appendChild(svg);
  })();

  /* ---------- navigator prototype ---------- */
  (function () {
    const choices = $("#navChoices"), result = $("#navResult");
    const btns = [];
    NAVIGATOR.forEach((n) => {
      const b = h("button", { type: "button", class: "choice", "aria-pressed": "false" }, n.label);
      b.addEventListener("click", () => {
        btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        result.innerHTML = n.steps.map((rid, i) => {
          const r = RESOURCES[rid];
          return `<div class="res"><b>${i + 1}. ${r.name}</b><span class="contact">${r.contact}</span><small>${r.note}</small></div>`;
        }).join("") + `<p class="tip">💬 ${n.tip}</p>`;
      });
      btns.push(b);
      choices.appendChild(b);
    });
  })();

  /* ---------- sources list ---------- */
  (function () {
    const ol = $("#sourceList");
    sourceOrder.forEach((k) => {
      const s = SOURCES[k];
      ol.appendChild(h("li", {}, `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`));
    });
  })();

  /* ---------- theme toggle ---------- */
  (function () {
    const root = document.documentElement, btn = $("#themeToggle");
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    if (saved) root.setAttribute("data-theme", saved);
    btn.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      const next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  })();

  /* ---------- init map ---------- */
  window.selectSolution = (id) => selectMap({ type: "solution", id });
  selectMap(selection);
  drawLinks();
  let rT;
  window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(drawLinks, 120); });
  if (document.fonts) document.fonts.ready.then(drawLinks);
})();
