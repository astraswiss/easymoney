/*
 * ÜBERRASCHUNG 22.10.: Der Blitz-Rechner.
 * 15 Rechnungen HINTEREINANDER richtig, je 6 Sekunden. Die falschen Antworten liegen ganz nah dran.
 * Ein Fehler oder zu langsam = zurück auf 0.
 */
(function () {
  const EVENT_ID = "rechner";
  const NEED = 15;
  const SECONDS = 6;

  const rand = (a, b) => a + ((Math.random() * (b - a + 1)) | 0);
  const shuffle = (arr) => arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

  // Je weiter man ist, desto schwerer
  function makeTask(streak) {
    const kind = streak < 5 ? rand(0, 1) : rand(0, 3);
    let text, result;
    if (kind === 0) { const a = rand(6, 25), b = rand(5, 19); text = `${a} + ${b}`; result = a + b; }
    else if (kind === 1) { const a = rand(15, 40), b = rand(4, a - 3); text = `${a} − ${b}`; result = a - b; }
    else if (kind === 2) { const a = rand(2, 9), b = rand(2, 6); text = `${a} × ${b}`; result = a * b; }
    else { const a = rand(5, 15), b = rand(3, 9), c = rand(2, a + b - 1); text = `${a} + ${b} − ${c}`; result = a + b - c; }
    const wrong = new Set();
    for (const d of shuffle([1, -1, 2, -2, 10, -10])) {
      if (wrong.size === 3) break;
      if (result + d >= 0) wrong.add(result + d);
    }
    return { text, result, options: shuffle([result, ...wrong]) };
  }

  let timeout = null;

  App.register("surprise-rechner", {
    render(root, app) {
      if (!Events.guard(root, app, EVENT_ID)) return;

      root.innerHTML = Events.frame(EVENT_ID,
        `Rechnet ${NEED} Aufgaben HINTEREINANDER richtig. Ihr habt je ${SECONDS} Sekunden. Ein Fehler, und es geht von vorne los! 😈 Papier ist erlaubt.`, `
        <div id="play" hidden>
          <div class="da-progress" id="progress"></div>
          <div class="da-timer"><span id="bar"></span></div>
          <div class="da-word" id="task"></div>
          <div class="da-colors" id="options"></div>
        </div>
        <button class="btn go" type="button" id="start">Start ▶</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      const $ = (s) => root.querySelector(s);
      const panel = $(".panel");
      const feedback = $("#feedback");
      let streak = 0;
      let task = null;
      let active = false;

      const drawProgress = () => {
        $("#progress").innerHTML = Array.from({ length: NEED }, (_, i) => `<span class="${i < streak ? "on" : ""}"></span>`).join("");
      };

      function next() {
        task = makeTask(streak);
        $("#task").textContent = `${task.text} = ?`;
        $("#options").innerHTML = task.options.map((o) => `<button type="button" class="da-dir" data-v="${o}">${o}</button>`).join("");
        const bar = $("#bar");
        bar.style.transition = "none";
        bar.style.width = "100%";
        void bar.offsetWidth;
        bar.style.transition = `width ${SECONDS}s linear`;
        bar.style.width = "0%";
        active = true;
        clearTimeout(timeout);
        timeout = setTimeout(() => fail("Zu langsam! ⏰"), SECONDS * 1000);
      }

      async function fail(why) {
        active = false;
        clearTimeout(timeout);
        streak = 0;
        drawProgress();
        UI.wrong(panel, feedback, `${why} Richtig war ${task.result}. Zurück auf 0! 😈`);
        await FX.wait(1500);
        if (root.isConnected) next();
      }

      $("#options").addEventListener("click", (e) => {
        const b = e.target.closest("[data-v]");
        if (!b || !active) return;
        if (Number(b.dataset.v) !== task.result) { fail("FALSCH!"); return; }
        active = false;
        clearTimeout(timeout);
        streak++;
        drawProgress();
        Sound.play("blip");
        feedback.className = "feedback ok";
        feedback.textContent = `${streak} von ${NEED}`;
        if (streak >= NEED) { $("#play").hidden = true; UI.completeEvent(EVENT_ID, app); return; }
        next();
      });

      $("#start").addEventListener("click", () => {
        Sound.play("click");
        $("#start").hidden = true;
        $("#play").hidden = false;
        streak = 0;
        drawProgress();
        $("#play").scrollIntoView({ block: "end", behavior: FX.reduceMotion ? "auto" : "smooth" });
        next();
      });

      Events.watch(EVENT_ID, root, app, () => { active = false; clearTimeout(timeout); });
    },

    leave() {
      Events.stop();
      clearTimeout(timeout);
    },
  });
})();
