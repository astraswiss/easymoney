/*
 * PROFIL eines Agenten: Konto und Temu-Wunschliste.
 * App.go("profil", { kid: "lisa" })
 */
(function () {
  App.register("profil", {
    render(root, app, params) {
      const id = params.kid;
      const base = CONFIG.kids.find((k) => k.id === id);
      if (!base) { app.go("zentrale"); return; }

      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>AGENTEN-AKTE</span>
            <span>${UI.esc(base.name.toUpperCase())}</span>
          </div>

          <div class="profile-head">
            <span class="profile-avatar" aria-hidden="true" id="avatar"></span>
            <div class="profile-names">
              <h1 class="profile-agent" id="agent-name"></h1>
              <span class="profile-real">Echter Name: ${UI.esc(base.name)} (psst!)</span>
              <button class="link-btn" type="button" id="edit">Ausweis ändern ✎</button>
            </div>
          </div>

          <div class="money-grid">
            <div class="stat"><span class="label">KONTO</span><span class="value ok" id="m-money"></span></div>
            <div class="stat"><span class="label">WUNSCHLISTE</span><span class="value" id="m-wish"></span></div>
            <div class="stat"><span class="label">ÜBRIG</span><span class="value" id="m-rest"></span></div>
          </div>
          <p class="feedback" id="budget-msg" role="status" aria-live="polite"></p>

          <form class="wish-form" id="wish-form" novalidate>
            <span class="label">&gt; NEUER TEMU-WUNSCH</span>
            <label class="field-label" for="w-name">Was ist es?</label>
            <input class="text-input" id="w-name" maxlength="60" placeholder="z. B. Leuchtende Spion-Brille">
            <label class="field-label" for="w-url">Link von Temu (einfügen)</label>
            <input class="text-input" id="w-url" type="url" inputmode="url" placeholder="https://www.temu.com/...">
            <label class="field-label" for="w-price">Preis in Franken</label>
            <input class="text-input" id="w-price" inputmode="decimal" placeholder="z. B. 4.90">
            <button class="btn" type="submit">Auf die Liste ＋</button>
            <p class="feedback" id="wish-msg" role="status" aria-live="polite"></p>
          </form>

          <div>
            <span class="label">&gt; MEINE WUNSCHLISTE</span>
            <ul class="wishes" id="wishes"></ul>
          </div>

          <button class="btn go" type="button" id="send">Liste an ${UI.esc(CONFIG.uncle)} schicken 📨</button>
          <p class="hint" id="send-msg" role="status" aria-live="polite"></p>
          <textarea class="text-input send-text" id="send-text" readonly hidden aria-label="Wunschliste als Text"></textarea>

          <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
        </div>`;

      const $ = (s) => root.querySelector(s);
      UI.bindBack(root, app);

      function draw() {
        const d = Store.kid(id);
        const total = Store.wishTotal(id);
        const rest = d.money - total;
        $("#avatar").textContent = d.avatar || "🕵️";
        $("#agent-name").textContent = Store.kidLabel(id);
        $("#m-money").textContent = UI.chf(d.money);
        $("#m-wish").textContent = UI.chf(total);
        $("#m-rest").textContent = UI.chf(rest);
        $("#m-rest").className = "value " + (rest < 0 ? "bad" : "ok");
        const msg = $("#budget-msg");
        if (rest < 0) {
          msg.className = "feedback wrong";
          msg.textContent = `Zu teuer, Agent! Dir fehlen ${UI.chf(-rest)}. Lösche etwas oder löse mehr Missionen!`;
        } else {
          msg.className = "feedback";
          msg.textContent = "";
        }

        const list = $("#wishes");
        if (!d.wishes.length) {
          list.innerHTML = `<li class="wish-empty">Noch leer. Sucht euch auf Temu etwas Cooles aus und fügt den Link oben ein!</li>`;
          return;
        }
        list.innerHTML = d.wishes.map((w) => `
          <li class="wish ${w.ordered ? "ordered" : ""}">
            <div class="wish-main">
              <span class="wish-name">${UI.esc(w.name)}</span>
              ${w.url ? `<a class="wish-link" href="${UI.esc(w.url)}" target="_blank" rel="noopener noreferrer">Link öffnen ↗</a>` : ""}
              ${w.ordered ? `<span class="pill ok">✔ bestellt</span>` : ""}
            </div>
            <span class="wish-price">${UI.chf(w.price)}</span>
            ${w.ordered ? "" : `<button class="icon-btn" type="button" data-del="${w.id}" aria-label="${UI.esc(w.name)} löschen">✕</button>`}
          </li>`).join("");
        list.querySelectorAll("[data-del]").forEach((b) =>
          b.addEventListener("click", () => {
            Store.removeWish(id, b.dataset.del);
            Sound.play("whoosh");
            draw();
          })
        );
      }
      draw();

      $("#edit").addEventListener("click", () => app.go("setup", { kid: id }));

      $("#wish-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const msg = $("#wish-msg");
        const name = $("#w-name").value.trim();
        let url = $("#w-url").value.trim();
        const price = Number($("#w-price").value.replace(",", ".").replace(/[^\d.]/g, ""));

        if (!name) { msg.className = "feedback almost"; msg.textContent = "Wie heißt das Ding? Schreib einen Namen!"; return; }
        if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
        if (url && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(url)) { msg.className = "feedback almost"; msg.textContent = "Der Link sieht komisch aus. Kopiere ihn nochmal von Temu!"; return; }
        if (!price || price <= 0) { msg.className = "feedback almost"; msg.textContent = "Wie viel kostet es? Schreib den Preis, z. B. 4.90"; return; }

        Store.addWish(id, { name, url, price: Math.round(price * 100) / 100 });
        Sound.play("coin");
        msg.className = "feedback";
        msg.textContent = "";
        $("#wish-form").reset();
        draw();
      });

      $("#send").addEventListener("click", async () => {
        const d = Store.kid(id);
        const lines = [
          `TEMU QUEST – Wunschliste von ${base.name} (${Store.kidLabel(id)})`,
          `Konto: ${UI.chf(d.money)}`,
          "",
          ...d.wishes.map((w, i) => `${i + 1}. ${w.name} – ${UI.chf(w.price)}${w.ordered ? " (bestellt)" : ""}${w.url ? "\n   " + w.url : ""}`),
          "",
          `Total: ${UI.chf(Store.wishTotal(id))}`,
        ];
        const text = lines.join("\n");
        const msg = $("#send-msg");
        if (!d.wishes.length) { msg.textContent = "Die Liste ist noch leer!"; return; }

        Sound.play("click");
        // 1. Teilen-Menü vom Handy (WhatsApp usw.)
        if (navigator.share) {
          try { await navigator.share({ title: "TEMU QUEST Wunschliste", text }); msg.textContent = "Geschickt! 📨"; return; }
          catch (err) { if (err && err.name === "AbortError") return; }
        }
        // 2. In die Zwischenablage kopieren
        try {
          await navigator.clipboard.writeText(text);
          msg.textContent = `Kopiert! Jetzt in WhatsApp an ${CONFIG.uncle} einfügen.`;
          return;
        } catch (err) { /* geht nicht überall */ }
        // 3. Text anzeigen zum selbst Kopieren
        const area = $("#send-text");
        area.hidden = false;
        area.value = text;
        area.select();
        msg.textContent = `Kopiere diesen Text und schick ihn an ${CONFIG.uncle}.`;
      });
    },
  });
})();
