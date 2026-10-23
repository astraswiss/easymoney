/*
 * EINSTELLUNGEN – das ganze Spiel wird hier gesteuert.
 * Es wird nichts im Browser gespeichert: Was hier steht, sehen die Kinder.
 * (Die Antworten der einzelnen Missionen stehen oben in js/screens/...)
 */
window.CONFIG = {
  uncle: "Baci Bardh",

  // Handynummer von Baci Bardh für WhatsApp, z. B. "+41 79 123 45 67".
  // Leer lassen = die Kinder wählen ihn in WhatsApp selbst aus.
  whatsappNumber: "",

  prizePerPhase: 10, // Franken pro Kind und geschaffter Mission (5 × 10 × 2 = 100)

  // Missionen, die Lisa und Leo schon geschafft haben, z. B. [1, 2]
  solved: [1, 2, 3],

  // Die 5 Missionen.
  // opens: ab wann die Mission spielbar ist ("JJJJ-MM-TTTHH:MM", null = sofort)
  // digit: Beweis-Ziffer für den Tresor in Mission 5
  // proof:  Erfolgs-Code, den die Kinder per WhatsApp schicken (nur wer die Mission löst, sieht ihn)
  phases: [
    { n: 1, screen: "login", title: "Das geheime Passwort", opens: null, digit: 7, proof: "FALKE-17" },
    { n: 2, screen: "phase2", title: "Der Code-Knacker", opens: "2026-10-22T16:00", digit: 4, proof: "KOBRA-42" },
    { n: 3, screen: "phase3", title: "Das Laser-Gedächtnis", opens: "2026-10-23T16:00", digit: 9, proof: "BLITZ-63" },
    { n: 4, screen: "phase4", title: "Der Preis-Detektiv", opens: "2026-10-24T16:00", digit: 2, proof: "TIGER-85" },
    { n: 5, screen: "phase5", title: "Der letzte Tresor", opens: "2026-10-25T16:00", digit: null, proof: "DRACHE-99" },
  ],

  // Überraschungen: nur in einem Zeitfenster spielbar.
  // prize: Franken pro Kind. solved: true, wenn die Kinder den Erfolgs-Code geschickt haben.
  events: [
    {
      id: "doppelagent",
      screen: "surprise-doppelagent",
      title: "Der Doppelagent",
      opens: "2026-10-21T16:00",
      closes: "2026-10-21T20:00",
      prize: 10,
      proof: "ZEBRA-21",
      solved: true,
    },
    {
      id: "rechner",
      screen: "surprise-rechner",
      title: "Der Blitz-Rechner",
      opens: "2026-10-22T18:00",
      closes: "2026-10-22T20:00",
      prize: 10,
      proof: "PANTHER-38",
      solved: false,
    },
    {
      id: "foto",
      screen: "surprise-foto",
      title: "Das Foto-Gedächtnis",
      opens: "2026-10-23T18:00",
      closes: "2026-10-23T20:00",
      prize: 10,
      proof: "HAI-54",
      solved: false,
    },
    {
      id: "bombe",
      screen: "surprise-bombe",
      title: "Der Bomben-Entschärfer",
      opens: "2026-10-24T18:00",
      closes: "2026-10-24T20:00",
      prize: 10,
      proof: "ADLER-76",
      solved: false,
    },
    {
      id: "sudoku",
      screen: "surprise-sudoku",
      title: "Das Agenten-Sudoku",
      opens: "2026-10-25T18:00",
      closes: "2026-10-25T20:00",
      prize: 10,
      proof: "WOLF-91",
      solved: false,
    },
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
      wishes: [
        { name: "Squishy", url: "https://share.temu.com/V7KNscqYGrB", price: 4.84, ordered: false },
        { name: "Idk", url: "https://share.temu.com/cPDnIF9ctqB", price: 2.87, ordered: false },
      ],
    },
    {
      id: "leo",
      name: "Leo",
      agent: "Agent Leo",
      avatar: "🤖",
      bonus: 0,
      wishes: [
        { name: "Wave ball", url: "https://share.temu.com/0PMbnStTrVB", price: 9, ordered: false },
      ],
    },
  ],
};
