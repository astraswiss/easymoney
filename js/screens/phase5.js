/*
 * MISSION 5: Der letzte Tresor.
 * Der Code sind die Beweis-Ziffern aus Mission 1–4, aber RÜCKWÄRTS.
 */
(function () {
  const PHASE = { n: 5 };

  App.register("phase5", {
    render(root, app) {
      const digits = CONFIG.phases.filter((p) => p.digit !== null).map((p) => p.digit);
      const code = digits.slice().reverse().join("");
      let attempts = 0;

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>
        <div class="task-box">
          <span class="label">&gt; HINWEIS</span>
          <p>Der Code sind eure Beweis-Ziffern aus den Missionen 1 bis 4. Aber Achtung: <strong>RÜCKWÄRTS!</strong> Fangt mit Mission 4 an.</p>
        </div>
        <div class="vault" id="vault" aria-hidden="true">
          <div class="vault-door"><div class="vault-wheel"></div></div>
        </div>
        <div id="pad"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <p class="hint" id="hint" hidden></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        "Das ist der letzte Tresor. Darin liegt die große Belohnung. Nur echte Agenten kennen den Code!");

      const panel = root.querySelector(".panel");
      const feedback = root.querySelector("#feedback");

      UI.keypad(root.querySelector("#pad"), {
        length: code.length,
        onSubmit(entry, api) {
          if (entry === code) {
            root.querySelector("#vault").classList.add("open");
            Sound.play("unlock");
            root.querySelectorAll(".key").forEach((k) => (k.disabled = true));
            setTimeout(() => {
              const total = CONFIG.kids.map((k) => `> ${Store.kidLabel(k.id)}: ${UI.chf(Store.kid(k.id).money + CONFIG.prizePerPhase)}`);
              UI.completeMission(PHASE.n, app, {
                title: "MISSION ERFÜLLT!",
                sub: "Ihr seid echte TEMU-Agenten! 🏆",
                lines: ["> Tresor ... OFFEN", "> Kontostand am Ende:", ...total],
              });
            }, 900);
            return;
          }
          attempts++;
          api.fail();
          UI.wrong(panel, feedback);
          if (attempts >= 2) {
            const hint = root.querySelector("#hint");
            hint.hidden = false;
            hint.textContent = "TIPP: Schaut in der Zentrale bei den BEWEIS-ZIFFERN nach. M4 kommt zuerst!";
          }
        },
      });
    },
  });
})();
