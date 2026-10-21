/*
 * ADMIN-BEREICH für Baci Bardh.
 * Öffnen: 5× schnell auf das Logo "TEMU QUEST" tippen, dann PIN (CONFIG.adminPin).
 */
(function () {
  let unlocked = false; // bleibt nur bis zum Neuladen der Seite entsperrt

  App.register("admin-login", {
    render(root, app) {
      if (unlocked) { app.go("admin"); return; }
      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state"><span class="blink-dot"></span>NUR FÜR DEN CHEF</span>
            <span>ADMIN</span>
          </div>
          <h1 class="title"><span class="mid">ADMIN-PIN</span></h1>
          <div id="pad"></div>
          <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
          <button class="btn ghost" type="button" id="leave">&lt; Abbrechen</button>
        </div>`;
      const feedback = root.querySelector("#feedback");
      UI.keypad(root.querySelector("#pad"), {
        length: CONFIG.adminPin.length,
        onSubmit(entry, api) {
          if (entry === CONFIG.adminPin) {
            unlocked = true;
            Sound.play("unlock");
            app.go("admin");
            return;
          }
          api.fail();
          Sound.play("error");
          feedback.className = "feedback wrong";
          feedback.textContent = "Falsche PIN. Netter Versuch, Agent! 😂";
        },
      });
      root.querySelector("#leave").addEventListener("click", () => app.go(app.home()));
    },
  });

  App.register("admin", {
    render(root, app) {
      if (!unlocked) { app.go("admin-login"); return; }

      root.innerHTML = `
        <div class="panel admin">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>ADMIN AKTIV</span>
            <span>${UI.esc(CONFIG.uncle.toUpperCase())}</span>
          </div>
          <h1 class="title"><span class="mid">ADMIN-ZENTRALE</span></h1>

          <section class="admin-sec">
            <span class="label">&gt; MISSIONEN</span>
            <ul class="admin-list" id="phases"></ul>
          </section>

          <section class="admin-sec" id="kids"></section>

          <section class="admin-sec">
            <span class="label">&gt; GEFAHRENZONE</span>
            <button class="btn danger" type="button" id="reset">Ganzes Spiel zurücksetzen</button>
            <div class="confirm" id="confirm" hidden>
              <p>Wirklich alles löschen? Missionen, Geld und Wunschlisten sind dann weg.</p>
              <div class="row">
                <button class="btn danger" type="button" id="reset-yes">Ja, alles löschen</button>
                <button class="btn ghost" type="button" id="reset-no">Nein</button>
              </div>
            </div>
          </section>

          <button class="btn ghost" type="button" id="leave">&lt; Admin verlassen</button>
        </div>`;

      const $ = (s) => root.querySelector(s);

      function draw() {
        $("#phases").innerHTML = CONFIG.phases.map((p) => {
          const st = Store.status(p.n);
          const label = {
            solved: `gelöst ${UI.dateTime(st.at)}`,
            open: "offen",
            waiting: `öffnet ${st.opensAt ? UI.dateTime(st.opensAt) : ""}`,
            locked: "gesperrt",
          }[st.kind];
          return `
            <li class="admin-row">
              <span><b>${p.n}. ${UI.esc(p.title)}</b><small>${label}</small></span>
              <span class="row">
                ${st.kind === "waiting" || st.kind === "locked" ? `<button class="btn small" data-open="${p.n}" type="button">Jetzt öffnen</button>` : ""}
                ${st.kind === "solved" || Store.state.phases[p.n].openedAt ? `<button class="btn small ghost" data-reset="${p.n}" type="button">Zurücksetzen</button>` : ""}
              </span>
            </li>`;
        }).join("");

        $("#kids").innerHTML = CONFIG.kids.map((k) => {
          const d = Store.kid(k.id);
          return `
            <div class="admin-kid">
              <span class="label">&gt; ${UI.esc(k.name.toUpperCase())} – ${UI.esc(Store.kidLabel(k.id))}</span>
              <div class="admin-row">
                <span><b>${UI.chf(d.money)}</b><small>Wunschliste: ${UI.chf(Store.wishTotal(k.id))}</small></span>
                <span class="row">
                  <button class="btn small ghost" data-money="${k.id}" data-amount="-5" type="button">−5</button>
                  <button class="btn small ghost" data-money="${k.id}" data-amount="-1" type="button">−1</button>
                  <button class="btn small" data-money="${k.id}" data-amount="1" type="button">+1</button>
                  <button class="btn small" data-money="${k.id}" data-amount="5" type="button">+5</button>
                </span>
              </div>
              <ul class="admin-list">
                ${d.wishes.length ? d.wishes.map((w) => `
                  <li class="admin-row">
                    <span>
                      <b>${UI.esc(w.name)} – ${UI.chf(w.price)}</b>
                      ${w.url ? `<a class="wish-link" href="${UI.esc(w.url)}" target="_blank" rel="noopener noreferrer">${UI.esc(w.url)}</a>` : "<small>kein Link</small>"}
                    </span>
                    <span class="row">
                      <button class="btn small ${w.ordered ? "go" : "ghost"}" data-order="${k.id}" data-wish="${w.id}" type="button">${w.ordered ? "✔ bestellt" : "als bestellt markieren"}</button>
                      <button class="icon-btn" data-del="${k.id}" data-wish="${w.id}" type="button" aria-label="Löschen">✕</button>
                    </span>
                  </li>`).join("") : `<li class="wish-empty">Noch keine Wünsche.</li>`}
              </ul>
            </div>`;
        }).join("");
      }
      draw();

      root.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const ds = b.dataset;
        if (ds.open) Store.openNow(Number(ds.open));
        else if (ds.reset) Store.resetPhase(Number(ds.reset));
        else if (ds.money) Store.addMoney(ds.money, Number(ds.amount));
        else if (ds.order) Store.toggleOrdered(ds.order, ds.wish);
        else if (ds.del) Store.removeWish(ds.del, ds.wish);
        else return;
        Sound.play("blip");
        draw();
      });

      $("#reset").addEventListener("click", () => { $("#confirm").hidden = false; });
      $("#reset-no").addEventListener("click", () => { $("#confirm").hidden = true; });
      $("#reset-yes").addEventListener("click", () => {
        Store.resetAll();
        unlocked = false;
        Sound.play("whoosh");
        app.go("login");
      });
      $("#leave").addEventListener("click", () => { unlocked = false; app.go(app.home()); });
    },
  });
})();
