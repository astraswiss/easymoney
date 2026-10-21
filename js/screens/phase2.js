/*
 * MISSION 2: Der Code-Knacker.
 * Eine Nachricht in Zahlen. A=1, B=2 ... Z=26 – aber jede Zahl ist um SHIFT zu groß.
 * Beim Prüfen wird nur gesagt, WIE VIELE Buchstaben falsch sind, nicht welche.
 */
(function () {
  const PHASE = {
    n: 2,
    secret: "AGENTEN LIEBEN PIZZA", // nur Buchstaben A–Z und Leerzeichen
    shift: 2, // jede Zahl ist um so viel zu groß
    hintAfter: 3,
    hintText: "TIPP: Die erste Zahl ist 3. Und 3 − 2 = 1. 1 ist A!",
  };

  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  App.register("phase2", {
    render(root, app) {
      let attempts = 0;
      const words = PHASE.secret.split(" ");
      const num = (ch) => ABC.indexOf(ch) + 1 + PHASE.shift;

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>

        <div class="task-box">
          <span class="label">&gt; ACHTUNG, TRICK!</span>
          <p>Der Feind hat den Code verschoben. Jede Zahl ist um <b>${PHASE.shift} zu groß</b>. Rechnet zuerst minus ${PHASE.shift}!</p>
        </div>

        <div class="code-msg" id="code">
          ${words.map((w) => `
            <div class="code-word">
              ${[...w].map((ch) => `
                <label class="code-cell">
                  <span class="code-num">${num(ch)}</span>
                  <input class="code-input" maxlength="1" autocomplete="off" autocapitalize="characters"
                         spellcheck="false" data-ch="${ch}" aria-label="Buchstabe für Zahl ${num(ch)}">
                </label>`).join("")}
            </div>`).join("")}
        </div>

        <div>
          <span class="label">&gt; GEHEIME CODE-TABELLE</span>
          <div class="abc-table">
            ${[...ABC].map((c, i) => `<span><b>${c}</b>${i + 1}</span>`).join("")}
          </div>
        </div>

        <button class="btn" type="button" id="check">Code prüfen</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <p class="hint" id="hint" hidden></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        "Wir haben eine geheime Nachricht abgefangen! Jede Zahl ist ein Buchstabe. Knackt den Code!");

      const inputs = [...root.querySelectorAll(".code-input")];
      const panel = root.querySelector(".panel");
      const feedback = root.querySelector("#feedback");

      inputs.forEach((inp, i) => {
        inp.addEventListener("input", () => {
          inp.value = inp.value.replace(/[^a-z]/gi, "").slice(-1).toUpperCase();
          if (inp.value) { Sound.play("key"); if (inputs[i + 1]) inputs[i + 1].focus(); }
        });
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
          if (e.key === "Enter") check();
        });
      });

      root.querySelector("#check").addEventListener("click", check);

      function check() {
        const missing = inputs.filter((x) => !x.value).length;
        if (missing) {
          Sound.play("blip");
          feedback.className = "feedback almost";
          feedback.textContent = `Es fehlen noch ${missing} Buchstaben, Agent!`;
          return;
        }
        const wrongCount = inputs.filter((x) => x.value !== x.dataset.ch).length;
        if (!wrongCount) {
          inputs.forEach((x) => { x.disabled = true; x.classList.add("right"); });
          root.querySelector("#check").disabled = true;
          feedback.className = "feedback";
          feedback.textContent = "";
          UI.completeMission(PHASE.n, app, { lines: [`> Nachricht entschlüsselt: ${PHASE.secret}`] });
          return;
        }
        attempts++;
        UI.wrong(panel, feedback, wrongCount === 1
          ? "FALSCH! 😂 Ein Buchstabe stimmt nicht. Welcher wohl?"
          : `FALSCH! 😂 ${wrongCount} Buchstaben stimmen nicht. ${CONFIG.uncle} glaubt nicht an euch!`);
        if (attempts >= PHASE.hintAfter) {
          const hint = root.querySelector("#hint");
          hint.hidden = false;
          hint.textContent = PHASE.hintText;
        }
      }
    },
  });
})();
