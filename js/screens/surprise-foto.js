/*
 * ÜBERRASCHUNG 23.10.: Das Foto-Gedächtnis.
 * Felder leuchten kurz auf – dann alle richtigen antippen. 6 Level (4 bis 9 Felder).
 * Ein falsches Feld = Level fehlgeschlagen, neues Muster, und ein Level zurück.
 */
(function () {
  const EVENT_ID = "foto";
  const SIZE = 5; // 5×5 Felder
  const LEVELS = [4, 5, 6, 7, 8, 9]; // so viele Felder leuchten pro Level
  const SHOW_MS = 1400;

  let timers = [];
  const clearAll = () => { timers.forEach(clearTimeout); timers = []; };
  const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

  App.register("surprise-foto", {
    render(root, app) {
      if (!Events.guard(root, app, EVENT_ID)) return;

      root.innerHTML = Events.frame(EVENT_ID,
        `Einige Felder leuchten ganz kurz auf. Merkt sie euch wie ein Foto und tippt dann alle an! ${LEVELS.length} Level. Ein falsches Feld = ein Level zurück! 😈`, `
        <p class="round-info" id="level"></p>
        <div class="photo-grid" id="grid">
          ${Array.from({ length: SIZE * SIZE }, (_, i) => `<button type="button" class="photo-cell" data-i="${i}" disabled aria-label="Feld ${i + 1}"></button>`).join("")}
        </div>
        <button class="btn go" type="button" id="start">Start ▶</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      const $ = (s) => root.querySelector(s);
      const panel = $(".panel");
      const feedback = $("#feedback");
      const cells = [...root.querySelectorAll(".photo-cell")];
      let level = 0;
      let pattern = new Set();
      let found = new Set();
      let accepting = false;

      const showLevel = () => { $("#level").textContent = `Level ${level + 1} / ${LEVELS.length} · ${LEVELS[level]} Felder`; };
      showLevel();

      async function round() {
        accepting = false;
        cells.forEach((c) => { c.className = "photo-cell"; c.disabled = true; });
        pattern = new Set();
        while (pattern.size < LEVELS[level]) pattern.add((Math.random() * SIZE * SIZE) | 0);
        found = new Set();
        showLevel();
        feedback.className = "feedback";
        feedback.textContent = "Achtung … Foto!";
        await wait(700);
        pattern.forEach((i) => cells[i].classList.add("lit"));
        Sound.play("blip");
        await wait(SHOW_MS);
        cells.forEach((c) => { c.classList.remove("lit"); c.disabled = false; });
        feedback.textContent = "Jetzt ihr! Tippt alle Felder an.";
        accepting = true;
      }

      $("#grid").addEventListener("click", async (e) => {
        const cell = e.target.closest(".photo-cell");
        if (!cell || !accepting) return;
        const i = Number(cell.dataset.i);
        if (found.has(i)) return;
        if (!pattern.has(i)) {
          accepting = false;
          cell.classList.add("miss");
          pattern.forEach((p) => { if (!found.has(p)) cells[p].classList.add("show"); });
          level = Math.max(0, level - 1);
          UI.wrong(panel, feedback, `FALSCH! Ein Level zurück! 😈`);
          await wait(1800);
          if (root.isConnected) round();
          return;
        }
        found.add(i);
        cell.classList.add("hit");
        Sound.play("key");
        if (found.size < pattern.size) return;

        accepting = false;
        level++;
        if (level >= LEVELS.length) { UI.completeEvent(EVENT_ID, app); return; }
        Sound.play("coin");
        feedback.className = "feedback ok";
        feedback.textContent = "Richtig! Nächstes Level …";
        await wait(900);
        if (root.isConnected) round();
      });

      $("#start").addEventListener("click", () => {
        Sound.play("click");
        $("#start").hidden = true;
        $("#grid").scrollIntoView({ block: "center", behavior: FX.reduceMotion ? "auto" : "smooth" });
        round();
      });

      Events.watch(EVENT_ID, root, app, () => { accepting = false; clearAll(); });
    },

    leave() {
      Events.stop();
      clearAll();
    },
  });
})();
