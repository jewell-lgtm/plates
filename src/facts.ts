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
export function factFor(plate: Plate, language: 'en' | 'de' = 'en'): Fact {
 if (language === 'de') {
  const translated = germanFacts[plate.code];
  if (translated) return { ...facts[plate.code], ...translated };
  return { title: 'Ein kleines Kürzel. Ein ganzer Ort.', text: `${plate.code} steht für ${plate.places.join(' / ')} in ${plate.state}. ${plate.places.length > 1 ? 'Überraschung: Mehrere Orte teilen sich dieses Kürzel. Ein winziges Schild, mehrere Heimatorte.' : 'Ein ganzes Stück Deutschland in ' + plate.code.length + (plate.code.length === 1 ? ' Buchstaben.' : ' Buchstaben.')}`, label: 'HINTER DEM KÜRZEL', source: CATALOG_SOURCE };
 }
 return facts[plate.code] ?? {
  title: 'A little code. A whole place.',
  text: `${plate.code} identifies ${plate.places.join(' / ')} in ${plate.state}. ${plate.places.length > 1 ? 'Plot twist: this code is shared by more than one place. One tiny plate, several hometowns.' : 'A whole corner of Germany squeezed into ' + plate.code.length + (plate.code.length === 1 ? ' letter.' : ' letters.')}`,
  label: 'BEHIND THE CODE', source: CATALOG_SOURCE,
 };
}

const germanFacts: Record<string, { title: string; text: string }> = {
 B: { title: 'Ein Berg aus Vergangenheit.', text: 'Berlins Teufelsberg besteht aus Trümmern des Zweiten Weltkriegs. Oben steht eine ehemalige Abhörstation aus dem Kalten Krieg. Für einen Schutthaufen eine ziemlich beeindruckende zweite Karriere.' },
 HH: { title: '„Schwanenvater“ ist ein echter Beruf.', text: 'Die Hamburger Alsterschwäne haben einen eigenen städtischen Schwanenvater. Er kümmert sich um sie und ihr Winterquartier. Helikopter-Eltern, aber mit echten Flügeln.' },
 W: { title: 'Der Elefant nahm den Ausgang nach unten.', text: '1950 fiel die junge Elefantin Tuffi aus der Wuppertaler Schwebebahn in die Wupper – und überlebte. Vermutlich die dramatischste Nahverkehrskritik aller Zeiten.' },
 A: { title: 'Miete aus einem anderen Jahrhundert.', text: 'In der Augsburger Fuggerei entspricht die historische jährliche Grundmiete 88 Cent. Ja, jährlich. In deinem Sofa liegt vermutlich mehr Kleingeld.' },
 M: { title: 'Surfbretter. Mitten in Bayern.', text: 'Münchens Eisbach wurde durch das Surfen auf einer stehenden Flusswelle mitten in der Stadt berühmt. Das Meer war offenbar nur ein optionales Extra.' },
 BA: { title: 'Dieses Bier wurde geräuchert.', text: 'Bamberger Rauchbier erhält seinen rauchigen Geschmack durch über Rauch getrocknetes Malz. Brauereien vor Ort hielten daran fest, als sich anderswo rauchfreie Verfahren durchsetzten. Ein Lagerfeuer mit Schaumkrone.' },
 BS: { title: 'Dieses Haus hat ein Gesicht. Mehrere.', text: 'Das Happy Rizzi House in Braunschweig ist mit bunten Comicgesichtern des New Yorker Künstlers James Rizzi bemalt. Sogar die Architektur scheint verdächtig gute Laune zu haben.' },
 'BÜS': { title: 'Deutschland, umzingelt von der Schweiz.', text: 'Büsingen ist deutsches Staatsgebiet, das vollständig von der Schweiz umgeben ist. Politisch deutsch, geografisch eine kleine Überraschung.' },
 HB: { title: 'Einfach fallen lassen. Für die Wissenschaft.', text: 'Bremen hat einen Fallturm, in dem Forschende kurzzeitig Schwerelosigkeit erzeugen. Ein ganzes Labor dafür, Dinge sehr, sehr sorgfältig fallen zu lassen.' },
 MHL: { title: 'Ein Museum mit extra Senf.', text: 'In Mühlhausen steht Deutschlands erstes Bratwurstmuseum. Endlich eine Kultureinrichtung, die weiß, wie wichtig Wurst ist.' },
 MU: { title: 'München bekam einen Nachschlag.', text: 'Seit dem 19. Januar 2026 vergibt der Landkreis München neben M auch MU. Ein frisches kleines Kürzel für eine Gegend, in der es viel zu entdecken gibt.' },
};
germanFacts.MUC = germanFacts.M;
