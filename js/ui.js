/*
 * Bausteine, die mehrere Screens benutzen.
 */
(function () {
  // Text sicher ins HTML setzen (wichtig für alles, was die Kinder eintippen)
  function esc(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // Schweizer Franken: "Fr. 10.–" oder "Fr. 3.50"
  function chf(amount) {
    const n = Math.round(Number(amount) * 100) / 100;
    return "Fr. " + (Number.isInteger(n) ? n + ".–" : n.toFixed(2));
  }

  function countdown(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const pad = (x) => String(x).padStart(2, "0");
    return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
  }

  function dateTime(ts) {
    const d = new Date(ts);
    const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    return days[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + ". um " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  // Rahmen für eine Mission: Statusleiste, Titel, Inhalt, Zurück-Knopf
  function missionFrame(n, inner) {
    const p = CONFIG.phases[n - 1];
    return `
      <div class="panel">
        <div class="status-bar">
          <span class="state ok"><span class="blink-dot"></span>MISSION ${n}/5</span>
          <span>AKTE TQ-0${n}</span>
        </div>
        <h1 class="title">
          <span class="mid glitch" data-text="${esc(p.title.toUpperCase())}">${esc(p.title.toUpperCase())}</span>
        </h1>
        ${inner}
        <button class="btn ghost" data-back type="button">&lt; Zurück zur Zentrale</button>
      </div>`;
  }

  function bindBack(root, app) {
    root.querySelectorAll("[data-back]").forEach((b) =>
      b.addEventListener("click", () => { Sound.play("click"); app.go("zentrale"); })
    );
  }

  // Falsche Antwort: wackeln, rot blinken, Fehler-Ton
  function wrong(panel, feedback, text) {
    Sound.play("error");
    feedback.className = "feedback wrong";
    feedback.textContent = text || CONFIG.wrongText;
    FX.replayClass(panel, "shake");
    FX.replayClass(panel, "flash-red");
    FX.replayClass(feedback, "shake");
  }

  /*
   * NACHRICHT AN BACI BARDH
   * Ein Kasten mit: der fertigen Nachricht, Schritt-für-Schritt-Anleitung,
   * grünem WhatsApp-Knopf und "Text kopieren" als Notlösung.
   */
  function whatsappLink(text) {
    const number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function sendBox(text) {
    const direct = Boolean(String(CONFIG.whatsappNumber || "").replace(/\D/g, ""));
    return `
      <div class="send-box">
        <span class="label">&gt; DIESE NACHRICHT SCHICKT IHR AN ${esc(CONFIG.uncle.toUpperCase())}</span>
        <pre class="msg-preview" data-msg>${esc(text)}</pre>
        <ol class="send-steps">
          <li>Drückt auf den grünen Knopf <b>„Per WhatsApp schicken“</b>.</li>
          <li>WhatsApp geht auf. Die Nachricht ist schon geschrieben.</li>
          ${direct ? "" : `<li>Wählt <b>${esc(CONFIG.uncle)}</b> aus.</li>`}
          <li>Drückt auf <b>Senden ➤</b>. Fertig!</li>
        </ol>
        <a class="btn whatsapp" href="${esc(whatsappLink(text))}" target="_blank" rel="noopener noreferrer" data-wa>📲 Per WhatsApp schicken</a>
        <button class="btn ghost" type="button" data-copy>WhatsApp geht nicht auf? Text kopieren</button>
        <p class="hint" data-copy-msg role="status" aria-live="polite"></p>
      </div>`;
  }

  // Knöpfe im Kasten verbinden. onSent wird aufgerufen, sobald WhatsApp oder Kopieren gedrückt wurde.
  function bindSendBox(container, text, onSent) {
    const msg = container.querySelector("[data-copy-msg]");
    container.querySelector("[data-wa]").addEventListener("click", () => {
      Sound.play("click");
      msg.textContent = "WhatsApp geht auf … Vergesst nicht, auf Senden zu drücken!";
      if (onSent) onSent();
    });
    container.querySelector("[data-copy]").addEventListener("click", async () => {
      Sound.play("click");
      if (onSent) onSent();
      try {
        await navigator.clipboard.writeText(text);
        msg.textContent = `Kopiert! Öffnet WhatsApp, den Chat mit ${CONFIG.uncle}, lange ins Feld drücken → Einfügen → Senden.`;
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(container.querySelector("[data-msg]"));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        msg.textContent = `Der Text ist markiert. Kopiert ihn und schickt ihn in WhatsApp an ${CONFIG.uncle}.`;
      }
    });
  }

  // Eigenes Fenster nur zum Schicken (für "Melden" in der Zentrale und die Wunschliste)
  function sendDialog(title, text) {
    const overlay = document.createElement("div");
    overlay.className = "granted";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", title);
    overlay.innerHTML = `
      <div class="granted-box">
        <h2 class="dialog-title">${esc(title)}</h2>
        ${sendBox(text)}
        <button class="btn ghost" type="button" data-close>Schließen</button>
      </div>`;
    document.body.appendChild(overlay);
    bindSendBox(overlay, text);
    overlay.querySelector("[data-close]").addEventListener("click", () => {
      Sound.play("click");
      overlay.remove();
    });
  }

  // Die WhatsApp-Nachricht für eine geschaffte Mission
  function missionReport(n) {
    const p = CONFIG.phases[n - 1];
    return [
      `TEMU QUEST ✅ Mission ${n} „${p.title}“ GESCHAFFT!`,
      `Erfolgs-Code: ${p.proof}`,
      `Gelöst: ${dateTime(Game.solvedAt(n) || Date.now())}`,
      `Agenten: ${CONFIG.kids.map((k) => k.agent).join(" und ")}`,
    ].join("\n");
  }

  /*
   * Die große Belohnungs-Animation.
   * UI.reward({ title, sub, lines, button, share, onDone })
   * share: Nachricht für Baci Bardh. Dann erscheint der WhatsApp-Kasten, und
   * wer ohne Schicken weiter will, wird zuerst gewarnt.
   */
  async function reward({ title = "GESCHAFFT!", sub = "", lines = [], button = "Zurück zur Zentrale ▶", share, onDone }) {
    const overlay = document.createElement("div");
    overlay.className = "granted";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", title);
    overlay.innerHTML = `
      <div class="granted-box">
        <h2 class="granted-title glitch" data-text="${esc(title)}">${esc(title)}</h2>
        ${sub ? `<p class="granted-sub">${esc(sub)}</p>` : ""}
        <pre class="terminal"></pre>
        <div class="progress" aria-hidden="true"><span></span></div>
        <div class="reward-actions" hidden>
          ${share ? `
            <div class="step-banner">JETZT WICHTIG: Schickt die Nachricht an ${esc(CONFIG.uncle)}! Ohne Nachricht kein Geld.</div>
            ${sendBox(share)}` : ""}
          <p class="feedback wrong" data-warn hidden></p>
          <button class="btn go" type="button" data-done>${esc(button)}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    Sound.play("success");
    FX.burst();

    const term = overlay.querySelector(".terminal");
    const bar = overlay.querySelector(".progress span");
    for (let i = 0; i < lines.length; i++) {
      const row = document.createElement("div");
      term.appendChild(row);
      await FX.typeText(row, lines[i], 22);
      bar.style.width = ((i + 1) / lines.length) * 100 + "%";
      Sound.play(lines[i].includes("Fr.") ? "coin" : "blip");
      await FX.wait(220);
    }
    bar.style.width = "100%";

    overlay.querySelector(".reward-actions").hidden = false;
    let sent = !share;
    let warned = false;
    if (share) bindSendBox(overlay, share, () => { sent = true; });

    const btn = overlay.querySelector("[data-done]");
    btn.addEventListener("click", () => {
      if (!sent && !warned) {
        warned = true;
        Sound.play("error");
        const warn = overlay.querySelector("[data-warn]");
        warn.hidden = false;
        warn.textContent = `Stopp! Habt ihr die Nachricht an ${CONFIG.uncle} geschickt? Ohne Nachricht kein Geld! (Nochmal drücken = trotzdem weiter)`;
        FX.replayClass(warn, "shake");
        return;
      }
      Sound.play("click");
      overlay.remove();
      if (onDone) onDone();
    });
  }

  // Standard-Abschluss einer Mission: speichern + Belohnung zeigen + zur Zentrale
  function completeMission(n, app, extra = {}) {
    Game.solve(n);
    const p = CONFIG.phases[n - 1];
    const nextPhase = CONFIG.phases[n];
    const lines = [
      `> Mission ${n} ... GESCHAFFT ✔`,
      `> +${chf(CONFIG.prizePerPhase)} auf das Konto von jedem Agenten`,
    ];
    if (p.digit !== null) lines.push(`> Beweis-Ziffer gefunden: ${p.digit}`);
    lines.push(`> Erfolgs-Code: ${p.proof}`);
    if (nextPhase && Game.opensAt(nextPhase.n) > Date.now()) {
      lines.push(`> Nächste Mission: ${dateTime(Game.opensAt(nextPhase.n))}`);
    }
    reward({
      title: extra.title || "GESCHAFFT!",
      sub: extra.sub || "Super Arbeit, Agenten!",
      lines: (extra.lines || []).concat(lines),
      button: extra.button,
      share: missionReport(n),
      onDone: () => app.go(extra.next || "zentrale", extra.next === "regeln" ? { first: true } : {}),
    });
  }

  /*
   * Zahlen-Tastatur (für den Tresor).
   * UI.keypad(container, { length, onSubmit(code, api) })
   * api.clear() leert die Anzeige, api.fail() wackelt.
   */
  function keypad(container, { length = 4, onSubmit }) {
    container.innerHTML = `
      <div class="pin-display" aria-live="polite">${'<span class="pin-slot"></span>'.repeat(length)}</div>
      <div class="keypad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button type="button" class="key" data-d="${d}">${d}</button>`).join("")}
        <button type="button" class="key key-c" data-c>C</button>
        <button type="button" class="key" data-d="0">0</button>
        <button type="button" class="key key-ok" data-ok>OK</button>
      </div>`;
    let code = "";
    const slots = container.querySelectorAll(".pin-slot");
    const show = () => slots.forEach((s, i) => {
      s.textContent = code[i] || "";
      s.classList.toggle("filled", i < code.length);
    });
    const api = {
      clear() { code = ""; show(); },
      fail() { FX.replayClass(container.querySelector(".pin-display"), "shake"); code = ""; show(); },
    };
    container.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.d !== undefined && code.length < length) { code += b.dataset.d; Sound.play("key"); }
      else if (b.hasAttribute("data-c")) { code = ""; Sound.play("blip"); }
      else if (b.hasAttribute("data-ok")) {
        if (code.length < length) { Sound.play("blip"); return; }
        onSubmit(code, api);
        return;
      }
      show();
    });
  }

  window.UI = { esc, chf, countdown, dateTime, missionFrame, bindBack, wrong, sendDialog, missionReport, reward, completeMission, keypad };
})();
