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
 * Einstellungen und Spielstand stehen in CONFIG (js/config.js), Hilfen dazu in Game (js/game.js).
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
      return Game.isSolved(1) ? "zentrale" : "login";
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

      App.go(App.home());
    },
  };

  window.App = App;
})();
