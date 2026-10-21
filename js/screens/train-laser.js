/*
 * TRAINING: Laser-Abwehr. Ziele tauchen auf – schnell antippen!
 * Rote Bomben NICHT antippen (−3 Punkte). 30 Sekunden, wird immer schneller.
 */
(function () {
  const SCREEN = "train-laser";
  const SECONDS = 30;
  const BOMB_PENALTY = 3;

  Training.add({
    screen: SCREEN,
    icon: "🎯",
    title: "Laser-Abwehr",
    text: "Tippt die Ziele an, aber nicht die Bomben! 30 Sekunden.",
  });

  let timers = [];
  const clearAll = () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers = []; };

  App.register(SCREEN, {
    render(root, app) {
      root.innerHTML = Training.frame(SCREEN, `
        <p class="lead center">Tippt die blauen Ziele 🎯 an, bevor sie verschwinden. Aber Finger weg von den Bomben 💣 (−${BOMB_PENALTY} Punkte)!</p>
        <p class="round-info">Zeit: <span id="time">${SECONDS}</span> · Punkte: <span id="score">0</span></p>
        <div class="arena" id="arena"></div>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
        <button class="btn" type="button" id="start">Start ▶</button>
      `);
      UI.bindBack(root, app);

      const arena = root.querySelector("#arena");
      const feedback = root.querySelector("#feedback");
      const startBtn = root.querySelector("#start");
      let score = 0;
      let left = SECONDS;
      let running = false;

      const setScore = () => { root.querySelector("#score").textContent = score; };

      function spawn() {
        if (!running) return;
        const elapsed = SECONDS - left;
        const bomb = Math.random() < 0.22;
        const life = Math.max(650, 1300 - elapsed * 25); // so lange bleibt ein Ziel
        const t = document.createElement("button");
        t.type = "button";
        t.className = "target" + (bomb ? " bomb" : "");
        t.textContent = bomb ? "💣" : "🎯";
        t.setAttribute("aria-label", bomb ? "Bombe" : "Ziel");
        t.style.left = 6 + Math.random() * 78 + "%";
        t.style.top = 6 + Math.random() * 78 + "%";
        t.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (!running) return;
          if (bomb) { score = Math.max(0, score - BOMB_PENALTY); Sound.play("error"); FX.replayClass(arena, "shake"); }
          else { score++; Sound.play("blip"); }
          setScore();
          t.remove();
        });
        arena.appendChild(t);
        timers.push(setTimeout(() => t.remove(), life));
        timers.push(setTimeout(spawn, Math.max(380, 800 - elapsed * 15)));
      }

      function stop() {
        running = false;
        clearAll();
        arena.innerHTML = "";
        const isNew = Training.record(SCREEN, score, root);
        Sound.play("success");
        if (score) FX.burst(60);
        feedback.className = "feedback ok";
        feedback.textContent = isNew && score ? `Zeit um! ${score} Punkte. NEUER REKORD! 🏆` : `Zeit um! ${score} Punkte.`;
        startBtn.hidden = false;
        startBtn.textContent = "Nochmal ▶";
      }

      startBtn.addEventListener("click", () => {
        Sound.play("click");
        clearAll();
        score = 0;
        left = SECONDS;
        running = true;
        setScore();
        root.querySelector("#time").textContent = left;
        feedback.textContent = "";
        startBtn.hidden = true;
        spawn();
        timers.push(setInterval(() => {
          left--;
          root.querySelector("#time").textContent = left;
          if (left <= 0) stop();
        }, 1000));
      });
    },

    leave() {
      clearAll();
    },
  });
})();
