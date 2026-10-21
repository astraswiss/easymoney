/*
 * SPIELREGELN – erscheint nach Mission 1 und ist immer über die Zentrale erreichbar.
 * Alle Zahlen und Daten kommen aus CONFIG.
 */
(function () {
  App.register("regeln", {
    render(root, app, params) {
      const prize = UI.chf(CONFIG.prizePerPhase);
      const perKid = UI.chf(CONFIG.prizePerPhase * CONFIG.phases.length);
      const names = CONFIG.kids.map((k) => k.name);
      const dates = CONFIG.phases.map((p) => {
        const at = Game.opensAt(p.n);
        return `<li><b>Mission ${p.n}:</b> ${at ? UI.dateTime(at) : "sofort"}</li>`;
      }).join("");

      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>HANDBUCH</span>
            <span>NUR FÜR AGENTEN</span>
          </div>
          <h1 class="title"><span class="mid glitch" data-text="SPIELREGELN">SPIELREGELN</span></h1>

          <div class="rules">
            <section class="rule">
              <h2><span aria-hidden="true">🕵️</span> Worum geht es?</h2>
              <p>Ihr seid Geheimagenten. Es gibt <b>5 geheime Missionen</b>. Ihr spielt zusammen als Team.</p>
            </section>

            <section class="rule">
              <h2><span aria-hidden="true">⏰</span> Wann?</h2>
              <p>Jeden Tag öffnet eine neue Mission. In der Zentrale seht ihr einen Countdown.</p>
              <ul>${dates}</ul>
            </section>

            <section class="rule rule-money">
              <h2><span aria-hidden="true">💰</span> Was gewinnt ihr?</h2>
              <p>Für jede geschaffte Mission bekommt <b>jeder von euch ${prize}</b>.</p>
              <p>Alle 5 Missionen = <b>${perKid} für ${UI.esc(names[0])}</b> und <b>${perKid} für ${UI.esc(names[1])}</b>.</p>
              <p>Mit dem Geld sucht ihr euch Sachen auf Temu aus. ${UI.esc(CONFIG.uncle)} bestellt sie für euch.</p>
            </section>

            <section class="rule rule-important">
              <h2><span aria-hidden="true">📨</span> Ganz wichtig: Melden!</h2>
              <ol>
                <li>Wenn ihr eine Mission schafft, seht ihr einen <b>Erfolgs-Code</b>.</li>
                <li>Drückt auf <b>„An ${UI.esc(CONFIG.uncle)} schicken“</b>.</li>
                <li>Schickt die Nachricht per <b>WhatsApp</b> an ${UI.esc(CONFIG.uncle)}.</li>
              </ol>
              <p><b>Ohne Erfolgs-Code gibt es kein Geld!</b> Schickt die Nachricht, bevor ihr die Seite schließt. Sonst müsst ihr die Mission nochmal spielen.</p>
            </section>

            <section class="rule">
              <h2><span aria-hidden="true">🔢</span> Beweis-Ziffern</h2>
              <p>In Mission 1 bis 4 findet ihr je eine <b>Beweis-Ziffer</b>. Schreibt sie auf ein Blatt Papier! Ihr braucht sie für den Tresor in Mission 5.</p>
            </section>

            <section class="rule">
              <h2><span aria-hidden="true">🛒</span> Eure Temu-Wunschliste</h2>
              <ol>
                <li>Tippt in der Zentrale auf euren Agenten.</li>
                <li>Kopiert den Link von Temu und schreibt Name und Preis dazu.</li>
                <li>Drückt auf <b>„Neue Wünsche an ${UI.esc(CONFIG.uncle)} schicken“</b>.</li>
              </ol>
              <p>Ihr dürft nur so viel aussuchen, wie auf eurem Konto ist.</p>
            </section>

            <section class="rule">
              <h2><span aria-hidden="true">❌</span> Falsche Antwort?</h2>
              <p>Kein Problem! Probiert einfach nochmal. Aber Achtung beim Tresor: Nach 3 Fehlern gibt es <b>Alarm</b>!</p>
            </section>

            <section class="rule">
              <h2><span aria-hidden="true">😎</span> Regel Nummer 1</h2>
              <p>Nicht schummeln. ${UI.esc(CONFIG.uncle)} merkt alles!</p>
            </section>
          </div>

          <button class="btn go" type="button" id="ok">${params.first ? "Alles klar! Zur Zentrale ▶" : "&lt; Zurück"}</button>
        </div>`;

      root.querySelector("#ok").addEventListener("click", () => {
        Sound.play("click");
        app.go(params.back || "zentrale");
      });
    },
  });
})();
