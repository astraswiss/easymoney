/*
 * TRAININGSLAGER – Bonus-Spiele, immer offen, ohne Geld.
 * Jedes Spiel meldet sich hier an; die Zentrale zeigt automatisch alle an.
 *
 *   Training.add({ screen: "train-memory", icon: "🃏", title: "...", text: "..." });
 *
 * Rekorde gelten nur, solange die Seite offen ist.
 */
(function () {
  const games = [];
  const best = {};

  window.Training = {
    games,

    add(game) {
      games.push(game);
    },

    // Rahmen wie bei den Missionen, aber mit "TRAINING" oben
    frame(screen, inner) {
      const g = games.find((x) => x.screen === screen);
      const record = best[screen];
      return `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>TRAININGSLAGER</span>
            <span>Rekord: <b data-record>${record === undefined ? "–" : record}</b></span>
          </div>
          <h1 class="title">
            <span class="mid glitch" data-text="${UI.esc(g.title.toUpperCase())}">${UI.esc(g.title.toUpperCase())}</span>
          </h1>
          ${inner}
          <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
        </div>`;
    },

    // Neuer Rekord? lowerIsBetter für Spiele, bei denen weniger besser ist (z. B. Züge)
    record(screen, value, root, lowerIsBetter = false) {
      const old = best[screen];
      const isNew = old === undefined || (lowerIsBetter ? value < old : value > old);
      if (isNew) {
        best[screen] = value;
        const el = root.querySelector("[data-record]");
        if (el) el.textContent = value;
      }
      return isNew;
    },
  };
})();
