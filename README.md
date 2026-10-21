# TEMU QUEST

Ein geheimes Agenten-Spiel im Browser für Lisa und Leo.
Es wird **nichts gespeichert** und es gibt **keinen Admin-Bereich**:
Das ganze Spiel wird in `js/config.js` gesteuert.

## Starten

`index.html` im Browser öffnen (Doppelklick reicht).

**Zum Ausprobieren:** `index.html#test` öffnen (oder den Link mit `#test` am Ende).
Dann sind alle Missionen sofort offen.

## So läuft das Spiel

1. **Mission 1 – Das geheime Passwort**: Das Passwort steht auf einem Zettel bei Baci Bardh zu Hause.
   Danach kommen die **Spielregeln** (auch immer über die Zentrale erreichbar).
2. **Missionen 2–5** öffnen sich zu den Zeiten in `js/config.js` (`opens`), mit Countdown in der Zentrale:
   - 2: Der Code-Knacker – Zahlen-Code, jede Zahl um 2 zu groß. Lösung: AGENTEN LIEBEN PIZZA
   - 3: Das Laser-Gedächtnis – Farben nachdrücken, 4 bis 8 Laser, immer schneller
   - 4: Der Preis-Detektiv – 3 Einkäufe: Fr. 12.30 (Brille + Lampe), Fr. 17.– mit 3 Sachen
     (Brille + Tinte + Fingerabdruck-Set), Fr. 20.30 mit 4 Sachen (Brille + Lampe + Schnurrbart + Fingerabdruck-Set)
   - 5: Der letzte Tresor – Beweis-Ziffern nach 3 Hinweisen ordnen: 9 4 7 2. Nach 3 Fehlern 30 Sekunden Alarm.
3. Jede Mission bringt **jedem Kind Fr. 10.–** (Total 100 Franken).
4. Im **Profil** tragen die Kinder Temu-Links mit Preis ein und schicken sie an Baci Bardh.

## Was man in `js/config.js` ändert

| Was | Wo |
| --- | --- |
| Mission geschafft | Nummer in `solved` eintragen, z. B. `solved: [1, 2]` |
| Wann eine Mission öffnet | `opens` bei der Mission, z. B. `"2026-10-22T16:00"` |
| Geld pro Mission | `prizePerPhase` |
| Extra-Geld / Abzug | `bonus` beim Kind |
| Agentenname, Bild | `agent`, `avatar` beim Kind |
| Temu-Wünsche | `wishes` beim Kind, mit `ordered: true` wenn bestellt |

## Was die Kinder per WhatsApp schicken

- **Nach jeder Mission**: Knopf „An Baci Bardh schicken“. Die Nachricht enthält den
  **Erfolgs-Code** der Mission (`proof` in `js/config.js`). Nur wer die Mission wirklich
  gelöst hat, kennt ihn. Vergessen? In der Zentrale gibt es bei der Mission „Melden 📨“.
- **Neue Temu-Wünsche**: im Profil, Knopf „Neue Wünsche an Baci Bardh schicken“.

Danach wird es in `js/config.js` eingetragen.

Ist Mission 1 in `solved`, startet die Seite direkt in der Zentrale.
Was die Kinder während des Spielens lösen oder eintragen, ist nach dem Neuladen weg,
bis es in `js/config.js` steht.

## Dateien

```
js/config.js            EINSTELLUNGEN und Spielstand
js/game.js              Liest den Spielstand aus CONFIG (Status, Geld, Wünsche)
js/ui.js                Bausteine: Belohnungs-Animation, Missions-Rahmen, Tastatur
js/app.js               Wechselt zwischen den Screens
js/sound.js, js/fx.js   Töne und Effekte
js/screens/login.js     Mission 1 (Passwort steht oben in der Datei)
js/screens/phase2-5.js  Missionen 2–5 (Antworten jeweils oben in der Datei)
js/screens/zentrale.js  Zentrale mit Missionen und Countdown
js/screens/profil.js    Profil mit Konto und Wunschliste
```
