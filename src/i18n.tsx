import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';
export type Language = 'en' | 'de';
export type LanguageChoice = Language | 'auto';
export const LANGUAGE_KEY = 'schildersafari.language.v1';
export function detectLanguage(tags: string[]): Language {
  for (const tag of tags) { const base = tag.toLowerCase().split(/[-_]/)[0]; if (base === 'de' || base === 'en') return base; }
  return 'en';
}
export const german: Record<string, string> = {
"Last seen here · optional": "Zuletzt hier gesehen · optional",
"Save your current GPS position for this plate. Only when you tap; stored on this device. No background tracking.": "Speichere deinen aktuellen GPS-Standort für dieses Kennzeichen. Nur auf Knopfdruck und auf diesem Gerät. Keine Ortung im Hintergrund.",
"Save my location": "Meinen Standort speichern",
"Update to my current location": "Aktuellen Standort übernehmen",
"Finding your location…": "Standort wird ermittelt…",
"Remove saved location": "Gespeicherten Standort entfernen",
"Saved location could not be loaded.": "Der gespeicherte Standort konnte nicht geladen werden.",
"Couldn’t save the location. Please try again.": "Der Standort konnte nicht gespeichert werden. Bitte versuche es erneut.",
"Location permission denied. You can still collect plates without it.": "Standortzugriff abgelehnt. Du kannst auch ohne ihn Kennzeichen sammeln.",
"Location timed out. Try again outdoors.": "Die Standortsuche hat zu lange gedauert. Versuche es draußen erneut.",
"Your location is unavailable. Please try again.": "Dein Standort ist nicht verfügbar. Bitte versuche es erneut.",
"Location is not supported on this device.": "Dieses Gerät unterstützt keine Standortbestimmung.",
"Backups contain plate codes and dates only, never GPS locations.": "Sicherungen enthalten nur Kürzel und Funddaten, niemals GPS-Standorte.",
 'View Schildersafari on GitHub':'Schildersafari auf GitHub ansehen', 'Open source on GitHub ↗':'Open Source auf GitHub ↗',
 'Visit Matt Jewell’s website':'Matt Jewells Website besuchen', 'Made by Matt Jewell ↗':'Von Matt Jewell ↗',
 'About the collection':'Über die Sammlung', 'THE GERMAN PLATE CLUB':'DER CLUB FÜR KENNZEICHENFANS',
 'A LITTLE CURIOSITY. A LOT OF GERMANY.':'EIN BISSCHEN NEUGIER. GANZ VIEL DEUTSCHLAND.',
 'Every plate has':'Jedes Kennzeichen', 'a story':'erzählt eine Geschichte',
 'Spot a plate. Collect a place.':'Entdecke ein Kennzeichen. Sammle einen Ort.',
 'Discover the wonderfully weird in between.':'Und entdecke das wunderbar Skurrile dazwischen.',
 'small plates, big discoveries ↗':'kleine Schilder, große Entdeckungen ↗',
 'What did you spot?':'Was hast du entdeckt?', 'Just the city code. The rest is a mystery for later.':'Nur das Ortskürzel. Der Rest bleibt erst mal ein Geheimnis.',
 'Plate city code':'Ortskürzel des Kennzeichens', 'e.g. B':'z. B. B', 'Saving…':'Wird gespeichert…', 'Spotted!  ↗':'Entdeckt!  ↗',
 'Your collection could not be loaded. Tap to retry.':'Deine Sammlung konnte nicht geladen werden. Zum Wiederholen antippen.',
 'That code isn’t in the regional collection. Check the first 1–3 letters (including umlauts).':'Dieses Kürzel ist nicht in der Sammlung. Prüfe die ersten 1–3 Buchstaben (auch Umlaute).',
 'Enter the letters at the start of a German plate.':'Gib die Buchstaben am Anfang eines deutschen Kennzeichens ein.',
 'Couldn’t save this sighting. Please try again.':'Der Fund konnte nicht gespeichert werden. Bitte versuche es noch einmal.',
 'Couldn’t remove this sighting. Please try again.':'Der Fund konnte nicht entfernt werden. Bitte versuche es noch einmal.',
 'Couldn’t open the source link.':'Der Quellenlink konnte nicht geöffnet werden.',
 'places spotted':'Orte entdeckt', 'states explored':'Bundesländer entdeckt', 'LAST SPOTTED':'ZULETZT ENTDECKT',
 'Your collection':'Deine Sammlung', 'Explore by Bundesland. Find a little more of Germany.':'Entdecke Deutschland, Bundesland für Bundesland.',
 'All plates':'Alle Schilder', 'Spotted':'Entdeckt', 'Unseen':'Unentdeckt', 'spotted':'entdeckt',
 'Tap a plate to revisit its story':'Tippe auf ein Schild, um seine Geschichte zu lesen',
 '?  UNSEEN PLACES STAY A MYSTERY':'?  UNENTDECKTE ORTE BLEIBEN GEHEIM', 'PLATES':'SCHILDER',
 'Open fact':'Geschichte öffnen', '-letter plate':'-Buchstaben-Kennzeichen',
 'Somewhere awaits':'Ein Ort wartet auf dich', 'READ STORY ↗':'GESCHICHTE LESEN ↗',
 'Your first find is out there.':'Dein erster Fund wartet auf dich.', 'Every mystery, solved.':'Alle Geheimnisse gelüftet.',
 'Enter a code above to start your collection.':'Gib oben ein Kürzel ein und starte deine Sammlung.',
 'You’ve spotted every plate in the collection!':'Du hast alle Kennzeichen der Sammlung entdeckt!',
 'Take the scenic route.':'Nimm den schöneren Weg.', 'MADE FOR CURIOUS PASSENGERS · SAVED ON THIS DEVICE':'FÜR NEUGIERIGE MITREISENDE · AUF DIESEM GERÄT GESPEICHERT',
 'Close fact':'Geschichte schließen', 'NEW PLACE. NEW STORY.':'NEUER ORT. NEUE GESCHICHTE.',
 'FROM YOUR COLLECTION':'AUS DEINER SAMMLUNG', 'WELL, THAT’S UNEXPECTED':'DAMIT HÄTTEST DU NICHT GERECHNET',
 'The story checks out ↗':'Hier ist die Quelle ↗', 'Keep exploring  ↗':'Weiter entdecken  ↗',
 'Added by mistake? Remove sighting':'Aus Versehen hinzugefügt? Fund entfernen',
 'A tiny field guide.':'Dein kleiner Reisebegleiter.', 'Explore the catalogue source ↗':'Zur Quelle der Kennzeichenliste ↗', 'Let’s explore':'Los geht’s',
 'Language':'Sprache', 'Automatic':'Automatisch',
 'Enter the first one, two or three letters on a German number plate. Each find reveals a place and a story. Tap any spotted plate to read it again.':'Gib die ersten ein, zwei oder drei Buchstaben eines deutschen Kennzeichens ein. Jeder Fund enthüllt einen Ort und seine Geschichte. Tippe auf ein entdecktes Schild, um sie erneut zu lesen.',
 'Unseen codes and places stay hidden. Your collection lives on this device, with no account needed. Install Schildersafari from your browser menu (on iPhone: Share → Add to Home Screen). After the first online visit, the installed app works offline. Your browser is asked to protect saved data from automatic cleanup; clearing site data still removes it.':'Unentdeckte Kürzel und Orte bleiben verborgen. Deine Sammlung bleibt auf diesem Gerät – ohne Konto. Installiere Schildersafari über das Browsermenü (auf dem iPhone: Teilen → Zum Home-Bildschirm). Nach dem ersten Online-Besuch funktioniert die App auch offline. Der Browser wird gebeten, gespeicherte Daten vor automatischem Löschen zu schützen. Wenn du Websitedaten löschst, wird auch deine Sammlung gelöscht.',
 '716 regional codes from the ADAC list dated 14 September 2026. Retired and government-only codes are excluded. Selected places have researched oddities; the others explain the code’s local connection.':'716 regionale Kürzel aus der ADAC-Liste vom 14. September 2026. Auslaufende und reine Behördenkennzeichen sind nicht enthalten. Ausgewählte Orte erzählen kuriose Geschichten; die übrigen erklären die regionale Zuordnung des Kürzels.',
 'Move or back up your collection':'Sammlung übertragen oder sichern',
 'Copy this backup, open schildersafari.de on the other device or browser, and paste it here. Import merges sightings without deleting existing finds.':'Kopiere diese Sicherung, öffne schildersafari.de auf dem anderen Gerät oder im anderen Browser und füge sie hier ein. Beim Import werden Funde zusammengeführt, ohne bestehende zu löschen.',
 'Show backup':'Sicherung anzeigen', 'Collection backup':'Sicherung der Sammlung', 'Paste a backup here':'Sicherung hier einfügen', 'Import backup':'Sicherung importieren',
 'Backup imported.':'Sicherung importiert.', 'Invalid backup. Your collection has not changed.':'Ungültige Sicherung. Deine Sammlung wurde nicht verändert.',
 'Couldn’t import the backup. Please try again.':'Die Sicherung konnte nicht importiert werden. Bitte versuche es erneut.',
 'Move to schildersafari.de ↗':'Zu schildersafari.de wechseln ↗',
 'Language preference could not be saved.':'Die Spracheinstellung konnte nicht gespeichert werden.',
};
const Context = createContext({ language: 'en' as Language, choice: 'auto' as LanguageChoice, setChoice: (_: LanguageChoice) => {}, t: (s: string) => s, locale: 'en-GB' });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
 const browserLanguage = () => detectLanguage(getLocales().map(l => l.languageTag));
 const [automatic, setAutomatic] = useState<Language>(browserLanguage);
 const [choice, setChoiceState] = useState<LanguageChoice>('auto');
 useEffect(() => { let active = true; void AsyncStorage.getItem(LANGUAGE_KEY).then(value => { if (active && (value === 'en' || value === 'de')) setChoiceState(value); }).catch(() => {}); return () => { active = false; }; }, []);
 useEffect(() => { if (Platform.OS !== 'web') return; const update = () => setAutomatic(browserLanguage()); window.addEventListener('languagechange', update); return () => window.removeEventListener('languagechange', update); }, []);
 const language = choice === 'auto' ? automatic : choice;
 useEffect(() => { if (Platform.OS === 'web') document.documentElement.lang = language; }, [language]);
 function setChoice(value: LanguageChoice) { setChoiceState(value); void AsyncStorage.setItem(LANGUAGE_KEY, value).catch(() => {}); }
 return <Context.Provider value={{ language, choice, setChoice, t: text => language === 'de' ? german[text] ?? text : text, locale: language === 'de' ? 'de-DE' : 'en-GB' }}>{children}</Context.Provider>;
}
export function useLanguage() { return useContext(Context); }
