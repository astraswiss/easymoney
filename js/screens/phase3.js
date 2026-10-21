/*
 * MISSION 3: Das Laser-Gedächtnis.
 * Die Laser leuchten in einer Reihenfolge auf – die Kinder drücken sie nach.
 */
(function () {
  const PHASE = {
    n: 3,
    startLength: 4, // so viele Laser in Runde 1
    goalLength: 8, // so viele Laser in der letzten Runde (jede Runde wird auch schneller)
  };

  const PADS = [
    { color: "cyan", freq: 330, name: "Blau" },
    { color: "pink", freq: 440, name: "Pink" },
    { color: "orange", freq: 554, name: "Orange" },
    { color: "green", freq: 659, name: "Grün" },
  ];

  let cancelled = false;

  App.register("phase3", {
    render(root, app) {
      cancelled = false;
      const rounds = PHASE.goalLength - PHASE.startLength + 1;

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>
        <p class="round-info" id="round">Runde 1 / ${rounds}</p>
        <div class="pads" id="pads">
          ${PADS.map((p, i) => `<button type="button" class="pad pad-${p.color}" data-i="${i}" aria-label="${p.name}" disabled></button>`).join("")}
        </div>
        <button class="btn" type="button" id="start">Laser starten ▶</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        "Die Laser leuchten in einer geheimen Reihenfolge. Schaut gut zu und drückt sie dann genau gleich! Jede Runde wird länger und schneller.");

      const panel = root.querySelector(".panel");
      const pads = [...root.querySelectorAll(".pad")];
      const feedback = root.querySelector("#feedback");
      const roundEl = root.querySelector("#round");
      const startBtn = root.querySelector("#start");

      let seq = [];
      let pos = 0;
      let accepting = false;

      const rand = () => (Math.random() * PADS.length) | 0;

      function setPads(on) {
        pads.forEach((p) => (p.disabled = !on));
        accepting = on;
      }

      async function flash(i, ms = 380) {
        Sound.note(PADS[i].freq, ms / 1000);
        pads[i].classList.add("lit");
        await FX.wait(ms);
        pads[i].classList.remove("lit");
      }

      async function playSeq() {
        setPads(false);
        feedback.className = "feedback";
        feedback.textContent = "Gut zuschauen …";
        await FX.wait(600);
        const speed = Math.max(220, 420 - (seq.length - PHASE.startLength) * 45);
        for (const i of seq) {
          if (cancelled) return;
          await flash(i, speed);
          await FX.wait(speed / 2);
        }
        if (cancelled) return;
        feedback.textContent = "Jetzt ihr!";
        pos = 0;
        setPads(true);
      }

      startBtn.addEventListener("click", () => {
        Sound.play("click");
        startBtn.hidden = true;
        seq = Array.from({ length: PHASE.startLength }, rand);
        roundEl.textContent = `Runde 1 / ${rounds}`;
        playSeq();
      });

      pads.forEach((pad, i) =>
        pad.addEventListener("click", async () => {
          if (!accepting) return;
          flash(i, 220);
          if (i !== seq[pos]) {
            setPads(false);
            UI.wrong(panel, feedback, "FALSCH! 😂 Baci Bardh glaubt nicht an dich! Schaut nochmal zu …");
            await FX.wait(1600);
            playSeq();
            return;
          }
          pos++;
          if (pos < seq.length) return;

          // Runde geschafft
          setPads(false);
          if (seq.length >= PHASE.goalLength) {
            feedback.textContent = "";
            UI.completeMission(PHASE.n, app, { lines: ["> Laser-Code geknackt ✔"] });
            return;
          }
          Sound.play("coin");
          feedback.className = "feedback ok";
          feedback.textContent = "Richtig! Nächste Runde wird länger …";
          seq.push(rand());
          roundEl.textContent = `Runde ${seq.length - PHASE.startLength + 1} / ${rounds}`;
          await FX.wait(900);
          playSeq();
        })
      );
    },

    leave() {
      cancelled = true;
    },
  });
})();
