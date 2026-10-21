/*
 * ÜBERRASCHUNG 25.10.: Das Agenten-Sudoku.
 * 2 Sudokus (4×4, Zahlen 1–4) lösen. In jeder Reihe, jeder Spalte und jedem 2×2-Block
 * kommt jede Zahl genau einmal vor. Wer mit Fehlern prüft: 30 Sekunden gesperrt.
 */
(function () {
  const EVENT_ID = "sudoku";
  const LOCK_SECONDS = 30;
  // 0 = leeres Feld. Jedes Sudoku hat genau eine Lösung.
  const PUZZLES = [
    {
      start: [0, 0, 0, 0, 0, 4, 1, 0, 2, 0, 4, 3, 0, 0, 0, 0],
      solution: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1].join(""),
    },
    {
      start: [1, 0, 4, 0, 0, 0, 2, 0, 4, 3, 0, 0, 0, 0, 0, 0],
      solution: [1, 2, 4, 3, 3, 4, 2, 1, 4, 3, 1, 2, 2, 1, 3, 4].join(""),
    },
  ];

  let lockTimer = null;

  App.register("surprise-sudoku", {
    render(root, app) {
      if (!Events.guard(root, app, EVENT_ID)) return;

      root.innerHTML = Events.frame(EVENT_ID,
        `Löst ${PUZZLES.length} geheime Sudokus! In jeder Reihe, jeder Spalte und jedem dicken Kasten steht jede Zahl 1, 2, 3, 4 genau einmal. Aber Vorsicht: Prüfen mit Fehler = ${LOCK_SECONDS} Sekunden gesperrt! 😈`, `
        <p class="round-info" id="which"></p>
        <div class="sudoku" id="board"></div>
        <p class="hint">Tippt auf ein leeres Feld: 1 → 2 → 3 → 4 → leer.</p>
        <button class="btn go" type="button" id="check">Prüfen ✔</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      const $ = (s) => root.querySelector(s);
      const panel = $(".panel");
      const feedback = $("#feedback");
      let index = 0;
      let values = [];
      let locked = false;

      function draw() {
        const p = PUZZLES[index];
        $("#which").textContent = `Sudoku ${index + 1} / ${PUZZLES.length}`;
        $("#board").innerHTML = values.map((v, i) => {
          const fixed = p.start[i] !== 0;
          return `<button type="button" class="sd-cell ${fixed ? "fixed" : ""}" data-i="${i}" ${fixed ? "disabled" : ""} aria-label="Feld ${i + 1}">${v || ""}</button>`;
        }).join("");
      }

      function load() {
        values = PUZZLES[index].start.slice();
        draw();
      }
      load();

      $("#board").addEventListener("click", (e) => {
        const c = e.target.closest(".sd-cell");
        if (!c || c.disabled || locked) return;
        const i = Number(c.dataset.i);
        values[i] = (values[i] + 1) % 5;
        c.textContent = values[i] || "";
        Sound.play("key");
      });

      $("#check").addEventListener("click", async () => {
        if (locked) return;
        if (values.includes(0)) {
          Sound.play("blip");
          feedback.className = "feedback almost";
          feedback.textContent = "Es sind noch Felder leer!";
          return;
        }
        if (values.join("") !== PUZZLES[index].solution) {
          locked = true;
          UI.wrong(panel, feedback);
          let left = LOCK_SECONDS;
          $("#check").disabled = true;
          const tick = () => {
            $("#check").textContent = `Gesperrt: ${left} s`;
            if (left-- <= 0) {
              clearInterval(lockTimer);
              locked = false;
              $("#check").disabled = false;
              $("#check").textContent = "Prüfen ✔";
            }
          };
          tick();
          lockTimer = setInterval(tick, 1000);
          return;
        }
        index++;
        if (index >= PUZZLES.length) { UI.completeEvent(EVENT_ID, app); return; }
        Sound.play("success");
        FX.burst(50);
        feedback.className = "feedback ok";
        feedback.textContent = "Richtig! Jetzt das nächste Sudoku …";
        load();
      });

      Events.watch(EVENT_ID, root, app, () => { locked = true; clearInterval(lockTimer); });
    },

    leave() {
      Events.stop();
      clearInterval(lockTimer);
    },
  });
})();
