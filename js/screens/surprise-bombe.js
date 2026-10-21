/*
 * ÜBERRASCHUNG 24.10.: Der Bomben-Entschärfer.
 * 6 Bomben hintereinander. Jede hat 3–5 Drähte. Das Handbuch sagt, welcher Draht durch muss.
 * 25 Sekunden pro Bombe. Falscher Draht oder zu langsam = BUMM, zurück zu Bombe 1.
 */
(function () {
  const EVENT_ID = "bombe";
  const BOMBS = 6;
  const SECONDS = 25;

  const WIRES = {
    rot: "#ff3355",
    blau: "#3d7bff",
    gelb: "#ffd400",
    weiss: "#f2f2f2",
  };
  const NAMES = Object.keys(WIRES);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const count = (wires, c) => wires.filter((w) => w === c).length;

  // Das Handbuch: die ERSTE Regel, die passt, gilt. Gibt den Index des Drahts zurück.
  function solve(wires) {
    if (count(wires, "rot") === 1) return wires.indexOf("rot");
    if (count(wires, "blau") === 0) return 1;
    if (count(wires, "gelb") >= 2) return wires.lastIndexOf("gelb");
    if (wires[wires.length - 1] === "weiss") return 0;
    return wires.length - 1;
  }

  let timeout = null;

  App.register("surprise-bombe", {
    render(root, app) {
      if (!Events.guard(root, app, EVENT_ID)) return;

      root.innerHTML = Events.frame(EVENT_ID,
        `Entschärft ${BOMBS} Bomben hintereinander! Lest das Handbuch GENAU. Ein falscher Draht = BUMM, und ihr fangt wieder bei Bombe 1 an! 💣`, `
        <div class="task-box">
          <span class="label">&gt; HANDBUCH – die ERSTE Regel, die passt, gilt!</span>
          <ol class="clues">
            <li>Gibt es <b>genau einen roten</b> Draht? → Schneidet den <b>roten</b> Draht.</li>
            <li>Sonst: Gibt es <b>keinen blauen</b> Draht? → Schneidet den <b>zweiten</b> Draht.</li>
            <li>Sonst: Gibt es <b>zwei oder mehr gelbe</b>? → Schneidet den <b>letzten gelben</b>.</li>
            <li>Sonst: Ist der <b>letzte</b> Draht <b>weiß</b>? → Schneidet den <b>ersten</b> Draht.</li>
            <li>Sonst → Schneidet den <b>letzten</b> Draht.</li>
          </ol>
        </div>
        <div id="play" hidden>
          <p class="round-info" id="bomb"></p>
          <div class="da-timer"><span id="bar"></span></div>
          <div class="bomb-box" id="wires"></div>
        </div>
        <button class="btn go" type="button" id="start">Erste Bombe ▶</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      const $ = (s) => root.querySelector(s);
      const panel = $(".panel");
      const feedback = $("#feedback");
      let bomb = 0;
      let wires = [];
      let active = false;

      function next() {
        const n = 3 + ((Math.random() * 3) | 0);
        wires = Array.from({ length: n }, () => pick(NAMES));
        $("#bomb").textContent = `Bombe ${bomb + 1} / ${BOMBS}`;
        $("#wires").innerHTML = wires.map((w, i) => `
          <button type="button" class="wire" data-i="${i}" style="--w:${WIRES[w]}" aria-label="Draht ${i + 1}: ${w}">
            <span class="wire-num">${i + 1}</span><span class="wire-line"></span>
          </button>`).join("");
        const bar = $("#bar");
        bar.style.transition = "none";
        bar.style.width = "100%";
        void bar.offsetWidth;
        bar.style.transition = `width ${SECONDS}s linear`;
        bar.style.width = "0%";
        active = true;
        clearTimeout(timeout);
        timeout = setTimeout(() => boom("Zu langsam!"), SECONDS * 1000);
      }

      async function boom(why) {
        active = false;
        clearTimeout(timeout);
        bomb = 0;
        FX.replayClass(panel, "flash-red");
        UI.wrong(panel, feedback, `💥 BUMM! ${why} Zurück zu Bombe 1! 😈`);
        await FX.wait(1800);
        if (root.isConnected) next();
      }

      $("#wires").addEventListener("click", async (e) => {
        const w = e.target.closest(".wire");
        if (!w || !active) return;
        w.classList.add("cut");
        if (Number(w.dataset.i) !== solve(wires)) { boom("Falscher Draht!"); return; }
        active = false;
        clearTimeout(timeout);
        bomb++;
        Sound.play("coin");
        if (bomb >= BOMBS) { $("#play").hidden = true; UI.completeEvent(EVENT_ID, app); return; }
        feedback.className = "feedback ok";
        feedback.textContent = `Entschärft! Noch ${BOMBS - bomb} …`;
        await FX.wait(700);
        if (root.isConnected) next();
      });

      $("#start").addEventListener("click", () => {
        Sound.play("click");
        $("#start").hidden = true;
        $("#play").hidden = false;
        bomb = 0;
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

  // für Tests
  window.__bombSolve = solve;
})();
