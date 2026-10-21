/*
 * TRAINING: Finde den Spion. Ein Bild ist anders als alle anderen.
 * Jedes Level wird das Feld größer. 45 Sekunden Zeit, falscher Tipp = −3 Sekunden.
 */
(function () {
  const SCREEN = "train-spion";
  const SECONDS = 45;
  const PENALTY = 3;
  // Paare, die sich ähnlich sehen: [normal, Spion]
  const PAIRS = [
    ["😀", "😃"], ["🐱", "😺"], ["🍎", "🍅"], ["🌕", "🌝"], ["🐶", "🐕"],
    ["🙂", "🙃"], ["⭐", "🌟"], ["🍊", "🍑"], ["🐻", "🐼"], ["😎", "🤓"],
    ["🔵", "🟣"], ["🍪", "🍩"], ["🐸", "🐢"], ["❤️", "🧡"], ["🌲", "🌳"],
  ];

  Training.add({
    screen: SCREEN,
    icon: "🔎",
    title: "Finde den Spion",
    text: "Ein Bild ist anders. Wie viele Spione findet ihr in 45 Sekunden?",
  });

  let timer = null;

  App.register(SCREEN, {
    render(root, app) {
      root.innerHTML = Training.frame(SCREEN, `
        <p class="lead center">Ein Bild ist anders als alle anderen. Das ist der Spion! Tippt ihn schnell an. Falsch getippt = −${PENALTY} Sekunden.</p>
        <p class="round-info">Zeit: <span id="time">${SECONDS}</span> · Gefunden: <span id="score">0</span></p>
        <div class="spy-grid" id="grid"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <button class="btn" type="button" id="start">Start ▶</button>
      `);
      UI.bindBack(root, app);

      const grid = root.querySelector("#grid");
      const feedback = root.querySelector("#feedback");
      const startBtn = root.querySelector("#start");
      let score = 0;
      let left = SECONDS;
      let running = false;

      function level() {
        const size = Math.min(3 + Math.floor(score / 2), 8);
        const [normal, spy] = PAIRS[(Math.random() * PAIRS.length) | 0];
        const swap = Math.random() < 0.5;
        const spyAt = (Math.random() * size * size) | 0;
        grid.style.setProperty("--n", size);
        grid.innerHTML = Array.from({ length: size * size }, (_, i) =>
          `<button type="button" class="spy-cell" data-spy="${i === spyAt}">${i === spyAt ? (swap ? normal : spy) : (swap ? spy : normal)}</button>`
        ).join("");
      }

      function stop() {
        running = false;
        clearInterval(timer);
        grid.innerHTML = "";
        const isNew = Training.record(SCREEN, score, root);
        Sound.play(score ? "success" : "error");
        if (score) FX.burst(60);
        feedback.className = "feedback ok";
        feedback.textContent = isNew && score ? `Zeit um! ${score} Spione gefunden. NEUER REKORD! 🏆` : `Zeit um! ${score} Spione gefunden.`;
        startBtn.hidden = false;
        startBtn.textContent = "Nochmal ▶";
      }

      startBtn.addEventListener("click", () => {
        Sound.play("click");
        score = 0;
        left = SECONDS;
        running = true;
        startBtn.hidden = true;
        feedback.textContent = "";
        root.querySelector("#score").textContent = 0;
        root.querySelector("#time").textContent = left;
        level();
        timer = setInterval(() => {
          left--;
          root.querySelector("#time").textContent = Math.max(left, 0);
          if (left <= 0) stop();
        }, 1000);
      });

      grid.addEventListener("click", (e) => {
        const cell = e.target.closest(".spy-cell");
        if (!cell || !running) return;
        if (cell.dataset.spy === "true") {
          score++;
          root.querySelector("#score").textContent = score;
          Sound.play("coin");
          level();
        } else {
          left = Math.max(left - PENALTY, 0);
          root.querySelector("#time").textContent = left;
          Sound.play("error");
          FX.replayClass(cell, "shake");
          if (left <= 0) stop();
        }
      });
    },

    leave() {
      clearInterval(timer);
    },
  });
})();
