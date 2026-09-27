# Schildersafari

An offline-first field guide for spotting German number plates. Built with Expo, React Native and TypeScript for web, iOS and Android.

**[Try the live PWA](https://schildersafari.de)**

Enter a code such as **B**, **HH** or **BÜS**, tap **Spotted!**, and discover the place behind it. Unseen plates stay hidden as `?`, `??` or `???`. Tap a collected plate to revisit its story.

## Features

- 716 regional plate codes, grouped alphabetically by Bundesland and then code.
- Combined Berlin / Brandenburg, Bremen / Niedersachsen, and Hamburg / Schleswig-Holstein collections.
- Mystery plates remain in their region, without revealing their code, place or fact.
- Per-region progress, all/spotted/unseen filters, and recently spotted plates.
- Local persistence, first-sighting dates, duplicate handling, and removal of mistakes.
- Installable PWA that works offline after its first successful online load.
- Sourced stories, including Berlin’s rubble mountain and Hamburg’s municipal Swan Father.

- German and English, selected from your browser locale with a saved manual override.
- Optional last-sighting GPS position per plate: explicitly save, update or remove it. No background tracking; coordinates stay on your device.
- Collection backup/import, plus crawler files and social preview metadata.

## Development

Requires Node.js 22.13+.

```sh
npm ci
npm start       # Expo development server
npm run web    # Browser development
```

For native development use a compatible Expo Go installation or an Expo development build. No backend, account or API key is required.

## Build and install the PWA

```sh
npm run build:web
npm run preview
# Open http://localhost:4173
```

Serve the contents of `dist/` at the root of an HTTPS domain. The service worker is added only to production builds; the Expo development server is never cached. Chrome offers an install button; on iPhone use Safari’s **Share → Add to Home Screen**.

Workbox precaches the app, catalogue, fonts and icons. New releases activate after all old app windows close. External source links require internet access.

### Container hosting

```sh
npm run build:web
docker build -f deploy/Dockerfile -t plates .
docker run --rm -p 8080:8080 plates
```

The nginx container serves on port 8080 as a non-root user. Put it behind an HTTPS reverse proxy. Optional GPS requires a Permissions-Policy that permits `geolocation=(self)`. A read-only filesystem is supported with writable `/tmp`. `/healthz` provides a health check. Preserve all exported assets, including fonts in `dist/assets/node_modules/`.

## Persistence

Web sightings live in IndexedDB. Existing AsyncStorage/localStorage saves migrate automatically. Writes commit before a plate unlocks, and transactions merge sightings from concurrent tabs. Native builds use AsyncStorage.

The app asks the browser for persistent storage when spotting a plate. Browsers decide whether to grant protection from automatic eviction; denial does not prevent ordinary saves. Clearing site data, deleting a browser profile, or private-browsing cleanup can still erase progress. There is no cloud sync: each device and origin has a separate collection. Use About → Show backup on the old site, then paste it into About → Import backup on the new site to move your collection. Backups deliberately exclude GPS coordinates. The old hostname remains available for this migration.

## Verification

```sh
npm test
npm run lint
npm run typecheck
npm run build:web
npm run test:pwa
```

Browser tests use installed Google Chrome. They cover migration, offline reloads, saved facts, offline writes/removal, concurrent tabs, failed writes, and browser shutdown/restart while offline.

To test another deployment in visible Chrome:

```sh
E2E_BASE_URL=https://your-domain.example E2E_HEADED=1 npm run test:pwa -- --headed
```

The tests use isolated browser profiles and only device-local test data.

## Data and facts

`src/data/plates.json` contains 716 distinct regional codes extracted from the [ADAC catalogue](https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/kfz-zulassung/kfz-kennzeichen-deutschland/) dated 14 September 2026, retrieved 27 September 2026. Retired rows marked `*` and non-regional codes are excluded. Duplicate codes are merged with all listed place names retained. This is a dated snapshot, not a live government registry.

`src/facts.ts` currently has 12 curated entries; other codes show a factual local-code explanation. Each story links to its source. Contributions of verified, slightly wacky local facts are welcome.

To refresh the catalogue, install Python’s `beautifulsoup4` and run `python3 scripts/update_catalogue.py`. Review the diff against the source and update snapshot dates and tests. Hidden entries are a discovery mechanic, not encrypted secrets.

## Contributing

Small fixes, accessibility improvements and sourced local oddities are welcome. Include a reliable source for new facts, keep unseen places hidden, and run the checks above before opening a pull request. Do not commit credentials, personal sightings, or private infrastructure configuration.

## License

App code is [MIT licensed](LICENSE), retaining the Expo template notice. Third-party dependencies, fonts and source material retain their respective rights and licenses. Catalogue provenance and fact sources are documented above and in the app.
