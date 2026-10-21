/*
 * Der Spielstand – kommt komplett aus CONFIG.
 * Was während des Spielens passiert (gelöste Missionen, neue Wünsche),
 * gilt nur bis die Seite neu geladen wird.
 */
(function () {
  const solvedNow = new Map(); // in dieser Sitzung gelöst: Mission → Zeitpunkt
  const newWishes = {}; // in dieser Sitzung hinzugefügt, noch nicht verschickt
  CONFIG.kids.forEach((k) => (newWishes[k.id] = []));

  const Game = {
    // Testmodus für Baci Bardh: Link mit #test am Ende → alle Missionen sofort offen
    testMode: location.hash === "#test",

    isSolved(n) {
      return CONFIG.solved.includes(n) || solvedNow.has(n);
    },

    // Gelöst, aber noch nicht in CONFIG eingetragen → muss per WhatsApp gemeldet werden
    solvedOnlyNow(n) {
      return solvedNow.has(n) && !CONFIG.solved.includes(n);
    },
    solvedAt(n) {
      return solvedNow.get(n);
    },

    opensAt(n) {
      const p = CONFIG.phases[n - 1];
      if (Game.testMode || !p.opens) return 0;
      return new Date(p.opens).getTime();
    },

    /*
     * Status einer Mission:
     *   solved  – geschafft
     *   open    – kann gespielt werden
     *   waiting – öffnet bei opensAt
     */
    status(n) {
      if (Game.isSolved(n)) return { kind: "solved" };
      const opensAt = Game.opensAt(n);
      return Date.now() >= opensAt ? { kind: "open" } : { kind: "waiting", opensAt };
    },

    /*
     * Überraschungen (CONFIG.events): solved / open / waiting (opensAt) / missed
     */
    event(id) {
      return CONFIG.events.find((e) => e.id === id);
    },
    eventSolved(id) {
      return Game.event(id).solved || solvedNow.has("event:" + id);
    },
    eventSolvedOnlyNow(id) {
      return solvedNow.has("event:" + id) && !Game.event(id).solved;
    },
    eventStatus(id) {
      const ev = Game.event(id);
      if (Game.eventSolved(id)) return { kind: "solved" };
      if (Game.testMode) return { kind: "open", closesAt: Date.now() + 3600e3 };
      const opensAt = new Date(ev.opens).getTime();
      const closesAt = new Date(ev.closes).getTime();
      if (Date.now() < opensAt) return { kind: "waiting", opensAt };
      if (Date.now() >= closesAt) return { kind: "missed" };
      return { kind: "open", closesAt };
    },
    solveEvent(id) {
      if (!solvedNow.has("event:" + id)) solvedNow.set("event:" + id, Date.now());
    },

    solve(n) {
      if (!solvedNow.has(n)) solvedNow.set(n, Date.now());
    },

    allSolved() {
      return CONFIG.phases.every((p) => Game.isSolved(p.n));
    },

    // Beweis-Ziffern der geschafften Missionen
    digits() {
      return CONFIG.phases
        .filter((p) => p.digit !== null && Game.isSolved(p.n))
        .map((p) => ({ n: p.n, digit: p.digit }));
    },

    kid(id) {
      return CONFIG.kids.find((k) => k.id === id);
    },

    money(id) {
      const solved = CONFIG.phases.filter((p) => Game.isSolved(p.n)).length;
      const events = CONFIG.events.filter((e) => Game.eventSolved(e.id)).reduce((s, e) => s + e.prize, 0);
      return solved * CONFIG.prizePerPhase + events + (Game.kid(id).bonus || 0);
    },

    // Wünsche aus CONFIG + neue aus dieser Sitzung
    wishes(id) {
      return Game.kid(id).wishes.concat(newWishes[id]);
    },
    newWishes(id) {
      return newWishes[id];
    },
    addWish(id, wish) {
      newWishes[id].push({ ...wish, ordered: false, isNew: true, id: Math.random().toString(36).slice(2) });
    },
    removeNewWish(id, wishId) {
      newWishes[id] = newWishes[id].filter((w) => w.id !== wishId);
    },
    wishTotal(id) {
      return Game.wishes(id).reduce((sum, w) => sum + (Number(w.price) || 0), 0);
    },
  };

  window.Game = Game;
})();
