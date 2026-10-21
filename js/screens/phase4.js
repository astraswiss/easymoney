/*
 * MISSION 4: Der Preis-Detektiv.
 * Die Kinder müssen Spion-Sachen für GENAU einen Betrag kaufen – mit Rappen!
 * Preise in Rappen (750 = Fr. 7.50), damit beim Rechnen nichts schiefgeht.
 */
(function () {
  const PHASE = {
    n: 4,
    // count: so viele Sachen müssen genau im Korb sein (null = egal)
    rounds: [
      { budget: 1230, count: null }, // Brille + Taschenlampe
      { budget: 1700, count: 3 }, // Brille + Tinte + Fingerabdruck-Set
      { budget: 2030, count: 4 }, // Brille + Taschenlampe + Schnurrbart + Fingerabdruck-Set
    ],
    items: [
      { icon: "🕶️", name: "Spion-Brille", price: 750 },
      { icon: "🖊️", name: "Unsichtbare Tinte", price: 320 },
      { icon: "🔦", name: "Mini-Taschenlampe", price: 480 },
      { icon: "📻", name: "Walkie-Talkie", price: 1200 },
      { icon: "📓", name: "Geheimes Notizbuch", price: 250 },
      { icon: "🥸", name: "Falscher Schnurrbart", price: 170 },
      { icon: "🔍", name: "Fingerabdruck-Set", price: 630 },
      { icon: "🌙", name: "Nachtsicht-Brille", price: 990 },
    ],
  };

  const fr = (rappen) => UI.chf(rappen / 100);

  App.register("phase4", {
    render(root, app) {
      let round = 0;
      let cart = new Set();

      root.innerHTML = UI.missionFrame(PHASE.n, `
        <p class="lead center" id="lead"></p>
        <div class="task-box">
          <span class="label" id="round"></span>
          <p id="task"></p>
        </div>
        <div class="shop" id="shop">
          ${PHASE.items.map((it, i) => `
            <button type="button" class="shop-item" data-i="${i}" aria-pressed="false">
              <span class="shop-icon" aria-hidden="true">${it.icon}</span>
              <span class="shop-name">${UI.esc(it.name)}</span>
              <span class="shop-price">${fr(it.price)}</span>
            </button>`).join("")}
        </div>
        <div class="cart-sum">Im Korb: <strong id="count"></strong> · <strong id="sum"></strong></div>
        <button class="btn" type="button" id="pay">Bezahlen 💳</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        `${CONFIG.uncle} braucht Spion-Sachen. Aber er ist knapp bei Kasse! Kauft für GENAU den richtigen Betrag ein. Ihr dürft Papier zum Rechnen benutzen!`);

      const panel = root.querySelector(".panel");
      const feedback = root.querySelector("#feedback");
      const items = [...root.querySelectorAll(".shop-item")];

      const sum = () => [...cart].reduce((s, i) => s + PHASE.items[i].price, 0);

      function draw() {
        const r = PHASE.rounds[round];
        root.querySelector("#round").textContent = `> EINKAUF ${round + 1} / ${PHASE.rounds.length}`;
        root.querySelector("#task").textContent =
          `Gebt genau ${fr(r.budget)} aus.` + (r.count ? ` Und kauft genau ${r.count} Sachen!` : " Nicht mehr und nicht weniger!");
        root.querySelector("#count").textContent = cart.size === 1 ? "1 Sache" : `${cart.size} Sachen`;
        root.querySelector("#sum").textContent = fr(sum());
        items.forEach((b, i) => {
          b.classList.toggle("in-cart", cart.has(i));
          b.setAttribute("aria-pressed", String(cart.has(i)));
        });
      }
      draw();

      items.forEach((b, i) =>
        b.addEventListener("click", () => {
          if (cart.has(i)) { cart.delete(i); Sound.play("blip"); }
          else { cart.add(i); Sound.play("coin"); }
          feedback.textContent = "";
          draw();
        })
      );

      root.querySelector("#pay").addEventListener("click", async () => {
        const r = PHASE.rounds[round];
        const s = sum();
        if (!cart.size) { UI.wrong(panel, feedback, "Der Korb ist leer, Agent!"); return; }
        if (s > r.budget) { UI.wrong(panel, feedback, `ZU TEUER! 😂 ${CONFIG.uncle} ist doch nicht reich!`); return; }
        if (s < r.budget) { UI.wrong(panel, feedback, `Zu wenig! Es muss genau ${fr(r.budget)} sein.`); return; }
        if (r.count && cart.size !== r.count) { UI.wrong(panel, feedback, `Der Preis stimmt, aber ihr braucht genau ${r.count} Sachen!`); return; }

        round++;
        if (round >= PHASE.rounds.length) {
          root.querySelector("#pay").disabled = true;
          UI.completeMission(PHASE.n, app, { lines: ["> Alle Einkäufe stimmen ✔"] });
          return;
        }
        Sound.play("success");
        FX.burst(50);
        feedback.className = "feedback ok";
        feedback.textContent = "Perfekt bezahlt! Nächster Einkauf wird schwerer …";
        cart = new Set();
        await FX.wait(500);
        draw();
      });
    },
  });
})();
