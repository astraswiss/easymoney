/*
 * Der Kern von TEMU QUEST.
 *
 * Jeder Spielschritt ist ein "Screen". Ein Screen wird so angemeldet:
 *
 *   App.register("name", {
 *     render(root, app, params) { ... HTML in root bauen, Knöpfe verbinden ... },
 *     leave()                   { ... optional: aufräumen (Timer stoppen) ... },
 *   });
 *
 * Zu einem Screen wechseln:  App.go("name", { ...params })
 * Der Spielstand liegt in Store (js/store.js), die Einstellungen in CONFIG (js/config.js).
 */
(function () {
  const screens = {};
  let current = null;
  let root = null;

  const App = {
    register(name, screen) {
      screens[name] = screen;
    },

    async go(name, params = {}) {
      const next = screens[name];
      if (!next) {
        console.warn("Diesen Screen gibt es nicht:", name);
        return;
      }
      if (current && screens[current].leave) screens[current].leave();
      const old = root.firstElementChild;
      if (old) {
        old.classList.add("leaving");
        Sound.play("whoosh");
        await FX.wait(330);
      }
      root.innerHTML = "";
      current = name;
      const el = document.createElement("section");
      el.className = "screen screen-" + name;
      root.appendChild(el);
      next.render(el, App, params);
      window.scrollTo({ top: 0 });
    },

    // Wohin beim Öffnen der Seite?
    home() {
      if (!Store.state.phases[1].solvedAt) return "login";
      if (!Store.state.setupDone) return "setup";
      return "zentrale";
    },

    // Text vergleichen: Groß/Klein und Leerzeichen sind egal
    normalize(text) {
      return String(text).toLowerCase().replace(/\s+/g, "");
    },

    start() {
      root = document.getElementById("app");
      FX.startMatrix(document.getElementById("matrix"));

      const btn = document.getElementById("sound-toggle");
      btn.addEventListener("click", () => {
        const on = Sound.toggle();
        btn.textContent = on ? "TON: AN" : "TON: AUS";
        btn.setAttribute("aria-pressed", String(on));
        Sound.play("blip");
      });

      // Geheimer Admin-Zugang: 5× schnell auf das Logo tippen (oder Link mit #admin)
      let taps = [];
      document.querySelector(".brand").addEventListener("click", () => {
        const now = Date.now();
        taps = taps.filter((t) => now - t < 2500).concat(now);
        if (taps.length >= 5) { taps = []; App.go("admin-login"); }
      });

      App.go(location.hash === "#admin" ? "admin-login" : App.home());
    },
  };

  window.App = App;
})();
