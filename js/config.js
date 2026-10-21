/*
 * EINSTELLUNGEN – das ganze Spiel wird hier gesteuert.
 * Es wird nichts im Browser gespeichert: Was hier steht, sehen die Kinder.
 * (Die Antworten der einzelnen Missionen stehen oben in js/screens/...)
 */
window.CONFIG = {
  uncle: "Baci Bardh",

  prizePerPhase: 10, // Franken pro Kind und geschaffter Mission (5 × 10 × 2 = 100)

  // Missionen, die Lisa und Leo schon geschafft haben, z. B. [1, 2]
  solved: [],

  // Die 5 Missionen.
  // opens: ab wann die Mission spielbar ist ("JJJJ-MM-TTTHH:MM", null = sofort)
  // digit: Beweis-Ziffer für den Tresor in Mission 5
  phases: [
    { n: 1, screen: "login", title: "Das geheime Passwort", opens: null, digit: 7 },
    { n: 2, screen: "phase2", title: "Der Code-Knacker", opens: "2026-10-22T16:00", digit: 4 },
    { n: 3, screen: "phase3", title: "Das Laser-Gedächtnis", opens: "2026-10-23T16:00", digit: 9 },
    { n: 4, screen: "phase4", title: "Der Preis-Detektiv", opens: "2026-10-24T16:00", digit: 2 },
    { n: 5, screen: "phase5", title: "Der letzte Tresor", opens: "2026-10-25T16:00", digit: null },
  ],

  // Die zwei Agenten
  // bonus: extra Franken (oder minus) zusätzlich zu den Missionen
  // wishes: Temu-Wünsche, z. B. { name: "Spion-Brille", url: "https://www.temu.com/...", price: 4.9, ordered: false }
  kids: [
    {
      id: "lisa",
      name: "Lisa",
      agent: "Agent Lisa",
      avatar: "🦊",
      bonus: 0,
      wishes: [],
    },
    {
      id: "leo",
      name: "Leo",
      agent: "Agent Leo",
      avatar: "🤖",
      bonus: 0,
      wishes: [],
    },
  ],
};
