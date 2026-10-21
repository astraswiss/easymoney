# TEMU QUEST

Ein geheimes Agenten-Spiel im Browser für Lisa und Leo. Ohne Server, ohne Konto:
der Spielstand wird im Browser gespeichert.

## Starten

`index.html` im Browser öffnen (Doppelklick reicht).
Wichtig: Immer auf **demselben Gerät im selben Browser** spielen, dort ist der Spielstand gespeichert.

## So läuft das Spiel

1. **Mission 1 – Das geheime Passwort**: Das Passwort steht auf einem Zettel bei Baci Bardh zu Hause.
2. Danach erstellt jedes Kind seinen **Agenten-Ausweis** (Name + Bild).
3. **Missionen 2–5** öffnen sich jeweils **24 Stunden** nach der vorigen:
   - 2: Der Code-Knacker (Zahlen-Code A=1 … Z=26)
   - 3: Das Laser-Gedächtnis (Farben nachdrücken)
   - 4: Der Preis-Detektiv (genau Fr. 20.– und Fr. 17.– ausgeben)
   - 5: Der letzte Tresor (Beweis-Ziffern rückwärts: 2 9 4 7)
4. Jede Mission bringt **jedem Kind Fr. 10.–** (Total 100 Franken).
5. Im **Profil** sammeln die Kinder Temu-Links mit Preis und schicken die Liste per Knopf an Baci Bardh.

## Admin

5× schnell auf das Logo **TEMU QUEST** tippen → PIN eingeben (Standard `2580`, in `js/config.js` ändern).
Dort kann man: Missionen sofort öffnen oder zurücksetzen, Geld geben/abziehen,
Wünsche als „bestellt“ markieren oder löschen, das ganze Spiel zurücksetzen.

## Was wo steht

```
js/config.js            EINSTELLUNGEN: Namen, Geld pro Mission, Stunden, Admin-PIN
js/store.js             Spielstand (Speichern im Browser, Missionen, Geld, Wunschlisten)
js/ui.js                Bausteine: Belohnungs-Animation, Missions-Rahmen, Tastatur
js/app.js               Wechselt zwischen den Screens
js/sound.js, js/fx.js   Töne und Effekte
js/screens/login.js     Mission 1 (Passwort steht oben in der Datei)
js/screens/phase2-5.js  Missionen 2–5 (Antworten jeweils oben in der Datei)
js/screens/setup.js     Agenten-Ausweis
js/screens/zentrale.js  Zentrale mit Missionen und Countdown
js/screens/profil.js    Profil mit Konto und Wunschliste
js/screens/admin.js     Admin-Bereich
```

## Eine Mission austauschen

Eine Datei in `js/screens/` neu schreiben, z. B. `phase3.js`:

```js
(function () {
  App.register("phase3", {
    render(root, app) {
      root.innerHTML = UI.missionFrame(3, `<p>...dein Rätsel...</p>`);
      UI.bindBack(root, app);
      // wenn gelöst:
      // UI.completeMission(3, app);
    },
  });
})();
```

Den Titel in `js/config.js` bei `phases` anpassen. Wird eine Beweis-Ziffer geändert,
ändert sich auch der Tresor-Code in Mission 5 automatisch.
