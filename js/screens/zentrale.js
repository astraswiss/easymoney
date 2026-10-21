/*
 * DIE GEHEIME ZENTRALE: Agenten, Konten, alle 5 Missionen mit Countdown.
 */
(function () {
  let timer = null;

  App.register("zentrale", {
    render(root, app) {
      const done = Game.allSolved();
      const digits = Game.digits();

      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>VERBINDUNG SICHER</span>
            <span>ZENTRALE // EBENE -3</span>
          </div>

          <h1 class="title">
            <span class="big glitch" data-text="ZENTRALE">ZENTRALE</span>
            <span class="small cyan">${done ? "Alle Missionen erfüllt!" : "Willkommen zurück, Agenten!"}</span>
          </h1>

          ${done ? `
            <div class="banner-win">
              <strong>MISSION ERFÜLLT! 🏆</strong>
              Ihr seid echte TEMU-Agenten. Macht jetzt eure Wunschliste fertig und schickt sie an ${UI.esc(CONFIG.uncle)}. Er bestellt dann alles zusammen!
            </div>` : ""}

          <div id="events"></div>

          <div class="agents">
            ${CONFIG.kids.map((k) => {
              return `
                <button class="agent-card" type="button" data-kid="${k.id}">
                  <span class="agent-avatar" aria-hidden="true">${UI.esc(k.avatar || "🕵️")}</span>
                  <span class="agent-info">
                    <span class="agent-name">${UI.esc(k.agent)}</span>
                    <span class="agent-money ${Game.money(k.id) - Game.wishTotal(k.id) < 0 ? "bad" : ""}">Übrig: ${UI.chf(Game.money(k.id) - Game.wishTotal(k.id))}</span>
                    <span class="agent-sub">Konto ${UI.chf(Game.money(k.id))} · Wünsche ${UI.chf(Game.wishTotal(k.id))}</span>
                    <span class="agent-link">Profil &amp; Wunschliste ▶</span>
                  </span>
                </button>`;
            }).join("")}
          </div>

          <div>
            <span class="label">&gt; MISSIONEN</span>
            <ol class="missions" id="missions"></ol>
          </div>

          <div>
            <span class="label">&gt; TRAININGSLAGER – Bonus-Spiele, immer offen</span>
            <div class="train-list">
              ${Training.games.map((g) => `
                <button class="train-card" type="button" data-train="${g.screen}">
                  <span class="train-icon" aria-hidden="true">${g.icon}</span>
                  <span class="train-info"><b>${UI.esc(g.title)}</b><small>${UI.esc(g.text)}</small></span>
                </button>`).join("")}
            </div>
          </div>

          <button class="btn ghost" type="button" id="rules">📜 Spielregeln: Wie funktioniert das Spiel?</button>

          ${digits.length ? `
            <div class="evidence">
              <span class="label">&gt; BEWEIS-ZIFFERN (gut merken!)</span>
              <div class="evidence-row">
                ${digits.map((x) => `<span class="evidence-item"><small>M${x.n}</small>${x.digit}</span>`).join("")}
              </div>
            </div>` : ""}
        </div>`;

      const list = root.querySelector("#missions");

      function drawMissions() {
        list.innerHTML = CONFIG.phases.map((p) => {
          const st = Game.status(p.n);
          let right = "";
          if (st.kind === "solved" && Game.solvedOnlyNow(p.n)) right = `<button class="btn small share" type="button" data-report="${p.n}">Melden 📨</button>`;
          else if (st.kind === "solved") right = `<span class="pill ok">✔ +${UI.chf(CONFIG.prizePerPhase)}</span>`;
          else if (st.kind === "open") right = `<button class="btn small" type="button" data-play="${p.n}">Starten ▶</button>`;
          else right = `<span class="pill wait">🔒 ${UI.countdown(st.opensAt - Date.now())}</span>`;
          const title = st.kind === "waiting" ? "??? STRENG GEHEIM ???" : p.title;
          return `
            <li class="mission mission-${st.kind}">
              <span class="mission-num">${p.n}</span>
              <span class="mission-title">${UI.esc(title)}
                ${st.kind === "waiting" ? `<small>öffnet ${UI.dateTime(st.opensAt)}</small>` : ""}
              </span>
              ${right}
            </li>`;
        }).join("");
        list.querySelectorAll("[data-report]").forEach((b) =>
          b.addEventListener("click", () => UI.sendDialog("MISSION MELDEN", UI.missionReport(Number(b.dataset.report))))
        );
        list.querySelectorAll("[data-play]").forEach((b) =>
          b.addEventListener("click", () => {
            Sound.play("click");
            app.go(CONFIG.phases[Number(b.dataset.play) - 1].screen);
          })
        );
      }

      drawMissions();

      // Überraschungen: nur die von heute (und offene / noch nicht gemeldete)
      const eventsEl = root.querySelector("#events");
      const isToday = (ev) => new Date(ev.opens).toDateString() === new Date().toDateString();
      function drawEvents() {
        eventsEl.innerHTML = CONFIG.events.map((ev) => {
          const st = Game.eventStatus(ev.id);
          if (st.kind === "missed") return "";
          if (st.kind !== "open" && !Game.eventSolvedOnlyNow(ev.id) && !isToday(ev)) return "";
          let action = "";
          if (st.kind === "waiting") action = `<span class="pill wait">🔒 öffnet in ${UI.countdown(st.opensAt - Date.now())}</span>`;
          else if (st.kind === "open") action = `<button class="btn go" type="button" data-event="${ev.id}">Jetzt spielen ▶</button><small>Noch ${UI.countdown(st.closesAt - Date.now())} offen!</small>`;
          else if (Game.eventSolvedOnlyNow(ev.id)) action = `<button class="btn share" type="button" data-event-report="${ev.id}">Melden 📨</button>`;
          else action = `<span class="pill ok">✔ geschafft: +${UI.chf(ev.prize)} für jeden</span>`;
          return `
            <div class="surprise surprise-${st.kind}">
              <span class="surprise-tag">⚡ ÜBERRASCHUNG ⚡</span>
              <strong>${UI.esc(ev.title)}</strong>
              <p>Nur heute von <b>${new Date(ev.opens).getHours()}:00 bis ${new Date(ev.closes).getHours()}:00 Uhr</b>! Wer es schafft, bekommt <b>${UI.chf(ev.prize)} EXTRA</b> – für jeden von euch! Um ${new Date(ev.closes).getHours()}:00 Uhr ist Schluss: Wer dann nicht fertig ist, bekommt nichts.</p>
              ${action}
            </div>`;
        }).join("");
        eventsEl.querySelectorAll("[data-event]").forEach((b) =>
          b.addEventListener("click", () => { Sound.play("click"); app.go(Game.event(b.dataset.event).screen); })
        );
        eventsEl.querySelectorAll("[data-event-report]").forEach((b) =>
          b.addEventListener("click", () => UI.sendDialog("ÜBERRASCHUNG MELDEN", UI.eventReport(b.dataset.eventReport)))
        );
      }
      drawEvents();

      // Countdown jede Sekunde neu zeichnen; wenn eine Mission aufgeht: Ton
      let lastOpen = CONFIG.phases.filter((p) => Game.status(p.n).kind === "open").length;
      timer = setInterval(() => {
        const open = CONFIG.phases.filter((p) => Game.status(p.n).kind === "open").length;
        if (open > lastOpen) { Sound.play("unlock"); FX.burst(50); }
        lastOpen = open;
        if (list.querySelector(".pill.wait")) drawMissions();
        if (eventsEl.querySelector(".pill.wait, small")) drawEvents();
      }, 1000);

      root.querySelectorAll("[data-train]").forEach((b) =>
        b.addEventListener("click", () => {
          Sound.play("click");
          app.go(b.dataset.train);
        })
      );

      root.querySelector("#rules").addEventListener("click", () => {
        Sound.play("click");
        app.go("regeln");
      });

      root.querySelectorAll("[data-kid]").forEach((b) =>
        b.addEventListener("click", () => {
          Sound.play("click");
          app.go("profil", { kid: b.dataset.kid });
        })
      );
    },

    leave() {
      clearInterval(timer);
    },
  });
})();
