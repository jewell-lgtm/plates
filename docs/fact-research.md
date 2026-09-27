# Researching the places behind the plates

The September 2026 expansion started from the complete 716-code catalogue. A programmatic German-language search sweep covered each plate's place labels, followed by individual searches to resolve weak results, similarly named towns and district boundaries. Three research agents and the coordinating reviewer divided the catalogue, selected one story per code and wrote English and German versions.

Useful starting phrases, reproduced by `npm run facts:queue`:

- `"PLACE" STATE kuriose Fakten Besonderheiten Stadtgeschichte`
- `"PLACE" ungewöhnliche Sehenswürdigkeiten Tourismus Museum`
- `"PLACE" "Wussten Sie"`
- `"PLACE" Sagen Traditionen Erfindungen`

The generated queue groups identical place labels and retains their codes and states. Add state or district context when a place name is ambiguous. These queries are discovery tools, not evidence by themselves: follow up on the actual claim.

## Selection

Prefer municipal websites, local museums, archives, tourism organisations and the institutions involved. Reliable reporting and historical reference sources are also used. Pick an unusual, specific story where possible; grounded history or nature is better than an invented curiosity.

Check that the source supports the claim and that the location belongs to the code's city or district. Name the actual location when using a district-wide story. Explicitly label legends, qualify disputed superlatives, avoid unsupported causal claims, and prefer stable historical details over opening times or changing visitor information. Write short original paraphrases in both languages; keep the joke separate from the factual assertion.

Expanded records in `src/data/facts.json` contain the place label, source URL, verification date and a brief editorial evidence note. The evidence note is a paraphrase, not a quotation. Original stories remain in `src/facts.ts`. Source pages can change; a dated check is not a permanent guarantee.

## Coverage and regression checks

`npm run facts:coverage` reports researched coverage and fails if any catalogue code would receive only a generic explanation. Unit tests check both languages, provenance and catalogue membership. A browser test checks that a newly researched story is hidden until spotted, then remains accessible after an offline reload and language change.

Facts are bundled with the app so unlocked stories work offline. Source websites themselves require a connection. Unseen stories are hidden by the interface; as with any static open-source app, the underlying dataset is public.
