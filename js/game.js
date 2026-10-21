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
      return p.opens ? new Date(p.opens).getTime() : 0;
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
      return solved * CONFIG.prizePerPhase + (Game.kid(id).bonus || 0);
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
