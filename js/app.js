/*
 * Der Kern von TEMU QUEST.
 *
 * Jeder Spielschritt ist ein "Screen". Ein Screen wird so angemeldet:
 *
 *   App.register("name", {
 *     render(root, app) { ... HTML in root bauen, Knöpfe verbinden ... },
 *     leave()           { ... optional: aufräumen ... },
 *   });
 *
 * Zum nächsten Screen wechseln:  App.go("name")
 * Gemeinsame Spieldaten (z. B. gelöste Rätsel): App.state
 */
(function () {
  const screens = {};
  let current = null;
  let root = null;

  const App = {
    state: {
      solved: [], // Namen der gelösten Schritte, z. B. ["login"]
    },

    register(name, screen) {
      screens[name] = screen;
    },

    async go(name) {
      const next = screens[name];
      if (!next) {
        console.warn("Diesen Screen gibt es nicht:", name);
        return;
      }
      const old = root.firstElementChild;
      if (old) {
        if (current && screens[current].leave) screens[current].leave();
        old.classList.add("leaving");
        Sound.play("whoosh");
        await FX.wait(330);
      }
      root.innerHTML = "";
      current = name;
      const el = document.createElement("section");
      el.className = "screen screen-" + name;
      root.appendChild(el);
      next.render(el, App);
      window.scrollTo({ top: 0 });
    },

    markSolved(name) {
      if (!App.state.solved.includes(name)) App.state.solved.push(name);
    },

    // Text vergleichen: Groß/Klein und Leerzeichen sind egal
    normalize(text) {
      return String(text).toLowerCase().replace(/\s+/g, "");
    },

    start(first) {
      root = document.getElementById("app");
      FX.startMatrix(document.getElementById("matrix"));

      const btn = document.getElementById("sound-toggle");
      btn.addEventListener("click", () => {
        const on = Sound.toggle();
        btn.textContent = on ? "TON: AN" : "TON: AUS";
        btn.setAttribute("aria-pressed", String(on));
        Sound.play("blip");
      });

      App.go(first);
    },
  };

  window.App = App;
})();
