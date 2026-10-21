/*
 * MISSION 1: Das geheime Passwort.
 * Das Passwort steht auf einem Zettel, der bei Baci Bardh zu Hause versteckt ist.
 */
(function () {
  const PHASE = {
    mission: "Das Passwort steht auf einem geheimen Zettel. Der Zettel ist bei Baci Bardh zu Hause versteckt. Findet ihn!",
    answer: "lisaleosindnichtschlau", // Groß/Klein und Leerzeichen sind egal
    hintAfter: 3, // nach so vielen Fehlversuchen kommt ein Tipp
    hintText: "TIPP: Schreibt genau ab, was auf dem Zettel steht. Leerzeichen sind egal.",
  };

  const LOCK_SVG = `
    <svg class="lock" viewBox="0 0 76 92" aria-hidden="true">
      <path class="shackle" d="M18 42 V26 a20 20 0 0 1 40 0 V42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
      <rect x="6" y="40" width="64" height="48" rx="6" fill="none" stroke="currentColor" stroke-width="5"/>
      <circle cx="38" cy="60" r="6" fill="currentColor"/>
      <rect x="35" y="62" width="6" height="14" rx="2" fill="currentColor"/>
    </svg>`;

  App.register("login", {
    render(root, app) {
      let attempts = 0;
      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state"><span class="blink-dot"></span>SYSTEM GESPERRT</span>
            <span>AGENTEN-LOGIN v1.0</span>
          </div>

          ${LOCK_SVG}

          <h1 class="title">
            <span class="big glitch" data-text="TOP SECRET">TOP SECRET</span>
            <span class="small">– ZUGANG GESPERRT! –</span>
          </h1>

          <p class="lead" id="lead"></p>

          <div class="riddle">
            <span class="label">&gt; GEHEIMER AUFTRAG</span>
            <p>${PHASE.mission}</p>
          </div>

          <form class="answer-form" id="login-form" autocomplete="off" novalidate>
            <label for="answer">&gt; GEHEIMES PASSWORT EINGEBEN:</label>
            <div class="answer-row">
              <input class="answer-input" id="answer" name="answer" type="text"
                     placeholder="PASSWORT" autocapitalize="characters" autocorrect="off"
                     spellcheck="false" enterkeyhint="go">
              <button class="btn" type="submit">Passwort prüfen</button>
            </div>
          </form>

          <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
          <p class="hint" id="hint" hidden></p>
          <button class="btn ghost" type="button" id="rules">📜 Wie funktioniert das Spiel?</button>
        </div>`;

      const panel = root.querySelector(".panel");
      const form = root.querySelector("#login-form");
      const input = root.querySelector("#answer");
      const feedback = root.querySelector("#feedback");
      const hint = root.querySelector("#hint");
      const lock = root.querySelector(".lock");

      root.querySelector("#rules").addEventListener("click", () => {
        Sound.play("click");
        app.go("regeln", { back: "login" });
      });

      FX.typeText(
        root.querySelector("#lead"),
        "Stopp, Agent! Du darfst hier nicht rein. Findet zuerst das geheime Passwort, um Zugang zu bekommen!"
      );

      input.addEventListener("keydown", (e) => {
        if (e.key.length === 1) Sound.play("key");
      });
      input.addEventListener("input", () => input.classList.remove("wrong"));

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const guess = app.normalize(input.value);

        if (!guess) {
          Sound.play("blip");
          feedback.className = "feedback almost";
          feedback.textContent = "Du musst schon etwas eintippen, Agent! ⌨️";
          input.focus();
          return;
        }

        if (guess === PHASE.answer) {
          success();
          return;
        }

        attempts++;
        input.classList.add("wrong");
        UI.wrong(panel, feedback);
        if (attempts >= PHASE.hintAfter) {
          hint.hidden = false;
          hint.textContent = PHASE.hintText;
        }
        input.select();
      });

      async function success() {
        form.querySelector("button").disabled = true;
        input.disabled = true;
        input.classList.add("right");
        feedback.className = "feedback";
        feedback.textContent = "";
        hint.hidden = true;
        lock.classList.add("open");
        const state = root.querySelector(".state");
        state.classList.add("ok");
        state.lastChild.textContent = "ENTSPERRT";
        Sound.play("unlock");
        await FX.wait(600);
        UI.completeMission(1, app, {
          title: "ZUGANG ERLAUBT!",
          sub: "Willkommen in der geheimen Zentrale!",
          lines: ["> Firewall wird umgangen ... OK", "> Tür zur Zentrale ... OFFEN"],
          button: "Weiter zu den Spielregeln ▶",
          next: "regeln",
        });
      }

      setTimeout(() => input.focus({ preventScroll: true }), 400);
    },
  });
})();
