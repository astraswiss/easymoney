/*
 * Der Spielstand. Wird im Browser gespeichert (localStorage) –
 * also immer auf dem gleichen Gerät und im gleichen Browser spielen!
 */
(function () {
  const KEY = "temuquest-save-v1";
  const HOUR = 3600 * 1000;

  function fresh() {
    return { v: 1, setupDone: false, phases: {}, kids: {} };
  }

  // Fehlende Teile ergänzen (z. B. wenn in CONFIG etwas dazukommt)
  function complete(s) {
    CONFIG.kids.forEach((k) => {
      if (!s.kids[k.id]) s.kids[k.id] = { agent: "", avatar: "", money: 0, wishes: [] };
    });
    CONFIG.phases.forEach((p) => {
      if (!s.phases[p.n]) s.phases[p.n] = {};
    });
    return s;
  }

  let state = null;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* kein Speicher */ }
  if (!state || state.v !== 1) state = fresh();
  complete(state);

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* kein Speicher */ }
  }

  const Store = {
    get state() { return state; },
    save,

    kid(id) { return state.kids[id]; },
    kidLabel(id) {
      const k = state.kids[id];
      const base = CONFIG.kids.find((x) => x.id === id);
      return (k && k.agent) || (base ? base.name : id);
    },

    /*
     * Status einer Mission:
     *   solved  – gelöst
     *   open    – kann gespielt werden
     *   waiting – vorige gelöst, öffnet bei opensAt
     *   locked  – vorige noch nicht gelöst
     */
    status(n) {
      const p = state.phases[n];
      if (p.solvedAt) return { kind: "solved", at: p.solvedAt };
      if (n === 1 || p.openedAt) return { kind: "open" };
      const prev = state.phases[n - 1];
      if (!prev || !prev.solvedAt) return { kind: "locked" };
      const opensAt = prev.solvedAt + CONFIG.unlockHours * HOUR;
      return Date.now() >= opensAt ? { kind: "open" } : { kind: "waiting", opensAt };
    },

    solve(n) {
      const p = state.phases[n];
      if (p.solvedAt) return;
      p.solvedAt = Date.now();
      CONFIG.kids.forEach((k) => { state.kids[k.id].money += CONFIG.prizePerPhase; });
      save();
    },

    // Admin: Mission sofort öffnen (ohne Wartezeit)
    openNow(n) {
      state.phases[n].openedAt = Date.now();
      save();
    },

    // Admin: Mission zurücksetzen (Belohnung wird wieder abgezogen)
    resetPhase(n) {
      const p = state.phases[n];
      if (p.solvedAt) {
        CONFIG.kids.forEach((k) => { state.kids[k.id].money -= CONFIG.prizePerPhase; });
      }
      state.phases[n] = {};
      save();
    },

    allSolved() {
      return CONFIG.phases.every((p) => state.phases[p.n].solvedAt);
    },

    // Beweis-Ziffern der gelösten Missionen
    digits() {
      return CONFIG.phases
        .filter((p) => p.digit !== null && state.phases[p.n].solvedAt)
        .map((p) => ({ n: p.n, digit: p.digit }));
    },

    addMoney(id, amount) {
      state.kids[id].money += amount;
      save();
    },

    addWish(id, wish) {
      state.kids[id].wishes.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: wish.name,
        url: wish.url,
        price: wish.price,
        ordered: false,
      });
      save();
    },
    removeWish(id, wishId) {
      const k = state.kids[id];
      k.wishes = k.wishes.filter((w) => w.id !== wishId);
      save();
    },
    toggleOrdered(id, wishId) {
      const w = state.kids[id].wishes.find((x) => x.id === wishId);
      if (w) { w.ordered = !w.ordered; save(); }
    },
    wishTotal(id) {
      return state.kids[id].wishes.reduce((sum, w) => sum + (Number(w.price) || 0), 0);
    },

    resetAll() {
      state = complete(fresh());
      save();
    },
  };

  window.Store = Store;
})();
