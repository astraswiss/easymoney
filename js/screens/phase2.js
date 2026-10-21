/*
 * MISSION 2: Der Code-Knacker.
 * Eine Nachricht in Zahlen: A=1, B=2, ... Z=26. Die Kinder tippen die Buchstaben ein.
 */
(function () {
  const PHASE = {
    n: 2,
    secret: "SUPER AGENT", // die geheime Nachricht (nur Buchstaben A–Z und Leerzeichen)
    hintAfter: 2,
    hintText: "TIPP: Sucht jede Zahl in der Tabelle. 19 ist S!",
  };

  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  App.register("phase2", {
    render(root, app) {
      let attempts = 0;
      const words = PHASE.secret.split(" ");

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>

        <div class="code-msg" id="code">
          ${words.map((w) => `
            <div class="code-word">
              ${[...w].map((ch) => `
                <label class="code-cell">
                  <span class="code-num">${ABC.indexOf(ch) + 1}</span>
                  <input class="code-input" maxlength="1" autocomplete="off" autocapitalize="characters"
                         spellcheck="false" data-ch="${ch}" aria-label="Buchstabe für Zahl ${ABC.indexOf(ch) + 1}">
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
          inp.value = inp.value.replace(/[^a-zäöü]/gi, "").slice(-1).toUpperCase();
          inp.classList.remove("wrong", "right");
          if (inp.value) { Sound.play("key"); if (inputs[i + 1]) inputs[i + 1].focus(); }
        });
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
          if (e.key === "Enter") check();
        });
      });

      root.querySelector("#check").addEventListener("click", check);

      function check() {
        if (inputs.some((x) => !x.value)) {
          Sound.play("blip");
          feedback.className = "feedback almost";
          feedback.textContent = "Es fehlen noch Buchstaben, Agent!";
          return;
        }
        let allRight = true;
        inputs.forEach((x) => {
          const ok = x.value === x.dataset.ch;
          x.classList.toggle("right", ok);
          x.classList.toggle("wrong", !ok);
          if (!ok) allRight = false;
        });
        if (allRight) {
          inputs.forEach((x) => (x.disabled = true));
          root.querySelector("#check").disabled = true;
          feedback.className = "feedback";
          feedback.textContent = "";
          UI.completeMission(PHASE.n, app, { lines: [`> Nachricht entschlüsselt: ${PHASE.secret}`] });
          return;
        }
        attempts++;
        UI.wrong(panel, feedback);
        if (attempts >= PHASE.hintAfter) {
          const hint = root.querySelector("#hint");
          hint.hidden = false;
          hint.textContent = PHASE.hintText;
        }
      }
    },
  });
})();
