/*
 * ÜBERRASCHUNG: Der Doppelagent. Nur im Zeitfenster aus CONFIG.events spielbar.
 * 3 Stufen. In jeder Stufe muss man X-mal HINTEREINANDER richtig sein.
 * Ein Fehler oder zu langsam = Zähler dieser Stufe zurück auf 0.
 */
(function () {
  const EVENT_ID = "doppelagent";

  const COLORS = [
    { name: "ROT", hex: "#ff3355" },
    { name: "BLAU", hex: "#3d7bff" },
    { name: "GRÜN", hex: "#3ddc5a" },
    { name: "GELB", hex: "#ffd400" },
  ];
  const DIRS = [
    { key: "up", angle: 0, label: "▲", arrow: "ArrowUp" },
    { key: "right", angle: 90, label: "▶", arrow: "ArrowRight" },
    { key: "down", angle: 180, label: "▼", arrow: "ArrowDown" },
    { key: "left", angle: 270, label: "◀", arrow: "ArrowLeft" },
  ];
  const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

  const STAGES = [
    {
      name: "Stufe 1: Die Farb-Falle",
      rule: "Ein Farbwort erscheint, aber in einer ANDEREN Farbe. Drückt die FARBE, in der das Wort geschrieben ist, nicht das Wort!",
      need: 12,
      seconds: 3,
      types: ["color"],
    },
    {
      name: "Stufe 2: Das Pfeil-Chaos",
      rule: "Ein Pfeil erscheint. Blauer Pfeil: drückt die GEGENRICHTUNG. Roter Pfeil: drückt die GLEICHE Richtung!",
      need: 12,
      seconds: 2.5,
      types: ["arrow"],
    },
    {
      name: "Stufe 3: Das Finale",
      rule: "Alles gemischt und schneller! Farbwort: drückt die FARBE der Schrift. Blauer Pfeil: GEGENRICHTUNG. Roter Pfeil: GLEICHE Richtung.",
      need: 10,
      seconds: 2.2,
      types: ["color", "arrow"],
    },
  ];

  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  let timeout = null;
  let keyHandler = null;

  App.register("surprise-doppelagent", {
    render(root, app) {
      const ev = Game.event(EVENT_ID);
      const st = Game.eventStatus(EVENT_ID);

      if (st.kind !== "open") {
        root.innerHTML = `
          <div class="panel">
            <h1 class="title"><span class="mid">${UI.esc(ev.title.toUpperCase())}</span></h1>
            <p class="lead center">${st.kind === "solved" ? "Die habt ihr schon geschafft! 🏆" : "Diese Überraschung ist gerade nicht offen."}</p>
            <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
          </div>`;
        UI.bindBack(root, app);
        return;
      }

      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>⚡ ÜBERRASCHUNG</span>
            <span>+${UI.chf(ev.prize)} FÜR JEDEN</span>
          </div>
          <h1 class="title"><span class="mid glitch" data-text="DER DOPPELAGENT">DER DOPPELAGENT</span></h1>
          <p class="lead center" id="lead"></p>

          <p class="da-stage" id="stage"></p>
          <div class="task-box"><span class="label">&gt; REGEL</span><p id="rule"></p></div>

          <div id="play" hidden>
            <div class="da-progress" id="progress"></div>
            <div class="da-timer"><span id="bar"></span></div>

            <div id="color-ui" hidden>
              <div class="da-word" id="word"></div>
              <div class="da-colors">
                ${COLORS.map((c, i) => `<button type="button" class="da-color" data-color="${i}" style="background:${c.hex}">${c.name}</button>`).join("")}
              </div>
            </div>

            <div id="arrow-ui" hidden>
              <div class="da-arrow-box">
                <svg class="da-arrow" id="arrow" viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M50 8 L88 50 H64 V92 H36 V50 H12 Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="da-pad">
                <span></span><button type="button" class="da-dir" data-dir="up" aria-label="Hoch">▲</button><span></span>
                <button type="button" class="da-dir" data-dir="left" aria-label="Links">◀</button><span></span><button type="button" class="da-dir" data-dir="right" aria-label="Rechts">▶</button>
                <span></span><button type="button" class="da-dir" data-dir="down" aria-label="Runter">▼</button><span></span>
              </div>
            </div>
          </div>

          <button class="btn go" type="button" id="start">Stufe starten ▶</button>
          <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
          <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
        </div>`;
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        "Ein Doppelagent will euch verwirren! 3 Stufen. Ein Fehler, und ihr fangt die Stufe von vorne an. 😈");

      const $ = (s) => root.querySelector(s);
      const panel = $(".panel");
      const feedback = $("#feedback");
      let stage = 0;
      let streak = 0;
      let item = null;
      let active = false;

      function showStage() {
        const s = STAGES[stage];
        $("#stage").textContent = s.name;
        $("#rule").textContent = s.rule;
        $("#play").hidden = true;
        $("#start").hidden = false;
        $("#start").textContent = stage === 0 ? "Stufe 1 starten ▶" : `Stufe ${stage + 1} starten ▶`;
      }

      function drawProgress() {
        const s = STAGES[stage];
        $("#progress").innerHTML = Array.from({ length: s.need }, (_, i) => `<span class="${i < streak ? "on" : ""}"></span>`).join("");
      }

      function next() {
        clearTimeout(timeout);
        const s = STAGES[stage];
        const type = pick(s.types);
        if (type === "color") {
          const word = pick(COLORS);
          const ink = pick(COLORS.filter((c) => c !== word));
          item = { type, answer: COLORS.indexOf(ink) };
          $("#word").textContent = word.name;
          $("#word").style.color = ink.hex;
        } else {
          const dir = pick(DIRS);
          const red = Math.random() < 0.4;
          item = { type, answer: red ? dir.key : OPPOSITE[dir.key] };
          const arrow = $("#arrow");
          arrow.style.transform = `rotate(${dir.angle}deg)`;
          arrow.style.color = red ? COLORS[0].hex : COLORS[1].hex;
        }
        $("#color-ui").hidden = item.type !== "color";
        $("#arrow-ui").hidden = item.type !== "arrow";

        const bar = $("#bar");
        bar.style.transition = "none";
        bar.style.width = "100%";
        void bar.offsetWidth;
        bar.style.transition = `width ${s.seconds}s linear`;
        bar.style.width = "0%";
        active = true;
        timeout = setTimeout(() => fail("Zu langsam! ⏰"), s.seconds * 1000);
      }

      async function fail(why) {
        active = false;
        clearTimeout(timeout);
        streak = 0;
        drawProgress();
        UI.wrong(panel, feedback, `${why} Zurück auf 0! 😈`);
        await FX.wait(900);
        if (root.isConnected) next();
      }

      async function answer(value) {
        if (!active) return;
        if (value !== item.answer) { fail("FALSCH!"); return; }
        active = false;
        clearTimeout(timeout);
        streak++;
        drawProgress();
        Sound.play("blip");
        feedback.className = "feedback ok";
        feedback.textContent = `${streak} von ${STAGES[stage].need}`;
        if (streak < STAGES[stage].need) { next(); return; }

        // Stufe geschafft
        Sound.play("success");
        FX.burst(60);
        stage++;
        streak = 0;
        if (stage >= STAGES.length) {
          $("#play").hidden = true;
          feedback.textContent = "";
          UI.completeEvent(EVENT_ID, app);
          return;
        }
        feedback.textContent = "Stufe geschafft! Bereit für die nächste?";
        await FX.wait(400);
        showStage();
      }

      $("#start").addEventListener("click", () => {
        Sound.play("click");
        $("#start").hidden = true;
        $("#play").hidden = false;
        feedback.textContent = "";
        streak = 0;
        drawProgress();
        $("#play").scrollIntoView({ block: "end", behavior: FX.reduceMotion ? "auto" : "smooth" });
        next();
      });

      root.querySelectorAll("[data-color]").forEach((b) =>
        b.addEventListener("click", () => answer(Number(b.dataset.color)))
      );
      root.querySelectorAll("[data-dir]").forEach((b) =>
        b.addEventListener("click", () => answer(b.dataset.dir))
      );
      keyHandler = (e) => {
        const d = DIRS.find((x) => x.arrow === e.key);
        if (d && item && item.type === "arrow") { e.preventDefault(); answer(d.key); }
      };
      document.addEventListener("keydown", keyHandler);

      showStage();
    },

    leave() {
      clearTimeout(timeout);
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
    },
  });
})();
