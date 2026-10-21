/*
 * Nach Mission 1: Jeder Agent bekommt einen Ausweis (Agentenname + Bild).
 * Wird auch zum Bearbeiten benutzt: App.go("setup", { kid: "lisa" })
 */
(function () {
  App.register("setup", {
    render(root, app, params) {
      const kids = params.kid ? CONFIG.kids.filter((k) => k.id === params.kid) : CONFIG.kids;
      const editing = Boolean(params.kid);

      root.innerHTML = `
        <div class="panel">
          <div class="status-bar">
            <span class="state ok"><span class="blink-dot"></span>AUSWEIS-DRUCKER</span>
            <span>FORMULAR A-007</span>
          </div>
          <h1 class="title">
            <span class="mid glitch" data-text="AGENTEN-AUSWEIS">AGENTEN-AUSWEIS</span>
          </h1>
          <p class="lead center" id="lead"></p>
          <form id="setup-form" class="setup-form" novalidate>
            ${kids.map((k) => {
              const data = Store.kid(k.id);
              const avatar = data.avatar || CONFIG.avatars[0];
              return `
                <fieldset class="id-card">
                  <legend class="label">&gt; AGENT ${UI.esc(k.name.toUpperCase())}</legend>
                  <label class="field-label" for="agent-${k.id}">Dein Agentenname</label>
                  <input class="text-input" id="agent-${k.id}" maxlength="20"
                         placeholder="z. B. Agent Blitz" value="${UI.esc(data.agent)}">
                  <span class="field-label">Dein Agentenbild</span>
                  <div class="avatar-grid" role="radiogroup" aria-label="Agentenbild für ${UI.esc(k.name)}">
                    ${CONFIG.avatars.map((a, i) => `
                      <label class="avatar-opt">
                        <input type="radio" name="avatar-${k.id}" id="avatar-${k.id}-${i}" value="${a}" ${a === avatar ? "checked" : ""}>
                        <span>${a}</span>
                      </label>`).join("")}
                  </div>
                </fieldset>`;
            }).join("")}
            <button class="btn go" type="submit">${editing ? "Speichern ✔" : "Ausweise drucken ▶"}</button>
          </form>
          ${editing ? `<button class="btn ghost" data-cancel type="button">&lt; Zurück</button>` : ""}
        </div>`;

      FX.typeText(
        root.querySelector("#lead"),
        editing ? "Neuer Name? Neues Bild? Kein Problem, Agent!" : "Jeder echte Agent braucht einen Ausweis. Wählt euren geheimen Namen und ein Bild!"
      );

      root.querySelectorAll(".avatar-opt input").forEach((r) =>
        r.addEventListener("change", () => Sound.play("blip"))
      );

      root.querySelector("#setup-form").addEventListener("submit", (e) => {
        e.preventDefault();
        kids.forEach((k) => {
          const data = Store.kid(k.id);
          const name = root.querySelector("#agent-" + k.id).value.trim();
          data.agent = name || "Agent " + k.name;
          const picked = root.querySelector(`input[name="avatar-${k.id}"]:checked`);
          data.avatar = picked ? picked.value : CONFIG.avatars[0];
        });
        Store.state.setupDone = true;
        Store.save();
        Sound.play("success");
        FX.burst(60);
        app.go(editing ? "profil" : "zentrale", { kid: params.kid });
      });

      const cancel = root.querySelector("[data-cancel]");
      if (cancel) cancel.addEventListener("click", () => app.go("profil", { kid: params.kid }));
    },
  });
})();
