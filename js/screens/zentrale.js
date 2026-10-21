/*
 * DIE GEHEIME ZENTRALE – Platzhalter für den nächsten Schritt.
 * Hier kommt später die nächste Mission hin.
 */
(function () {
  App.register("zentrale", {
    render(root, app) {
      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>VERBINDUNG SICHER</span>
            <span>ZENTRALE // EBENE -3</span>
          </div>

          <h1 class="title">
            <span class="big glitch" data-text="ZENTRALE">ZENTRALE</span>
            <span class="small" style="color: var(--cyan)">Du bist drin, Agent!</span>
          </h1>

          <p class="lead center" id="lead"></p>

          <div class="agent-grid">
            <div class="stat">
              <span class="label">AGENTEN-STATUS</span>
              <span class="value ok">AKTIV</span>
            </div>
            <div class="stat">
              <span class="label">GELÖSTE RÄTSEL</span>
              <span class="value">${app.state.solved.length}</span>
            </div>
          </div>

          <div class="mission-slot">
            <span class="label">&gt; NÄCHSTE MISSION</span>
            <h2 class="slot-title">STRENG GEHEIM</h2>
            <p>Wird gerade vorbereitet<span class="loader-dots"></span></p>
          </div>

          <button class="btn ghost" id="logout" type="button">&lt; Zurück zum Login</button>
        </div>`;

      FX.typeText(
        root.querySelector("#lead"),
        "Super gemacht! Warte hier auf deinen nächsten Auftrag. Nicht weitersagen!"
      );

      root.querySelector("#logout").addEventListener("click", () => {
        Sound.play("click");
        app.go("login");
      });
    },
  });
})();
