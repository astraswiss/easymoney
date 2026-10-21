/*
 * TRAINING: Agenten-Memory. 8 Paare finden – mit so wenig Zügen wie möglich.
 */
(function () {
  const SCREEN = "train-memory";
  const SYMBOLS = ["🕶️", "🔦", "📻", "🔍", "🗝️", "💣", "🛰️", "🦊"];

  Training.add({
    screen: SCREEN,
    icon: "🃏",
    title: "Agenten-Memory",
    text: "Findet alle 8 Paare mit so wenig Zügen wie möglich.",
  });

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  App.register(SCREEN, {
    render(root, app) {
      root.innerHTML = Training.frame(SCREEN, `
        <p class="lead center">Dreht zwei Karten um. Gleiche Bilder bleiben offen. Wer schafft es mit den wenigsten Zügen?</p>
        <p class="round-info">Züge: <span id="moves">0</span> · Paare: <span id="pairs">0</span>/${SYMBOLS.length}</p>
        <div class="memory" id="board"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <button class="btn" type="button" id="again">Neues Spiel 🔄</button>
      `);
      UI.bindBack(root, app);

      const board = root.querySelector("#board");
      const feedback = root.querySelector("#feedback");
      let open = [];
      let moves = 0;
      let pairs = 0;
      let busy = false;

      function start() {
        moves = 0; pairs = 0; open = []; busy = false;
        feedback.textContent = "";
        feedback.className = "feedback";
        root.querySelector("#moves").textContent = 0;
        root.querySelector("#pairs").textContent = 0;
        board.innerHTML = shuffle(SYMBOLS.concat(SYMBOLS)).map((s) => `
          <button type="button" class="mem-card" data-s="${s}" aria-label="Verdeckte Karte">
            <span class="mem-back" aria-hidden="true">?</span>
            <span class="mem-front" aria-hidden="true">${s}</span>
          </button>`).join("");
      }
      start();

      board.addEventListener("click", async (e) => {
        const card = e.target.closest(".mem-card");
        if (!card || busy || card.classList.contains("flip")) return;
        card.classList.add("flip");
        card.setAttribute("aria-label", card.dataset.s);
        Sound.play("key");
        open.push(card);
        if (open.length < 2) return;

        moves++;
        root.querySelector("#moves").textContent = moves;
        const [a, b] = open;
        open = [];
        if (a.dataset.s === b.dataset.s) {
          a.classList.add("done");
          b.classList.add("done");
          pairs++;
          root.querySelector("#pairs").textContent = pairs;
          Sound.play("coin");
          if (pairs === SYMBOLS.length) {
            const isNew = Training.record(SCREEN, moves, root, true);
            Sound.play("success");
            FX.burst(80);
            feedback.className = "feedback ok";
            feedback.textContent = isNew ? `Geschafft in ${moves} Zügen! NEUER REKORD! 🏆` : `Geschafft in ${moves} Zügen!`;
          }
          return;
        }
        busy = true;
        await FX.wait(800);
        [a, b].forEach((c) => { c.classList.remove("flip"); c.setAttribute("aria-label", "Verdeckte Karte"); });
        busy = false;
      });

      root.querySelector("#again").addEventListener("click", () => { Sound.play("click"); start(); });
    },
  });
})();
