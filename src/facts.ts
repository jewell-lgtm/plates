import { CATALOG_SOURCE, Plate } from './collection';
export type Fact = { title: string; text: string; source: string; label?: string };
const facts: Record<string, Fact> = {
 B: { title: 'A mountain made of yesterday.', text: 'Berlin’s Teufelsberg is a hill built from Second World War rubble, topped with a former Cold War listening station. A pile of debris with a rather impressive second career.', source: 'https://www.berlin.de/en/attractions-and-sights/3560349-3104052-teufelsberg.en.html' },
 HH: { title: 'Yes, “Swan Father” is a job.', text: 'Hamburg’s Alster swans have their very own municipal Swan Father, who looks after them and their winter quarters. Helicopter parenting, but with actual wings.', source: 'https://www.hamburg-travel.com/blog/the-swans-are-back-living-landmarks-return-to-hamburgs-alster/' },
 W: { title: 'The elephant left the tram.', text: 'In 1950, a young elephant called Tuffi fell from Wuppertal’s suspended railway into the river below and survived. Possibly the most dramatic public-transport review ever.', source: 'https://www.wuppertal.de/presse/meldungen/meldungen-2020/september20/tuff-stoerstein.php' },
 A: { title: 'Rent from another century.', text: 'Augsburg’s Fuggerei kept its historic annual basic rent at the equivalent of 88 cents. Yes, annual. Your sofa probably contains more than that.', source: 'https://www.augsburg.de/fileadmin/user_upload/footer/presse/downloads/2021/21_09_03_TdoD21_Broschuere_RZ_web_kompr.pdf' },
 M: { title: 'Surfboards. In Bavaria.', text: 'Munich’s Eisbach became famous for river surfing on a standing wave in the middle of the city. The ocean was apparently an optional extra.', source: 'https://www.muenchen.de/sehenswuerdigkeiten/top-sehenswuerdigkeiten/eisbach-surferwelle' },
 BA: { title: 'Your beer has been smoked.', text: 'Bamberg’s Rauchbier gets its smoky character from malt dried over smoke. Local breweries kept the tradition alive when smoke-free drying took over elsewhere. A campfire, with a head on it.', source: 'https://en.bamberg.info/rauchbier/' },
 BS: { title: 'This building has a face. Several.', text: 'Braunschweig’s Happy Rizzi House is covered with colourful cartoon faces, designed by New York artist James Rizzi. Even the architecture seems to be in a suspiciously good mood.', source: 'https://www.braunschweig.de/tourismus/ihr-besuch-in-braunschweig/sehenswuerdigkeiten/eintraege-sehenswuerdigkeiten/_happy_rizzi_house.php' },
 'BÜS': { title: 'Germany, surrounded by Switzerland.', text: 'Büsingen is German territory completely surrounded by Switzerland. Politically German, geographically a little plot twist.', source: 'https://www.myswitzerland.com/en-ch/destinations/switzerlands-german-island/' },
 HB: { title: 'Drop it. For science.', text: 'Bremen has a drop tower where researchers create brief spells of weightlessness. A whole laboratory dedicated to letting things fall very, very carefully.', source: 'https://www.bremen.eu/life-in-bremen/best-of-bremen' },
 MHL: { title: 'A museum with extra mustard.', text: 'Mühlhausen is home to Germany’s first bratwurst museum. Finally, a cultural institution that understands the importance of sausage.', source: 'https://bratwurstmuseum.de/' },
 MU: { title: 'München got a second helping.', text: 'The district of Munich started issuing MU on 19 January 2026, alongside M. A fresh little code for a very well-spotted part of Germany.', source: 'https://www.landkreis-muenchen.de/artikel/start-fuer-mu-neues-kfz-kennzeichen-ab-januar/' },
};
facts.MUC = facts.M;
export function factFor(plate: Plate): Fact {
 return facts[plate.code] ?? {
  title: 'A little code. A whole place.',
  text: `${plate.code} identifies ${plate.places.join(' / ')} in ${plate.state}. ${plate.places.length > 1 ? 'Plot twist: this code is shared by more than one place. One tiny plate, several hometowns.' : 'A whole corner of Germany squeezed into ' + plate.code.length + (plate.code.length === 1 ? ' letter.' : ' letters.')}`,
  label: 'BEHIND THE CODE', source: CATALOG_SOURCE,
 };
}
