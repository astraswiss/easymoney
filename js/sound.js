/*
 * Kleine Soundeffekte – direkt im Browser erzeugt, ohne Sound-Dateien.
 * Benutzung: Sound.play("click"), Sound.play("error") ...
 * Neue Sounds einfach unten in EFFECTS ergänzen.
 */
(function () {
  let ctx = null;
  let enabled = true;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Ein einzelner Ton: Frequenz, Startzeit, Dauer, Wellenform, Lautstärke
  function tone(freq, start, dur, type = "square", vol = 0.08, slideTo = null) {
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + start;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const EFFECTS = {
    key:     () => tone(900 + Math.random() * 400, 0, 0.03, "square", 0.03),
    type:    () => tone(1400 + Math.random() * 300, 0, 0.02, "square", 0.015),
    click:   () => { tone(600, 0, 0.05); tone(900, 0.05, 0.06); },
    error:   () => { tone(220, 0, 0.18, "sawtooth", 0.1); tone(150, 0.18, 0.32, "sawtooth", 0.1, 90); },
    almost:  () => { tone(440, 0, 0.1, "triangle", 0.1); tone(330, 0.12, 0.18, "triangle", 0.1); },
    success: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.18, "square", 0.07));
      tone(1568, 0.4, 0.5, "triangle", 0.08);
    },
    unlock:  () => { tone(200, 0, 0.12, "square", 0.08, 800); tone(1200, 0.12, 0.08, "square", 0.06); },
    blip:    () => tone(1200, 0, 0.05, "sine", 0.06),
    whoosh:  () => tone(120, 0, 0.35, "sawtooth", 0.05, 1200),
    coin:    () => { tone(988, 0, 0.08, "square", 0.06); tone(1319, 0.08, 0.3, "square", 0.06); },
  };

  window.Sound = {
    play(name) {
      if (!enabled || !EFFECTS[name]) return;
      try { EFFECTS[name](); } catch (e) { /* Ton ist nicht wichtig */ }
    },
    // Ein Ton mit bestimmter Höhe (für das Laser-Gedächtnis)
    note(freq, dur = 0.3) {
      if (!enabled) return;
      try { tone(freq, 0, dur, "triangle", 0.12); } catch (e) { /* egal */ }
    },
    get enabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      if (enabled) audio();
      return enabled;
    },
  };
})();
