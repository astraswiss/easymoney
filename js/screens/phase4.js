/*
 * MISSION 4: Der Preis-Detektiv.
 * Die Kinder müssen Spion-Sachen für GENAU einen bestimmten Betrag kaufen.
 */
(function () {
  const PHASE = {
    n: 4,
    budgets: [20, 17], // eine Runde pro Betrag
    items: [
      { icon: "🕶️", name: "Spion-Brille", price: 7 },
      { icon: "🖊️", name: "Unsichtbare Tinte", price: 4 },
      { icon: "🔦", name: "Mini-Taschenlampe", price: 3 },
      { icon: "📻", name: "Walkie-Talkie", price: 9 },
      { icon: "📓", name: "Geheimes Notizbuch", price: 6 },
      { icon: "🥸", name: "Falscher Schnurrbart", price: 2 },
    ],
  };

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
              <span class="shop-price">${UI.chf(it.price)}</span>
            </button>`).join("")}
        </div>
        <div class="cart-sum">Im Korb: <strong id="sum"></strong> von <strong id="budget"></strong></div>
        <button class="btn" type="button" id="pay">Bezahlen 💳</button>
        <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
      `);
      UI.bindBack(root, app);

      FX.typeText(root.querySelector("#lead"),
        `${CONFIG.uncle} braucht Spion-Sachen. Aber er ist knapp bei Kasse! Kauft für GENAU den richtigen Betrag ein.`);

      const panel = root.querySelector(".panel");
      const feedback = root.querySelector("#feedback");
      const items = [...root.querySelectorAll(".shop-item")];

      const sum = () => [...cart].reduce((s, i) => s + PHASE.items[i].price, 0);

      function draw() {
        const budget = PHASE.budgets[round];
        root.querySelector("#round").textContent = `> EINKAUF ${round + 1} / ${PHASE.budgets.length}`;
        root.querySelector("#task").textContent = `Gebt genau ${UI.chf(budget)} aus. Nicht mehr und nicht weniger!`;
        root.querySelector("#sum").textContent = UI.chf(sum());
        root.querySelector("#budget").textContent = UI.chf(budget);
        root.querySelector("#sum").className = sum() > budget ? "bad" : sum() === budget ? "good" : "";
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
        const budget = PHASE.budgets[round];
        const s = sum();
        if (s > budget) { UI.wrong(panel, feedback, `ZU TEUER! 😂 ${UI.chf(s - budget)} zu viel. ${CONFIG.uncle} ist doch nicht reich!`); return; }
        if (s < budget) { UI.wrong(panel, feedback, `Zu wenig! Es fehlen noch ${UI.chf(budget - s)}. Genau ${UI.chf(budget)}!`); return; }

        round++;
        if (round >= PHASE.budgets.length) {
          root.querySelector("#pay").disabled = true;
          UI.completeMission(PHASE.n, app, { lines: ["> Alle Einkäufe stimmen ✔"] });
          return;
        }
        Sound.play("success");
        FX.burst(50);
        feedback.className = "feedback ok";
        feedback.textContent = "Perfekt bezahlt! Nächster Einkauf …";
        cart = new Set();
        await FX.wait(500);
        draw();
      });
    },
  });
})();
