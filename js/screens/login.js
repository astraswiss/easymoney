/*
 * SCHRITT 1: Das geheime Passwort.
 * Texte und Antworten stehen oben in CONFIG und lassen sich leicht ändern.
 */
(function () {
  const CONFIG = {
    riddle: "„Ich bin das Gegenteil von offen. Was bin ich?“",
    answer: "geheim",
    // Antworten, die fast stimmen, bekommen einen freundlichen Tipp
    almost: ["geschlossen", "zu", "verschlossen", "abgeschlossen"],
    almostText: "Gute Idee! Aber ein Agent denkt GEHEIMER… 🕵️",
    wrongText: "FALSCH! 😂 Versuch es noch einmal. Dein Onkel glaubt nicht an dich!",
    hintAfter: 3, // nach so vielen Fehlversuchen kommt ein Tipp
    hintText: "TIPP: Das Wort hat 6 Buchstaben und fängt mit G an.",
    next: "zentrale", // dieser Screen kommt nach dem richtigen Passwort
  };

  const LOCK_SVG = `
    <svg class="lock" viewBox="0 0 76 92" aria-hidden="true">
      <path class="shackle" d="M18 42 V26 a20 20 0 0 1 40 0 V42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
      <rect x="6" y="40" width="64" height="48" rx="6" fill="none" stroke="currentColor" stroke-width="5"/>
      <circle cx="38" cy="60" r="6" fill="currentColor"/>
      <rect x="35" y="62" width="6" height="14" rx="2" fill="currentColor"/>
    </svg>`;

  let attempts = 0;

  App.register("login", {
    render(root, app) {
      attempts = 0;
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
            <span class="label">&gt; RÄTSEL #1</span>
            <p>${CONFIG.riddle}</p>
          </div>

          <form class="answer-form" id="login-form" autocomplete="off" novalidate>
            <label for="answer">&gt; GEHEIMES PASSWORT EINGEBEN:</label>
            <div class="answer-row">
              <input class="answer-input" id="answer" name="answer" type="text"
                     placeholder="______" autocapitalize="characters" autocorrect="off"
                     spellcheck="false" enterkeyhint="go">
              <button class="btn" type="submit">Passwort prüfen</button>
            </div>
          </form>

          <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
          <p class="hint" id="hint" hidden></p>
        </div>`;

      const panel = root.querySelector(".panel");
      const form = root.querySelector("#login-form");
      const input = root.querySelector("#answer");
      const feedback = root.querySelector("#feedback");
      const hint = root.querySelector("#hint");
      const lock = root.querySelector(".lock");

      FX.typeText(
        root.querySelector("#lead"),
        "Stopp, Agent! Du darfst hier nicht rein. Löse zuerst das Rätsel, um Zugang zu bekommen!"
      );

      input.addEventListener("keydown", (e) => {
        if (e.key.length === 1) Sound.play("key");
      });
      input.addEventListener("input", () => {
        input.classList.remove("wrong");
      });

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

        if (guess === CONFIG.answer) {
          success();
          return;
        }

        attempts++;
        const isAlmost = CONFIG.almost.includes(guess);
        Sound.play(isAlmost ? "almost" : "error");
        feedback.className = "feedback " + (isAlmost ? "almost" : "wrong");
        feedback.textContent = isAlmost ? CONFIG.almostText : CONFIG.wrongText;
        input.classList.add("wrong");
        FX.replayClass(panel, "shake");
        FX.replayClass(panel, "flash-red");
        FX.replayClass(feedback, "shake");
        if (attempts >= CONFIG.hintAfter) {
          hint.hidden = false;
          hint.textContent = CONFIG.hintText;
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
        root.querySelector(".state").classList.add("ok");
        root.querySelector(".state").lastChild.textContent = "ENTSPERRT";
        Sound.play("unlock");
        app.markSolved("login");
        await FX.wait(600);
        showGranted(app);
      }

      setTimeout(() => input.focus({ preventScroll: true }), 400);
    },
  });

  /* Die coole Erfolgs-Animation */
  async function showGranted(app) {
    const overlay = document.createElement("div");
    overlay.className = "granted";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Zugang erlaubt");
    overlay.innerHTML = `
      <div class="granted-box">
        <h2 class="granted-title glitch" data-text="ZUGANG ERLAUBT!">ZUGANG ERLAUBT!</h2>
        <p class="granted-sub">Willkommen in der geheimen Zentrale!</p>
        <pre class="terminal" id="terminal"></pre>
        <div class="progress" aria-hidden="true"><span id="bar"></span></div>
        <button class="btn go" id="enter" type="button" hidden>Zentrale betreten ▶</button>
      </div>`;
    document.body.appendChild(overlay);
    Sound.play("success");
    FX.burst();

    const term = overlay.querySelector("#terminal");
    const bar = overlay.querySelector("#bar");
    const lines = [
      "> Passwort ... RICHTIG ✔",
      "> Firewall wird umgangen ... OK",
      "> Agenten-Ausweis wird gedruckt ... OK",
      "> Tür zur Zentrale ... OFFEN",
    ];
    for (let i = 0; i < lines.length; i++) {
      const row = document.createElement("div");
      term.appendChild(row);
      await FX.typeText(row, lines[i], 22);
      bar.style.width = ((i + 1) / lines.length) * 100 + "%";
      Sound.play("blip");
      await FX.wait(200);
    }

    const enter = overlay.querySelector("#enter");
    enter.hidden = false;
    enter.focus();
    enter.addEventListener("click", () => {
      Sound.play("click");
      overlay.remove();
      app.go(CONFIG.next);
    });
  }
})();
