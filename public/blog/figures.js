/* Interactive figures for the CADe non-inferiority blog post.
   Three widgets, each self-contained:
     1. rocFigure()         — two draggable operating points on ROC axes
     2. stepFigure()        — physician estimate vs. true probability, movable threshold
     3. calculator()        — THR non-inferiority vacuity calculator
   Plain DOM + SVG, no dependencies. */

(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const fmtPct = (x, d = 1) => (100 * x).toFixed(d) + "%";
  const fmt = (x, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : "—");
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  function el(tag, attrs = {}, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Shared plotting frame: unit square mapped into an SVG with margins. */
  function makeFrame(svg, opts) {
    const { w = 460, h = 440, mL = 46, mR = 20, mT = 36, mB = 44 } = opts;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const x = (u) => mL + u * (w - mL - mR);
    const y = (v) => h - mB - v * (h - mT - mB);
    const invX = (px) => (px - mL) / (w - mL - mR);
    const invY = (py) => (h - mB - py) / (h - mT - mB);
    // convert pointer event into unit coordinates
    function toUnit(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { u: invX(p.x), v: invY(p.y) };
    }
    return { w, h, mL, mR, mT, mB, x, y, toUnit };
  }

  function drawAxes(svg, f, xTitle, yTitle, xTicks, yTicks) {
    const g = el("g", {}, svg);
    el("line", { class: "axis", x1: f.x(0), y1: f.y(0), x2: f.x(1.04), y2: f.y(0) }, g);
    el("line", { class: "axis", x1: f.x(0), y1: f.y(0), x2: f.x(0), y2: f.y(1.04) }, g);
    for (const t of xTicks) {
      el("line", { class: "axis", x1: f.x(t.v), y1: f.y(0), x2: f.x(t.v), y2: f.y(0) + 5 }, g);
      const lbl = el("text", { class: "tick-label", x: f.x(t.v), y: f.y(0) + 17, "text-anchor": "middle" }, g);
      lbl.textContent = t.l;
    }
    for (const t of yTicks) {
      el("line", { class: "axis", x1: f.x(0), y1: f.y(t.v), x2: f.x(0) - 5, y2: f.y(t.v) }, g);
      const lbl = el("text", { class: "tick-label", x: f.x(0) - 8, y: f.y(t.v) + 4, "text-anchor": "end" }, g);
      lbl.textContent = t.l;
    }
    const xt = el("text", { class: "axis-title", x: f.x(1.04), y: f.y(0) + 34, "text-anchor": "end" }, g);
    xt.textContent = xTitle;
    const yt = el("text", { class: "axis-title", x: f.x(0) - 4, y: f.y(1.04) - 4, "text-anchor": "start" }, g);
    yt.textContent = yTitle;
  }

  /* Monotone cubic (Fritsch–Carlson) through sorted points → SVG path. Keeps the
     curve non-decreasing, which is exactly the ROC constraint we want to show. */
  function monotonePath(pts, f) {
    const n = pts.length;
    if (n < 2) return "";
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) {
      const dx = xs[i + 1] - xs[i];
      d.push(dx > 1e-9 ? (ys[i + 1] - ys[i]) / dx : 0);
    }
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(d[i]) < 1e-9) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    let path = `M ${f.x(xs[0])} ${f.y(ys[0])}`;
    for (let i = 0; i < n - 1; i++) {
      const dx = xs[i + 1] - xs[i];
      if (dx < 1e-9) { path += ` L ${f.x(xs[i + 1])} ${f.y(ys[i + 1])}`; continue; }
      const c1x = xs[i] + dx / 3, c1y = ys[i] + (m[i] * dx) / 3;
      const c2x = xs[i + 1] - dx / 3, c2y = ys[i + 1] - (m[i + 1] * dx) / 3;
      path += ` C ${f.x(c1x)} ${f.y(c1y)}, ${f.x(c2x)} ${f.y(c2y)}, ${f.x(xs[i + 1])} ${f.y(ys[i + 1])}`;
    }
    return path;
  }

  function samplePath(fn, f, n = 60) {
    let p = "";
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      p += (i ? " L " : "M ") + f.x(u) + " " + f.y(fn(u));
    }
    return p;
  }

  /* Generic drag helper for an SVG group. */
  function makeDraggable(target, svg, onMove) {
    let active = false;
    target.addEventListener("pointerdown", (e) => { active = true; target.setPointerCapture(e.pointerId); e.preventDefault(); });
    target.addEventListener("pointermove", (e) => { if (active) onMove(e); });
    const stop = (e) => { active = false; try { target.releasePointerCapture(e.pointerId); } catch (_) {} };
    target.addEventListener("pointerup", stop);
    target.addEventListener("pointercancel", stop);
  }

  /* =========================================================================
     1. ROC figure: two draggable operating points
     ========================================================================= */
  function rocFigure(root) {
    const svg = root.querySelector("svg");
    const verdict = root.querySelector(".verdict");
    const readout = root.querySelector(".readout");
    const f = makeFrame(svg, { w: 460, h: 440 });
    const ticks = [{ v: 0, l: "0" }, { v: 0.5, l: "0.5" }, { v: 1, l: "1" }];

    // background: chance line + the two reference curves from the paper
    el("line", { class: "chance", x1: f.x(0), y1: f.y(0), x2: f.x(1), y2: f.y(1) }, svg);
    el("path", { class: "ref-curve", d: samplePath((u) => Math.pow(u, 0.5), f) }, svg);
    el("path", { class: "ref-curve", d: samplePath((u) => Math.pow(u, 0.22), f) }, svg);
    drawAxes(svg, f, "false positive rate", "true positive rate", ticks, ticks);

    const fit = el("path", { class: "fit-curve", d: "" }, svg);
    const link = el("line", { class: "link-line" }, svg);

    const state = { A: { u: 0.30, v: 0.548 }, B: { u: 0.15, v: 0.659 } };

    function makePoint(key, label) {
      const g = el("g", { class: `pt pt-${key}`, tabindex: 0, role: "slider", "aria-label": `${label} operating point` }, svg);
      el("circle", { class: "pt-halo", r: 18 }, g);
      el("circle", { class: "pt-dot", r: 7 }, g);
      const t = el("text", { class: "pt-label", dx: 11, dy: -9 }, g);
      t.textContent = label;
      makeDraggable(g, svg, (e) => {
        const { u, v } = f.toUnit(e);
        state[key] = { u: clamp(u, 0, 1), v: clamp(v, 0, 1) };
        render();
      });
      // keyboard nudging for accessibility
      g.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 0.05 : 0.01;
        const p = state[key];
        if (e.key === "ArrowLeft") p.u = clamp(p.u - step, 0, 1);
        else if (e.key === "ArrowRight") p.u = clamp(p.u + step, 0, 1);
        else if (e.key === "ArrowUp") p.v = clamp(p.v + step, 0, 1);
        else if (e.key === "ArrowDown") p.v = clamp(p.v - step, 0, 1);
        else return;
        e.preventDefault();
        render();
      });
      return g;
    }
    const gA = makePoint("A", "control");
    const gB = makePoint("B", "AI");

    function render() {
      const { A, B } = state;
      gA.setAttribute("transform", `translate(${f.x(A.u)} ${f.y(A.v)})`);
      gB.setAttribute("transform", `translate(${f.x(B.u)} ${f.y(B.v)})`);
      link.setAttribute("x1", f.x(A.u)); link.setAttribute("y1", f.y(A.v));
      link.setAttribute("x2", f.x(B.u)); link.setAttribute("y2", f.y(B.v));

      const dFP = B.u - A.u, dTP = B.v - A.v;
      const eps = 1e-9;
      const same = Math.abs(dFP) < eps && Math.abs(dTP) < eps;
      const bUpLeft = dFP <= eps && dTP >= -eps && !same;   // AI point up-and-left of control
      const bDownRight = dFP >= -eps && dTP <= eps && !same; // control point up-and-left of AI

      verdict.className = "verdict";
      if (same) {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Identical operating points</span>Nothing changed between arms. Drag one of the points.`;
        fit.setAttribute("d", "");
      } else if (bUpLeft) {
        verdict.classList.add("good");
        verdict.innerHTML = `<span class="title">Cannot lie on the same ROC curve</span>The AI point has a higher true-positive rate and a lower false-positive rate. An ROC curve can only move up and to the right as the threshold loosens, so no single curve passes through both. The shift must be a change in skill.`;
        fit.setAttribute("d", "");
      } else if (bDownRight) {
        verdict.classList.add("bad");
        verdict.innerHTML = `<span class="title">Cannot lie on the same ROC curve</span>Here it is the control point that sits up-and-left. No monotone curve passes through both, so the AI arm is strictly worse: skill went down, not just the threshold.`;
        fit.setAttribute("d", "");
      } else {
        verdict.classList.add("warn");
        verdict.innerHTML = `<span class="title">A single ROC curve fits both points</span>One point is up-and-right of the other, so a valid monotone curve passes through both (drawn in black). The shift could be a pure threshold change, or a change in skill. Two points cannot tell them apart.`;
        const lo = A.u <= B.u ? A : B, hi = lo === A ? B : A;
        fit.setAttribute("d", monotonePath([[0, 0], [lo.u, lo.v], [hi.u, hi.v], [1, 1]], f));
      }

      const slope = Math.abs(dTP) < eps ? (Math.abs(dFP) < eps ? NaN : Infinity * Math.sign(dFP)) : dFP / dTP;
      readout.innerHTML =
        `control (FPR, TPR) = (${A.u.toFixed(2)}, ${A.v.toFixed(2)}) &nbsp;·&nbsp; ` +
        `AI = (${B.u.toFixed(2)}, ${B.v.toFixed(2)})<br>` +
        `ΔFPR = ${(dFP >= 0 ? "+" : "") + dFP.toFixed(2)}, ΔTPR = ${(dTP >= 0 ? "+" : "") + dTP.toFixed(2)}, ` +
        `Δ<sub>AI</sub> = ΔFP/ΔTP = ${Number.isFinite(slope) ? slope.toFixed(2) : (Number.isNaN(slope) ? "undefined" : (slope > 0 ? "+∞" : "−∞"))}`;
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [au, av, bu, bv] = btn.dataset.preset.split(",").map(Number);
        state.A = { u: au, v: av }; state.B = { u: bu, v: bv };
        render();
      });
    });
    render();
  }

  /* =========================================================================
     2. Step-function figure: estimate vs. truth with a movable threshold
     ========================================================================= */
  function stepFigure(root) {
    const svg = root.querySelector("svg");
    const slider = root.querySelector("input[type=range]");
    const zetaOut = root.querySelector("[data-zeta]");
    const cells = {
      tp: root.querySelector("[data-cell=tp]"), fp: root.querySelector("[data-cell=fp]"),
      fn: root.querySelector("[data-cell=fn]"), tn: root.querySelector("[data-cell=tn]"),
    };
    const deltas = {
      tp: root.querySelector("[data-delta=tp]"), fp: root.querySelector("[data-delta=fp]"),
      fn: root.querySelector("[data-delta=fn]"), tn: root.querySelector("[data-delta=tn]"),
    };
    const thrOut = root.querySelector("[data-thr]");
    const verdict = root.querySelector(".verdict");

    // Piecewise-constant estimate from the paper: 3/4 on [0,1/3], 1/3 on [1/3,2/3], 9/20 on [2/3,1]
    const segs = [
      { x0: 0, x1: 1 / 3, v: 0.75 },
      { x0: 1 / 3, x1: 2 / 3, v: 1 / 3 },
      { x0: 2 / 3, x1: 1, v: 0.45 },
    ];
    const f = makeFrame(svg, { w: 460, h: 440, mL: 50 });
    const xTicks = [{ v: 0, l: "0" }, { v: 0.5, l: "½" }, { v: 1, l: "1" }];
    const yTicks = [{ v: 1 / 3, l: "⅓" }, { v: 0.45, l: "9⁄20" }, { v: 0.75, l: "¾" }, { v: 1, l: "1" }];

    // shaded excised band (everything above threshold)
    const band = el("rect", { class: "region-excised", x: f.x(0), width: f.x(1) - f.x(0) }, svg);
    el("line", { class: "guide", x1: f.x(0.5), y1: f.y(0), x2: f.x(0.5), y2: f.y(1.04) }, svg);
    drawAxes(svg, f, "true probability  P(M = 1 | X)", "physician estimate  π̂(X)", xTicks, yTicks);

    // quadrant labels
    const q = (txt, x, y, anchor) => { const t = el("text", { class: "quad-label", x, y, "text-anchor": anchor }, svg); t.textContent = txt; return t; };
    q("false positives", f.x(0.02), f.y(0.97), "start");
    q("true positives", f.x(0.98), f.y(0.97), "end");
    q("true negatives", f.x(0.02), f.y(0.03), "start");
    q("false negatives", f.x(0.98), f.y(0.03), "end");

    // step function
    let d = `M ${f.x(segs[0].x0)} ${f.y(segs[0].v)}`;
    segs.forEach((s, i) => {
      d += ` L ${f.x(s.x1)} ${f.y(s.v)}`;
      if (i < segs.length - 1) d += ` L ${f.x(s.x1)} ${f.y(segs[i + 1].v)}`;
    });
    el("path", { class: "step-fn", d }, svg);
    const excisedPath = el("path", { class: "step-excised", d: "" }, svg);

    // threshold line (draggable) + label
    const thr = el("line", { class: "thresh-line", x1: f.x(0), x2: f.x(1.04) }, svg);
    const thrGrab = el("line", { class: "thresh-grab", x1: f.x(0), x2: f.x(1.04) }, svg);
    const thrLabel = el("text", { class: "pt-label", x: f.x(1.04), "text-anchor": "end", dy: -6, fill: "var(--accent)" }, svg);
    makeDraggable(thrGrab, svg, (e) => { setZeta(f.toUnit(e).v); });

    /* Quadrant-based confusion counts: polyps are spread uniformly over the x-axis,
       a polyp with P(M=1|X) > 1/2 counts as malignant "in expectation", and a
       polyp is excised when π̂ > ζ. Each proportion is the x-length of the curve
       inside the corresponding quadrant. */
    function counts(zeta) {
      let tp = 0, fp = 0, fn = 0, tn = 0;
      for (const s of segs) {
        const pos = Math.max(0, s.x1 - Math.max(s.x0, 0.5)); // length above x=1/2
        const neg = (s.x1 - s.x0) - pos;
        if (s.v > zeta) { tp += pos; fp += neg; } else { fn += pos; tn += neg; }
      }
      return { tp, fp, fn, tn };
    }
    const base = counts(0.5); // the paper's control threshold

    let zeta = 0.5;
    function setZeta(z) {
      zeta = clamp(Math.round(z * 200) / 200, 0, 1);
      slider.value = zeta;
      render();
    }
    slider.addEventListener("input", () => { zeta = Number(slider.value); render(); });

    function render() {
      const yz = f.y(zeta);
      thr.setAttribute("y1", yz); thr.setAttribute("y2", yz);
      thrGrab.setAttribute("y1", yz); thrGrab.setAttribute("y2", yz);
      thrLabel.setAttribute("y", yz);
      thrLabel.textContent = `ζ = ${zeta.toFixed(2)}`;
      band.setAttribute("y", f.y(1.04));
      band.setAttribute("height", Math.max(0, yz - f.y(1.04)));

      // highlight the excised segments
      let ed = "";
      for (const s of segs) if (s.v > zeta) ed += ` M ${f.x(s.x0)} ${f.y(s.v)} L ${f.x(s.x1)} ${f.y(s.v)}`;
      excisedPath.setAttribute("d", ed.trim());

      const c = counts(zeta);
      for (const k of ["tp", "fp", "fn", "tn"]) {
        cells[k].textContent = fmtPct(c[k]);
        const dv = c[k] - base[k];
        deltas[k].textContent = Math.abs(dv) < 1e-9 ? "0" : (dv > 0 ? "+" : "−") + fmtPct(Math.abs(dv));
      }
      zetaOut.textContent = zeta.toFixed(2);
      const thrVal = c.tp + c.fp > 0 ? c.tp / (c.tp + c.fp) : NaN;
      thrOut.textContent = Number.isFinite(thrVal) ? fmtPct(thrVal) : "—";

      const dTP = c.tp - base.tp, dFP = c.fp - base.fp;
      verdict.className = "verdict";
      if (Math.abs(dTP) < 1e-9 && Math.abs(dFP) < 1e-9) {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Same as the control threshold (ζ = ½)</span>Lower the threshold to see which polyps get excised next.`;
      } else if (dTP > 1e-9 && dFP <= 1e-9) {
        verdict.classList.add("warn");
        verdict.innerHTML = `<span class="title">More true positives, no new false positives</span>Compared with ζ = ½ this looks like improved skill (Δ<sub>AI</sub> = ΔFP/ΔTP = ${fmt(dFP / dTP, 2)}). But nothing about the physician changed except the threshold.`;
      } else if (dTP > 1e-9) {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Both error types moved</span>ΔTP = +${fmtPct(dTP)}, ΔFP = +${fmtPct(dFP)}, so Δ<sub>AI</sub> = ${fmt(dFP / dTP, 2)}.`;
      } else {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Stricter than the control</span>Raising the threshold removes excisions; here it drops ${fmtPct(-dFP)} false positives and ${fmtPct(-dTP)} true positives.`;
      }
    }

    root.querySelectorAll("[data-zeta-preset]").forEach((btn) => {
      btn.addEventListener("click", () => setZeta(Number(btn.dataset.zetaPreset)));
    });
    render();
  }

  /* =========================================================================
     3. Non-inferiority vacuity calculator
     ========================================================================= */
  function calculator(root) {
    const inS0 = root.querySelector("[name=s0]");
    const inS1 = root.querySelector("[name=s1]");
    const inN = root.querySelector("[name=margin]");
    const inTHR = root.querySelector("[name=thr0]");
    const radios = root.querySelectorAll("[name=margin-type]");
    const box = root.querySelector(".verdict");
    const big = root.querySelector(".big-number");
    const steps = root.querySelector(".calc-steps");

    function read() {
      const S0 = Number(inS0.value), S1 = Number(inS1.value);
      const Npct = Number(inN.value), THR0 = Number(inTHR.value) / 100;
      const rel = [...radios].find((r) => r.checked)?.value === "relative";
      const N = rel ? (Npct / 100) * THR0 : Npct / 100;
      return { S0, S1, N, THR0, rel, Npct };
    }

    function render() {
      const { S0, S1, N, THR0, rel, Npct } = read();
      const dS = S1 - S0;
      box.className = "verdict";
      steps.innerHTML = "";
      const addStep = (label, val) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${label}</span><span>${val}</span>`;
        steps.appendChild(li);
      };

      if (![S0, S1, N, THR0].every(Number.isFinite) || S0 <= 0 || S1 <= 0 || THR0 < 0 || THR0 > 1 || N < 0) {
        box.classList.add("neutral");
        big.textContent = "—";
        box.innerHTML = `<span class="title">Enter valid inputs</span>Excision counts must be positive, THR between 0 and 100%, margin non-negative.`;
        return;
      }

      addStep("Additional excisions ΔS = S₁ − S₀", `${dS}`);
      if (dS <= 0) {
        big.textContent = "—";
        box.classList.add("neutral");
        box.innerHTML = `<span class="title">ΔS ≤ 0: no additional excisions</span>With the AI arm excising no more than control, the margin inflation does not apply. If the AI still excised more malignant polyps, Δ<sub>AI</sub> &lt; 0 and skill improved without any extra assumptions.`;
        return;
      }
      const inflation = S1 / dS;
      const effMargin = N * inflation;
      const t = THR0 - effMargin;              // null: π_Δ ≤ t ; non-inferiority declared when π_Δ > t
      const ratio = THR0 > 0 ? effMargin / THR0 : Infinity;

      addStep("Inflation factor S₁ / ΔS", fmt(inflation, 2) + "×");
      addStep(`Margin N${rel ? ` = ${Npct}% × ${fmtPct(THR0)}` : ""}`, fmt(N, 3));
      addStep("Effective margin on π<sub>Δ</sub>: N · S₁/ΔS", fmt(effMargin, 3));
      addStep("Effective margin ÷ THR₀", fmt(ratio, 2) + (ratio >= 1 ? "  (≥ 1 → vacuous)" : ""));
      addStep("Required π<sub>Δ</sub> = THR₀ − N·S₁/ΔS", fmt(t, 3));

      if (t <= 0) {
        box.classList.add("bad");
        big.textContent = "≤ 0";
        box.innerHTML = `<span class="title">Vacuous: the test cannot fail</span>Non-inferiority is declared whenever the additional excisions have a malignancy rate above ${fmt(t, 3)}. A proportion is always ≥ 0, so the null is rejected even if every one of the ${dS} additional polyps is benign.`;
      } else {
        const need = Math.ceil(t * dS);
        const nearly = t < 0.5 * THR0;
        box.classList.add(nearly ? "warn" : "good");
        big.textContent = fmtPct(t);
        box.innerHTML = `<span class="title">${nearly ? "Nearly vacuous" : "Test has teeth"}</span>Non-inferiority is declared if more than ${fmtPct(t)} of the additional excisions are malignant: about ${need} of ${dS} extra polyps. For comparison, a superiority test (N = 0) would require them to beat the control THR of ${fmtPct(THR0)}, i.e. ${Math.ceil(THR0 * dS)} of ${dS}.`;
      }
    }

    [inS0, inS1, inN, inTHR, ...radios].forEach((i) => i.addEventListener("input", render));
    root.querySelectorAll("[data-calc-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [s0, s1, n, thr, type] = btn.dataset.calcPreset.split(",");
        inS0.value = s0; inS1.value = s1; inN.value = n; inTHR.value = thr;
        radios.forEach((r) => (r.checked = r.value === type));
        render();
      });
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const r = document.getElementById("fig-roc"); if (r) rocFigure(r);
    const s = document.getElementById("fig-step"); if (s) stepFigure(s);
    const c = document.getElementById("fig-calc"); if (c) calculator(c);
  });
})();
