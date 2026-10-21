/*
 * MISSION 5: Der letzte Tresor.
 * Der Code besteht aus den Beweis-Ziffern von Mission 1–4, in einer Reihenfolge,
 * die man mit 3 Hinweisen herausfinden muss. Nach 3 Fehlern: Alarm und Sperre.
 */
(function () {
  const PHASE = {
    n: 5,
    maxTries: 3, // so viele Fehlversuche, dann Alarm
    lockSeconds: 30, // so lange ist der Tresor nach dem Alarm gesperrt
  };

  // Reihenfolge: größte Ziffer zuerst, Ziffer aus Mission 2 an zweiter Stelle,
  // die übrige an dritter, kleinste zuletzt. (Mit 7, 4, 9, 2 → 9 4 7 2)
  function vaultCode() {
    const d = CONFIG.phases.filter((p) => p.digit !== null).map((p) => p.digit);
    const max = Math.max(...d);
    const min = Math.min(...d);
    const m2 = CONFIG.phases[1].digit;
    const rest = d.filter((x) => x !== max && x !== min && x !== m2);
    return [max, m2, ...rest, min].join("");
  }

  let timer = null;

  App.register("phase5", {
    render(root, app) {
      const code = vaultCode();
      let tries = 0;

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>
        <div class="task-box">
          <span class="label">&gt; DREI HINWEISE</span>
          <p>Der Code sind eure 4 Beweis-Ziffern. Aber in welcher Reihenfolge?</p>
          <ol class="clues">
            <li>Die <b>erste</b> Ziffer ist die <b>größte</b>.</li>
            <li>Die <b>letzte</b> Ziffer ist die <b>kleinste</b>.</li>
            <li>Die Ziffer aus <b>Mission 2</b> kommt an <b>zweiter</b> Stelle.</li>
          </ol>
        </div>
        <div class="vault" id="vault" aria-hidden="true">
          <div class="vault-door"><div class="vault-wheel"></div></div>
        </div>
        <p class="round-info" id="tries"></p>
        <div id="pad"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        "Das ist der letzte Tresor. Darin liegt die große Belohnung. Denkt gut nach: Nach 3 Fehlern geht der Alarm los!");

      const panel = root.querySelector(".panel");
      const feedback = root.querySelector("#feedback");
      const triesEl = root.querySelector("#tries");
      const keys = () => root.querySelectorAll(".key");
      const showTries = () => { triesEl.textContent = `Versuche übrig: ${PHASE.maxTries - tries}`; };
      showTries();

      function alarm() {
        let left = PHASE.lockSeconds;
        keys().forEach((k) => (k.disabled = true));
        panel.classList.add("alarm");
        Sound.play("error");
        const tick = () => {
          feedback.className = "feedback wrong";
          feedback.textContent = `🚨 ALARM! Tresor gesperrt: noch ${left} Sekunden.`;
          if (left-- <= 0) {
            clearInterval(timer);
            panel.classList.remove("alarm");
            keys().forEach((k) => (k.disabled = false));
            tries = 0;
            showTries();
            feedback.className = "feedback almost";
            feedback.textContent = "Alarm vorbei. Lest die Hinweise nochmal genau!";
          }
        };
        tick();
        timer = setInterval(tick, 1000);
      }

      UI.keypad(root.querySelector("#pad"), {
        length: code.length,
        onSubmit(entry, api) {
          if (entry === code) {
            root.querySelector("#vault").classList.add("open");
            Sound.play("unlock");
            keys().forEach((k) => (k.disabled = true));
            setTimeout(() => {
              Game.solve(PHASE.n);
              const total = CONFIG.kids.map((k) => `> ${k.agent}: ${UI.chf(Game.money(k.id))}`);
              UI.completeMission(PHASE.n, app, {
                title: "MISSION ERFÜLLT!",
                sub: "Ihr seid echte TEMU-Agenten! 🏆",
                lines: ["> Tresor ... OFFEN", "> Kontostand am Ende:", ...total],
              });
            }, 900);
            return;
          }
          tries++;
          api.fail();
          showTries();
          if (tries >= PHASE.maxTries) { alarm(); return; }
          UI.wrong(panel, feedback);
        },
      });
    },

    leave() {
      clearInterval(timer);
    },
  });
})();
