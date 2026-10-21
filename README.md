# TEMU QUEST

Ein geheimes Agenten-Spiel im Browser für junge Agenten.

## Starten

`index.html` im Browser öffnen (Doppelklick reicht). Es wird kein Server gebraucht.

## Aufbau

```
index.html              Grundgerüst, lädt alle Dateien
css/style.css           Aussehen (Farben stehen oben in :root)
js/sound.js             Soundeffekte (Sound.play("success") ...)
js/fx.js                Effekte: fallender Code, Konfetti, Schreibmaschine
js/app.js               Spiel-Kern: wechselt zwischen den Screens
js/screens/login.js     Schritt 1: Das geheime Passwort
js/screens/zentrale.js  Platzhalter für den nächsten Schritt
```

## Einen neuen Schritt hinzufügen

1. Neue Datei anlegen, z. B. `js/screens/mission1.js`:

   ```js
   (function () {
     App.register("mission1", {
       render(root, app) {
         root.innerHTML = `<div class="panel"> ... </div>`;
         // Knöpfe verbinden, am Ende: app.markSolved("mission1"); app.go("zentrale");
       },
     });
   })();
   ```

2. In `index.html` die Datei einbinden:
   `<script src="js/screens/mission1.js"></script>`

3. Von einem anderen Screen dorthin springen: `app.go("mission1")`
   (z. B. in `zentrale.js` statt dem Platzhalter einen Knopf einbauen).

Nützliche Helfer:

- `app.normalize(text)` – vergleicht Antworten ohne Groß/Klein und Leerzeichen
- `FX.typeText(element, "Text")` – Schreibmaschinen-Effekt
- `FX.burst()` – Konfetti
- `FX.replayClass(element, "shake")` – Wackeln bei falscher Antwort
- `Sound.play("click" | "error" | "success" | "unlock" | "blip" | "whoosh")`
