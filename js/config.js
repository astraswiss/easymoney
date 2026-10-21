/*
 * EINSTELLUNGEN – hier kann Baci Bardh alles Wichtige ändern.
 * (Die Antworten der einzelnen Missionen stehen oben in js/screens/phaseX.js)
 */
window.CONFIG = {
  uncle: "Baci Bardh",

  // Die zwei Agenten. "id" nie ändern, sobald gespielt wird.
  kids: [
    { id: "lisa", name: "Lisa" },
    { id: "leo", name: "Leo" },
  ],

  prizePerPhase: 10, // Franken pro Kind und gelöster Mission (5 Missionen × 10 × 2 = 100)
  unlockHours: 24, // so viele Stunden nach einer gelösten Mission öffnet die nächste
  adminPin: "2580", // PIN für den Admin-Bereich – bitte ändern!

  wrongText: "FALSCH! 😂 Versuch es noch einmal. Baci Bardh glaubt nicht an dich!",

  // Die 5 Missionen. "digit" ist die Beweis-Ziffer für den Tresor in Mission 5.
  phases: [
    { n: 1, screen: "login", title: "Das geheime Passwort", digit: 7 },
    { n: 2, screen: "phase2", title: "Der Code-Knacker", digit: 4 },
    { n: 3, screen: "phase3", title: "Das Laser-Gedächtnis", digit: 9 },
    { n: 4, screen: "phase4", title: "Der Preis-Detektiv", digit: 2 },
    { n: 5, screen: "phase5", title: "Der letzte Tresor", digit: null },
  ],

  avatars: ["🕵️", "🦊", "🐱", "🐼", "🤖", "👽", "🦄", "🐉", "🦈", "🐸", "🐵", "🐯"],
};
