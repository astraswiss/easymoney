/*
 * Hilfen für die ÜBERRASCHUNGEN (CONFIG.events).
 * - Events.guard: zeigt "geschlossen", wenn die Überraschung gerade nicht offen ist
 * - Events.frame: Rahmen mit Restzeit oben
 * - Events.watch: um Punkt Schluss-Zeit wird das Spiel abgebrochen – ohne Belohnung
 */
(function () {
  let watcher = null;

  window.Events = {
    guard(root, app, id) {
      const ev = Game.event(id);
      const st = Game.eventStatus(id);
      if (st.kind === "open") return true;
      root.innerHTML = `
        <div class="panel">
          <h1 class="title"><span class="mid">${UI.esc(ev.title.toUpperCase())}</span></h1>
          <p class="lead center">${st.kind === "solved" ? "Die habt ihr schon geschafft! 🏆" : "Diese Überraschung ist gerade nicht offen."}</p>
          <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
        </div>`;
      UI.bindBack(root, app);
      return false;
    },

    frame(id, intro, inner) {
      const ev = Game.event(id);
      return `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>⚡ ÜBERRASCHUNG · +${UI.chf(ev.prize)} FÜR JEDEN</span>
            <span>Noch <b data-left>–</b></span>
          </div>
          <h1 class="title"><span class="mid glitch" data-text="${UI.esc(ev.title.toUpperCase())}">${UI.esc(ev.title.toUpperCase())}</span></h1>
          <p class="lead center">${intro}</p>
          ${inner}
          <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
        </div>`;
    },

    watch(id, root, app, onStop) {
      clearInterval(watcher);
      const tick = () => {
        const st = Game.eventStatus(id);
        const left = root.querySelector("[data-left]");
        if (st.kind === "open" && left) left.textContent = UI.countdown(st.closesAt - Date.now());
        if (st.kind !== "missed") return;
        clearInterval(watcher);
        if (onStop) onStop();
        Sound.play("error");
        const ev = Game.event(id);
        const overlay = document.createElement("div");
        overlay.className = "granted";
        overlay.setAttribute("role", "dialog");
        overlay.innerHTML = `
          <div class="granted-box">
            <h2 class="granted-title" style="color: var(--red)">ZEIT ABGELAUFEN!</h2>
            <p class="granted-sub">Es ist ${new Date(ev.closes).getHours()}:00 Uhr. „${UI.esc(ev.title)}“ ist geschlossen. Heute gibt es leider kein Geld. 😢</p>
            ${CONFIG.events.some((e) => new Date(e.opens) > new Date(ev.closes)) ? `<p class="granted-sub">Morgen gibt es eine neue Chance!</p>` : ""}
            <button class="btn go" type="button">Zurück zur Zentrale ▶</button>
          </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector("button").addEventListener("click", () => {
          overlay.remove();
          app.go("zentrale");
        });
      };
      tick();
      watcher = setInterval(tick, 1000);
    },

    stop() {
      clearInterval(watcher);
    },
  };
})();
