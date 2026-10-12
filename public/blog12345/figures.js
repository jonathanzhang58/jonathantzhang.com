/* Interactive figures for the CADe non-inferiority blog post.
   Four widgets, each self-contained:
     1. rocFigure()         — two operating points that slide along reference ROC curves
     2. stepFigure()        — physician estimate vs. true probability, movable threshold
     3. calculator()        — THR non-inferiority vacuity calculator
     4. skoutFigure()       — SKOUT-style population: extra excisions that are all benign
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

  /* Generic drag helper for an SVG group. Moves are tracked on the window, so the
     drag survives the pointer leaving the target (e.g. when a point snaps to a curve). */
  function makeDraggable(target, svg, onMove) {
    let id = null;
    const move = (e) => { if (e.pointerId === id) onMove(e); };
    const stop = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    target.addEventListener("pointerdown", (e) => {
      if (id !== null) return;
      id = e.pointerId;
      e.preventDefault();
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    });
  }

  /* =========================================================================
     1. ROC figure: two draggable operating points
     ========================================================================= */
  function rocFigure(root) {
    const svg = root.querySelector("svg");
    const verdict = root.querySelector(".verdict");
    const f = makeFrame(svg, { w: 460, h: 440 });
    const ticks = [{ v: 0, l: "0" }, { v: 0.5, l: "0.5" }, { v: 1, l: "1" }];

    // background: chance line + the two reference curves from the paper, TPR = FPR^k.
    // Each operating point slides along its own curve: control on the lower one, AI on
    // the higher one (or on the lower one too when an example sets up a true null).
    const LOW = 0.5, HIGH = 0.22;
    const CURVES = [LOW, HIGH];
    const tpr = (p) => Math.pow(p.u, p.k);
    el("line", { class: "chance", x1: f.x(0), y1: f.y(0), x2: f.x(1), y2: f.y(1) }, svg);
    const refPaths = new Map(CURVES.map((k) => [k, el("path", { class: "ref-curve", d: samplePath((u) => Math.pow(u, k), f) }, svg)]));
    drawAxes(svg, f, "false positive rate", "true positive rate", ticks, ticks);

    const fit = el("path", { class: "fit-curve", d: "" }, svg);
    const link = el("line", { class: "link-line" }, svg);

    // FPR of the point on curve k nearest (in screen space) to the pointer
    function snapU(u, v, k) {
      let best = null;
      for (let i = 0; i <= 800; i++) {
        const s = i / 800, uu = s * s; // denser near 0, where the curves are steep
        const dx = f.x(uu) - f.x(u), dy = f.y(Math.pow(uu, k)) - f.y(v);
        const d = dx * dx + dy * dy;
        if (!best || d < best.d) best = { d, u: uu };
      }
      return best.u;
    }

    const state = { A: { k: LOW, u: 0.30 }, B: { k: HIGH, u: 0.15 } };

    function makePoint(key, label) {
      const g = el("g", { class: `pt pt-${key}`, tabindex: 0, role: "slider", "aria-label": `${label} operating point` }, svg);
      el("circle", { class: "pt-halo", r: 18 }, g);
      el("circle", { class: "pt-dot", r: 7 }, g);
      const t = el("text", { class: "pt-label", dx: 11, dy: -9 }, g);
      t.textContent = label;
      makeDraggable(g, svg, (e) => {
        const { u, v } = f.toUnit(e);
        state[key].u = snapU(u, v, state[key].k);
        render();
      });
      // keyboard: arrows slide the point along its curve
      g.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 0.05 : 0.01;
        const p = state[key];
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") p.u = clamp(p.u - step, 0, 1);
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") p.u = clamp(p.u + step, 0, 1);
        else return;
        e.preventDefault();
        render();
      });
      return g;
    }
    const gA = makePoint("A", "control");
    const gB = makePoint("B", "AI");

    function render() {
      const A = { u: state.A.u, v: tpr(state.A) }, B = { u: state.B.u, v: tpr(state.B) };
      gA.setAttribute("transform", `translate(${f.x(A.u)} ${f.y(A.v)})`);
      gB.setAttribute("transform", `translate(${f.x(B.u)} ${f.y(B.v)})`);
      link.setAttribute("x1", f.x(A.u)); link.setAttribute("y1", f.y(A.v));
      link.setAttribute("x2", f.x(B.u)); link.setAttribute("y2", f.y(B.v));

      const dFP = B.u - A.u, dTP = B.v - A.v;
      const eps = 1e-9;
      const same = Math.abs(dFP) < eps && Math.abs(dTP) < eps;
      const bUpLeft = dFP <= eps && dTP >= -eps && !same;   // AI point up-and-left of control
      const bDownRight = dFP >= -eps && dTP <= eps && !same; // control point up-and-left of AI

      // when both points sit on the same reference curve, that curve is the one passing through both
      const shared = state.A.k === state.B.k;
      refPaths.forEach((path) => path.classList.remove("fit-curve"));

      verdict.className = "verdict";
      if (same) {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Identical operating points</span>Nothing changed between arms. Drag one of the points.`;
        fit.setAttribute("d", "");
      } else if (bUpLeft) {
        verdict.classList.add("good");
        verdict.innerHTML = `<span class="title">Reject false null hypothesis.</span>Due to the positioning of the two points, a single ROC curve cannot parameterize both. Thus it must be true that the two trial arms had different skill levels.`;
        fit.setAttribute("d", "");
      } else if (bDownRight) {
        verdict.classList.add("bad");
        verdict.innerHTML = `<span class="title">Reject false null hypothesis.</span>Due to the positioning of the two points, a single ROC curve cannot parameterize both. Thus it must be true that the two trial arms had different skill levels.`;
        fit.setAttribute("d", "");
      } else {
        verdict.classList.add("warn");
        verdict.innerHTML = `<span class="title">Fail to reject the null</span>Although it could be true that these points were from different ROC curves, we cannot determine this from the data alone, because a valid monotone curve passes through both (drawn in black).`;
        if (shared) {
          refPaths.get(state.A.k).classList.add("fit-curve");
          fit.setAttribute("d", "");
        } else {
          const lo = A.u <= B.u ? A : B, hi = lo === A ? B : A;
          fit.setAttribute("d", monotonePath([[0, 0], [lo.u, lo.v], [hi.u, hi.v], [1, 1]], f));
        }
      }
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        // data-preset = "control FPR, AI FPR, AI curve (high | low)"
        const [au, bu, curve] = btn.dataset.preset.split(",");
        state.A = { k: LOW, u: Number(au) };
        state.B = { k: curve === "low" ? LOW : HIGH, u: Number(bu) };
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
        verdict.innerHTML = `<span class="title">Increase in TP with no change in FP.</span>Although a strict increase in true positives with no change in false positives would indicate a skill improvement, we can replicate the same change can be achieved by only changing the threshold of this decision function.`;
      } else if (dTP > 1e-9) {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Increase in FP and TP.</span>Excessively decreasing the threshold increases the number of excisions, leading to more FPs and TPs.`;
      } else {
        verdict.classList.add("neutral");
        verdict.innerHTML = `<span class="title">Decrease in FP.</span>Increasing the threshold reduces the number of excisions, leading to less FPs and TPs.`;
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
        box.innerHTML = `<span class="title">ΔS ≤ 0: no additional excisions</span>We assume the AI-assistance will cause additional excisions.`;
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
        box.innerHTML = `<span class="title">Vacuous Test</span>Because the test rejects if a non-positive number of additional false positives are excised in the AI-assisted arm, the test will always conclude non-inferiority.`;
      } else {
        const nearly = t < 0.5 * THR0;
        box.classList.add(nearly ? "warn" : "good");
        big.textContent = fmtPct(t);
        box.innerHTML = `<span class="title">${nearly ? "Nearly Vacuous Test" : "Non-Vacuous Test"}</span>Because the test rejects if a positive number of additional false positives are excised in the AI-assisted arm, the test is able to conclude that the AI-assistance THR is not non-inferior.`;
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

  /* =========================================================================
     4. SKOUT-style population: same malignant polyps, more benign excisions
     ========================================================================= */
  function skoutFigure(root) {
    const svg = root.querySelector("svg");
    const slider = root.querySelector("[name=extra]");
    const sliderLabel = root.querySelector(".extra-value");
    const radios = root.querySelectorAll("[name=skout-margin]");
    const verdict = root.querySelector(".verdict");
    const readout = root.querySelector(".readout");

    // Hypothetical population matching SKOUT's control arm: 963 excisions at THR ≈ 71.7%.
    const X = 690, S0 = 963, P = 1400, MARGIN = 0.14;
    const THR0 = X / S0;
    let render = () => {};
    let narrow = null;

    // Wide screens get a short, wide grid; phones get a tall, narrow one so the text stays legible.
    function build() {
      narrow = svg.clientWidth > 0 && svg.clientWidth < 560;
      svg.innerHTML = "";
      const R = narrow ? 36 : 18, pitch = 8.4, cell = 6.8;
      const cols = Math.ceil(P / R);
      const gx = 12, gridW = cols * pitch, W = gridW + 2 * gx + 10;
      const gridH = R * pitch;
      const yLegend = 14, yCtl = narrow ? 94 : 58, yAI = yCtl + gridH + (narrow ? 100 : 86), yLine = yAI + gridH + (narrow ? 136 : 118);
      const H = yLine + 46;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const fmtN = (n) => n.toLocaleString("en-US");

      // legend
      const legend = [
        ["cell-mal", "excised, malignant"],
        ["cell-ben", "excised, benign"],
        ["cell-extra", "extra excision, benign"],
        ["cell-left", "left in place, never biopsied"],
      ];
      let lx = gx, ly = yLegend;
      const legendRow = () => { ly += 18; };
      for (const [cls, txt] of legend) {
        el("rect", { class: cls, x: lx, y: ly - 8, width: cell + 1, height: cell + 1 }, svg);
        const t = el("text", { class: "tick-label", x: lx + 13, y: ly }, svg);
        t.textContent = txt;
        lx += 13 + txt.length * 5.6 + 20;
        if (narrow && cls === "cell-ben") { lx = gx; legendRow(); }
      }

      const cellX = (i) => gx + Math.floor(i / R) * pitch;
      const cellY = (i, top) => top + (i % R) * pitch;
      const nx = (n) => gx + (n / R) * pitch;   // continuous x position of the n-th polyp boundary

      function grid(top) {
        const g = el("g", {}, svg);
        const cells = [];
        for (let i = 0; i < P; i++) cells.push(el("rect", { x: cellX(i), y: cellY(i, top), width: cell, height: cell }, g));
        return cells;
      }

      function bracket(g, n0, n1, y, label) {
        const x0 = nx(n0), x1 = Math.max(x0, nx(n1) - (pitch - cell));
        el("path", { class: "bracket", d: `M ${x0} ${y} V ${y + 5} H ${x1} V ${y}` }, g);
        const tight = x1 - x0 < label.length * 5.8;
        const t = el("text", { class: "bracket-label", x: tight ? x0 : (x0 + x1) / 2, y: y + 19, "text-anchor": tight ? "start" : "middle" }, g);
        t.textContent = label;
      }

      function armTitle(y, name) {
        const t = el("text", { class: "arm-title", x: gx, y }, svg);
        const a = el("tspan", { class: "axis-title" }, t);
        a.textContent = name;
        const b = narrow
          ? el("tspan", { class: "arm-thr", x: gx, dy: 16 }, t)
          : el("tspan", { class: "arm-thr", dx: 10 }, t);
        return b;
      }

      // control arm (static)
      const titleOff = narrow ? 26 : 12;
      const ctlThr = armTitle(yCtl - titleOff, "Control");
      ctlThr.textContent = `${fmtN(S0)} excised · THR = ${fmtN(X)} / ${fmtN(S0)} = ${fmtPct(THR0)}`;
      grid(yCtl).forEach((r, i) => r.setAttribute("class", i < X ? "cell-mal" : i < S0 ? "cell-ben" : "cell-left"));
      const gCtl = el("g", {}, svg);
      bracket(gCtl, 0, X, yCtl + gridH + 6, `${fmtN(X)} malignant`);
      bracket(gCtl, X, S0, yCtl + gridH + 6, `${S0 - X} benign`);

      // AI arm (dynamic)
      const aiThr = armTitle(yAI - titleOff, "AI-assisted");
      const aiCells = grid(yAI);
      const gAI = el("g", {}, svg);
      const limitPath = el("path", { class: "limit-line" }, svg);
      const limitLabel = el("text", { class: "bracket-label limit-label", "text-anchor": "middle" }, svg);

      // THR number line
      const lx0 = gx, lx1 = gx + gridW;
      const tx = (p) => lx0 + p * (lx1 - lx0);
      const gLine = el("g", {}, svg);
      const zone = el("rect", { class: "ni-zone", y: yLine - 22, height: 22 }, gLine);
      const zoneLabel = el("text", { class: "bracket-label", y: yLine - 7, "text-anchor": "end" }, gLine);
      zoneLabel.textContent = "non-inferior";
      el("line", { class: "axis", x1: lx0, y1: yLine, x2: lx1, y2: yLine }, gLine);
      for (let p = 0; p <= 1.0001; p += 0.1) {
        el("line", { class: "axis", x1: tx(p), y1: yLine, x2: tx(p), y2: yLine + 4 }, gLine);
        const t = el("text", { class: "tick-label", x: tx(p), y: yLine + 16, "text-anchor": "middle" }, gLine);
        t.textContent = Math.round(p * 100) + "%";
      }
      const lt = el("text", { class: "axis-title", x: lx0, y: yLine - (narrow ? 54 : 34) }, gLine);
      lt.textContent = "True histology rate (THR)";
      const bound = el("line", { class: "ni-bound", y1: yLine - 30, y2: yLine + 6 }, gLine);
      const boundLabel = el("text", { class: "bracket-label", y: yLine + 34, "text-anchor": "middle" }, gLine);
      const drop = el("line", { class: "thr-drop", y1: yLine, y2: yLine }, gLine);
      const ctlDot = el("circle", { class: "thr-dot thr-ctl", r: 5.5, cx: tx(THR0), cy: yLine }, gLine);
      const ctlLabel = el("text", { class: "pt-label thr-ctl-label", x: tx(THR0), y: yLine - 30, "text-anchor": "middle" }, gLine);
      ctlLabel.textContent = `control ${fmtPct(THR0)}`;
      const aiDot = el("circle", { class: "thr-dot thr-ai", r: 5.5, cy: yLine }, gLine);
      const aiLabel = el("text", { class: "pt-label thr-ai-label", y: yLine - 30, "text-anchor": "middle" }, gLine);

      render = function () {
        const K = Number(slider.value);
        const rel = [...radios].find((r) => r.checked)?.value === "relative";
        const N = rel ? MARGIN * THR0 : MARGIN;
        const lo = THR0 - N;
        const S1 = S0 + K, THR1 = X / S1;
        const pass = THR1 > lo;
        // largest K with X / (S0 + K) > lo
        const Kstar = Math.ceil(X / lo - 1e-9) - 1 - S0;
        const marginTxt = rel ? `${fmt(100 * N, 1)}-point (14% relative)` : "14-point";

        sliderLabel.textContent = K;
        aiCells.forEach((r, i) => r.setAttribute("class", i < X ? "cell-mal" : i < S0 ? "cell-ben" : i < S1 ? "cell-extra" : "cell-left"));
        aiThr.textContent = `${fmtN(S1)} excised · THR = ${fmtN(X)} / ${fmtN(S1)} = ${fmtPct(THR1)}`;

        gAI.innerHTML = "";
        const by = yAI + gridH + 6;
        bracket(gAI, 0, X, by, `${fmtN(X)} malignant (same)`);
        bracket(gAI, X, S0, by, `${S0 - X} benign`);
        if (K > 0) bracket(gAI, S0, S1, by, `+${K} benign`);

        // stepped boundary in the AI grid after the last passing excision
        if (Kstar >= 0 && Kstar < P - S0) {
          const n = S0 + Kstar, c = Math.floor(n / R), r = n % R;
          const xa = gx + c * pitch - (pitch - cell) / 2, xb = xa + pitch;
          const top = yAI - 3, bot = yAI + gridH - (pitch - cell) + 3, yr = yAI + r * pitch - (pitch - cell) / 2;
          limitPath.setAttribute("d", r === 0 ? `M ${xa} ${top} V ${bot}` : `M ${xb} ${top} V ${yr} H ${xa} V ${bot}`);
          limitLabel.setAttribute("x", xa);
          limitLabel.setAttribute("y", yAI - 8);
          limitLabel.textContent = `limit: K = ${Kstar}`;
          limitPath.style.display = limitLabel.style.display = "";
        } else {
          limitPath.style.display = limitLabel.style.display = "none";
        }

        zone.setAttribute("x", tx(lo));
        zone.setAttribute("width", tx(1) - tx(lo));
        zoneLabel.setAttribute("x", tx(1) - 6);
        bound.setAttribute("x1", tx(lo)); bound.setAttribute("x2", tx(lo));
        boundLabel.setAttribute("x", tx(lo));
        boundLabel.textContent = `control − margin = ${fmtPct(lo)}`;
        drop.setAttribute("x1", tx(THR1)); drop.setAttribute("x2", tx(THR0));
        aiDot.setAttribute("cx", tx(THR1));
        aiLabel.setAttribute("x", tx(THR1) - 4);
        aiLabel.setAttribute("text-anchor", "end");
        aiLabel.textContent = `AI ${fmtPct(THR1)}`;
        aiDot.style.display = aiLabel.style.display = drop.style.display = K > 0 ? "" : "none";
        ctlLabel.setAttribute("x", K > 0 ? tx(THR0) + 4 : tx(THR0));
        ctlLabel.setAttribute("text-anchor", K > 0 ? "start" : "middle");

        verdict.className = "verdict";
        const ptsDrop = fmt(100 * (THR0 - THR1), 1);
        if (K === 0) {
          verdict.classList.add("neutral");
          verdict.innerHTML = `<span class="title">No extra excisions</span>Both arms excise the same polyps, so THR is identical. Drag the slider to let the AI arm excise some of the polyps that control left in place.`;
        } else if (pass) {
          verdict.classList.add("bad");
          verdict.innerHTML = `<span class="title">Declared non-inferior</span>THR falls by ${ptsDrop} points, inside the ${marginTxt} margin, even though the AI arm found no additional malignant polyps. It could have made up to ${Kstar} such excisions (${fmtPct(Kstar / S0, 0)} more than control) and still passed.`;
        } else {
          verdict.classList.add("good");
          verdict.innerHTML = `<span class="title">Non-inferiority not shown</span>THR falls by ${ptsDrop} points, past the ${marginTxt} margin, so the test fails. An additional ${K} false positives were excised, more than the required ${Kstar + 1} extra excisions for the test to fail to reject.`;
        }
        readout.textContent = `ΔS = ${K}, ΔTP = 0, so π_Δ = 0. Passes while ${fmtN(X)} / (${fmtN(S0)} + K) > ${fmtPct(lo)}, i.e. K ≤ ${Kstar}.`;
      };
      render();
    }

    slider.max = P - S0;
    build();
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (svg.clientWidth > 0 && (svg.clientWidth < 560) !== narrow) build();
      }).observe(svg);
    }

    slider.addEventListener("input", () => render());
    radios.forEach((r) => r.addEventListener("input", () => render()));
    root.querySelectorAll("[data-skout-k]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.dataset.skoutK;
        if (v === "limit") {
          const rel = [...radios].find((r) => r.checked)?.value === "relative";
          const lo = THR0 - (rel ? MARGIN * THR0 : MARGIN);
          slider.value = Math.ceil(X / lo - 1e-9) - 1 - S0;
        } else slider.value = v;
        render();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const r = document.getElementById("fig-roc"); if (r) rocFigure(r);
    const s = document.getElementById("fig-step"); if (s) stepFigure(s);
    const c = document.getElementById("fig-calc"); if (c) calculator(c);
    const k = document.getElementById("fig-skout"); if (k) skoutFigure(k);
  });
})();
