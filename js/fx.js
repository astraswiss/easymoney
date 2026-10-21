/*
 * Visuelle Effekte: fallender Code im Hintergrund, Schreibmaschinen-Text, Konfetti.
 */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fallender Hacker-Code ---------- */
  function startMatrix(canvas) {
    const c = canvas.getContext("2d");
    const chars = "TEMUQUEST01ABCDEF<>/{}#$%&*アカサタナハマヤラワ".split("");
    const size = 18;
    let cols = 0, drops = [], w = 0, h = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / size);
      drops = Array.from({ length: cols }, () => Math.random() * -h / size);
      c.fillStyle = "#06050d";
      c.fillRect(0, 0, w, h);
    }

    function draw() {
      c.fillStyle = "rgba(6, 5, 13, 0.12)";
      c.fillRect(0, 0, w, h);
      c.font = size + "px VT323, monospace";
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        const y = drops[i] * size;
        c.fillStyle = Math.random() > 0.97 ? "#ff3ea5" : "#2ef2ff";
        c.fillText(ch, i * size, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) {
      for (let i = 0; i < 60; i++) draw();
      return;
    }
    let last = 0;
    (function loop(t) {
      if (t - last > 50) { draw(); last = t; }
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- Konfetti / Funken ---------- */
  const fxCanvas = () => document.getElementById("fx");
  let particles = [];
  let running = false;

  function burst(count = 140) {
    if (reduceMotion) return;
    const canvas = fxCanvas();
    if (!canvas) return;
    const c = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#2ef2ff", "#ff3ea5", "#7dff4f", "#ff8a1f", "#ffffff"];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2.4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 3 + Math.random() * 5,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
        spin: Math.random() * 6,
      });
    }
    if (running) return;
    running = true;
    (function loop() {
      c.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.22; p.vx *= 0.99;
        p.life -= 0.012; p.spin += 0.2;
        c.globalAlpha = Math.max(p.life, 0);
        c.fillStyle = p.color;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.spin);
        c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        c.restore();
      }
      c.globalAlpha = 1;
      if (particles.length) requestAnimationFrame(loop);
      else { running = false; c.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    })();
  }

  /* ---------- Schreibmaschinen-Text ---------- */
  function typeText(el, text, speed = 28) {
    return new Promise((resolve) => {
      if (reduceMotion) { el.textContent = text; resolve(); return; }
      el.textContent = "";
      let i = 0;
      (function step() {
        el.textContent = text.slice(0, ++i);
        if (i % 2 === 0 && text[i - 1] !== " ") Sound.play("type");
        if (i < text.length) setTimeout(step, speed);
        else resolve();
      })();
    });
  }

  // Kleine Hilfe: Animation neu starten (z. B. "shake" bei jedem falschen Versuch)
  function replayClass(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  window.FX = { startMatrix, burst, typeText, replayClass, wait, reduceMotion };
})();
