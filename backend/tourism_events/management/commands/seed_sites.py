"""
Management command: seed_sites
Seeds the database with all major tourist sites in Ghana.

Usage:
    python manage.py seed_sites
    python manage.py seed_sites --clear    # wipe existing sites first
"""

from django.core.management.base import BaseCommand
from tourism_events.models import TouristSite

SITES = [
    # ── Greater Accra ────────────────────────────────────────────────────────
    {
        "name": "Labadi Beach (La Pleasure Beach)",
        "location": "La, Accra, Greater Accra Region",
        "description": (
            "Accra's most popular and vibrant beach, stretching over two kilometres of "
            "golden Atlantic coastline. Known for its lively atmosphere, live highlife and "
            "afrobeats music on weekends, horse rides, beach volleyball, and a thriving "
            "food-and-drink scene. One of the best places to experience everyday Ghanaian "
            "beach culture at its most energetic."
        ),
        "is_featured": True,
    },
    {
        "name": "Kwame Nkrumah Mausoleum",
        "location": "High Street, Accra Central, Greater Accra Region",
        "description": (
            "The final resting place of Ghana's founding father and Africa's greatest "
            "pan-Africanist, Dr. Kwame Nkrumah. The memorial park features a striking "
            "fountain, a museum chronicling Ghana's independence struggle, and a reflective "
            "garden. A must-visit for anyone seeking to understand modern Ghana's remarkable "
            "journey from colonialism to freedom on 6 March 1957."
        ),
        "is_featured": True,
    },
    {
        "name": "Accra Arts Centre (Centre for National Culture)",
        "location": "Barnes Road, Accra, Greater Accra Region",
        "description": (
            "A sprawling open-air market and cultural hub in the heart of Accra, housing "
            "hundreds of stalls selling woodcarvings, kente fabric, beads, batik, bronze "
            "figurines, and traditional Ghanaian artefacts. The Centre also hosts live "
            "drumming and dance performances, making it both the best shopping destination "
            "and a living showcase of Ghanaian artisanship."
        ),
        "is_featured": False,
    },
    {
        "name": "Makola Market",
        "location": "Makola, Accra Central, Greater Accra Region",
        "description": (
            "One of West Africa's busiest and most famous open-air markets, Makola is the "
            "commercial heartbeat of Accra. Vendors sell everything from fresh produce, "
            "textiles, electronics and household goods to traditional medicine and street "
            "food. Wandering its labyrinthine alleys is an exhilarating cultural immersion "
            "into the everyday rhythms of Ghanaian city life."
        ),
        "is_featured": False,
    },
    {
        "name": "Independence Arch & Black Star Square",
        "location": "Victoriaborg, Accra, Greater Accra Region",
        "description": (
            "Ghana's most iconic national monument, the Independence Arch stands tall at "
            "the entrance to Black Star Square — the largest public square in West Africa. "
            "Built to commemorate Ghana's independence in 1957, the square has hosted "
            "presidential inaugurations, military parades, and national celebrations. "
            "The inscribed words 'Freedom and Justice — AD 1957' remain one of Africa's "
            "most powerful statements of self-determination."
        ),
        "is_featured": True,
    },

    # ── Central Region ───────────────────────────────────────────────────────
    {
        "name": "Cape Coast Castle",
        "location": "Cape Coast, Central Region",
        "description": (
            "A UNESCO World Heritage Site and one of the most emotionally profound "
            "historical monuments in the world. Built by Swedish traders in 1653 and later "
            "used by the British as the headquarters of the transatlantic slave trade, the "
            "castle's dungeons held tens of thousands of enslaved Africans before they "
            "passed through the 'Door of No Return' onto waiting ships. Today it stands as "
            "a memorial to those who suffered, a testament to resilience, and a "
            "cornerstone of Ghana's heritage tourism."
        ),
        "is_featured": True,
    },
    {
        "name": "Elmina Castle (São Jorge da Mina)",
        "location": "Elmina, Central Region",
        "description": (
            "The oldest European building in sub-Saharan Africa, constructed by the "
            "Portuguese in 1482 and a UNESCO World Heritage Site. Elmina Castle served "
            "successive colonial powers — Portuguese, Dutch, and British — and was the "
            "largest slave-holding site on the West African coast. Its whitewashed walls "
            "and ocean setting belie the harrowing history within; a guided tour through "
            "its dungeons, female slave quarters, and governor's chamber is a deeply "
            "moving and essential experience."
        ),
        "is_featured": True,
    },
    {
        "name": "Kakum National Park",
        "location": "Kakum, Central Region",
        "description": (
            "A magnificent 375 km² of pristine tropical rainforest, home to forest "
            "elephants, bongo antelope, over 400 bird species, and a staggering diversity "
            "of butterflies and primates. The park's famous canopy walkway — suspended up "
            "to 40 metres above the forest floor across seven rope bridges — offers a "
            "breathtaking bird's-eye view of the canopy. Kakum is one of only a handful "
            "of places in Africa where you can experience this kind of high-level forest "
            "walk."
        ),
        "is_featured": True,
    },
    {
        "name": "Assin Manso Slave River",
        "location": "Assin Manso, Central Region",
        "description": (
            "A deeply significant heritage site marking the last point where enslaved "
            "Africans were allowed to bathe and drink water before the forced march to the "
            "coast and the waiting slave ships. The site includes the 'Ancestral Return "
            "Cemetery', where the remains of two enslaved Africans — one from Jamaica and "
            "one from the United States — were repatriated and interred in 1998. A place "
            "of profound reflection and reconciliation."
        ),
        "is_featured": False,
    },
    {
        "name": "Hans Cottage Botel",
        "location": "Cape Coast, Central Region",
        "description": (
            "A uniquely Ghanaian eco-tourism experience — a lakeside lodge built on stilts "
            "above a lagoon teeming with live crocodiles. Visitors can dine on a terrace "
            "directly above the water and observe the crocodiles swimming beneath their "
            "feet, or walk out onto platforms to watch them bask in the sun. The resident "
            "crocodiles are considered sacred by the local community, making this a "
            "fascinating meeting point of wildlife and living tradition."
        ),
        "is_featured": False,
    },

    # ── Ashanti Region ───────────────────────────────────────────────────────
    {
        "name": "Manhyia Palace Museum",
        "location": "Kumasi, Ashanti Region",
        "description": (
            "The official residence of the Asantehene — the King of the Ashanti — and "
            "one of Ghana's most important cultural landmarks. The museum in the original "
            "1925 palace building traces the history of the Ashanti Kingdom through "
            "royal artefacts, photographs, regalia, and detailed accounts of the "
            "Anglo-Ashanti Wars. An audience with the Asantehene's court on special "
            "occasions is among the most memorable experiences in Ghana."
        ),
        "is_featured": True,
    },
    {
        "name": "Kejetia Market (Kumasi Central Market)",
        "location": "Kumasi, Ashanti Region",
        "description": (
            "One of the largest markets in West Africa, covering over 12 hectares and "
            "housing an estimated 10,000 stalls. The market is the trading nerve centre "
            "of Ghana, selling everything from kente cloth, spices, and live animals to "
            "second-hand goods and traditional medicines. Shopping for fresh kente fabric "
            "directly from Ashanti weavers here is an experience unavailable anywhere else."
        ),
        "is_featured": False,
    },
    {
        "name": "Bonwire Kente Weaving Village",
        "location": "Bonwire, Kwabre East District, Ashanti Region",
        "description": (
            "The spiritual home of kente — Ghana's most celebrated and internationally "
            "recognised handwoven textile. Bonwire weavers have been producing kente on "
            "narrow-strip looms for over 400 years, with each pattern carrying specific "
            "Akan proverbs and meanings. Visitors can watch master weavers at work, "
            "learn about the symbolism of different patterns and colours, and purchase "
            "authentic, handmade kente cloth directly from the artisans."
        ),
        "is_featured": True,
    },
    {
        "name": "Lake Bosomtwe",
        "location": "Bosomtwe District, Ashanti Region",
        "description": (
            "Ghana's only natural lake, formed approximately 1.07 million years ago by "
            "a meteorite impact in the Ashanti forest. The lake is considered sacred by "
            "the Ashanti people — who believe the souls of the dead come here to bid "
            "farewell to the god Twi — and traditional fishermen still paddle on it using "
            "wooden planks rather than boats. Surrounded by lush hills and small fishing "
            "villages, it offers swimming, hiking, and a profound sense of peace."
        ),
        "is_featured": True,
    },
    {
        "name": "Kumasi Fort & Military Museum",
        "location": "Kumasi, Ashanti Region",
        "description": (
            "Built by the British in 1897 following the Third Anglo-Ashanti War, Kumasi "
            "Fort is the last surviving British military fort in Ghana. It now houses the "
            "Ghana Armed Forces Museum, with exhibits covering Ghana's military history "
            "from pre-colonial Ashanti warfare through both World Wars to present-day "
            "peacekeeping operations. The fort sits within a well-maintained compound in "
            "the centre of Kumasi city."
        ),
        "is_featured": False,
    },

    # ── Volta Region ─────────────────────────────────────────────────────────
    {
        "name": "Wli Waterfalls",
        "location": "Wli (Agumatsa), Hohoe District, Volta Region",
        "description": (
            "The tallest waterfall in West Africa, cascading 80 metres in two tiers into "
            "a cool, mist-filled basin surrounded by the lush Agumatsa Wildlife Sanctuary. "
            "The lower falls are accessible via a scenic 45-minute hike through butterfly-"
            "filled forest paths and a colony of over 300,000 straw-coloured fruit bats. "
            "The upper falls require a more demanding 3–4 hour trek but reward hikers with "
            "breathtaking views across the forest canopy to Togo."
        ),
        "is_featured": True,
    },
    {
        "name": "Tafi Atome Monkey Sanctuary",
        "location": "Tafi Atome, Hohoe District, Volta Region",
        "description": (
            "A community-managed sacred forest sanctuary that is home to a large troop "
            "of Mona monkeys, considered sacred by the local Ewe community and protected "
            "by a centuries-old taboo against harming them. Visitors can walk through the "
            "forest with a local guide and hand-feed the habituated monkeys, which climb "
            "onto arms and shoulders freely. One of Ghana's most delightful and intimate "
            "wildlife encounters."
        ),
        "is_featured": False,
    },
    {
        "name": "Kpando Torkor (Lake Volta Crossing)",
        "location": "Kpando, Volta Region",
        "description": (
            "Lake Volta — the world's largest man-made lake by surface area — is best "
            "experienced from the town of Kpando, where canoe trips across the glassy "
            "water reveal a haunting landscape of half-submerged trees, remote fishing "
            "villages, and spectacular sunsets. The lake was created in 1965 by the "
            "Akosombo Dam and its vast, mirror-like surface stretches 400 km northward "
            "through the heart of Ghana."
        ),
        "is_featured": False,
    },
    {
        "name": "Mount Afadjato",
        "location": "Liati Wote, Hohoe District, Volta Region",
        "description": (
            "Ghana's highest mountain at 885 metres above sea level, rising dramatically "
            "from the forest on the Ghanaian side of the Akwapim-Togo Ranges. The climb "
            "to the summit takes approximately 90 minutes through a community reserve and "
            "rewards hikers with sweeping panoramic views across the Volta Region, into "
            "neighbouring Togo, and on clear days as far as the ocean. The surrounding "
            "community offers guided hikes, guesthouses, and traditional Ewe hospitality."
        ),
        "is_featured": True,
    },
    {
        "name": "Ada Estuary & Foothills",
        "location": "Ada Foah, Greater Accra / Volta Region border",
        "description": (
            "Where the Volta River meets the Atlantic Ocean at one of Ghana's most "
            "spectacular and tranquil beach destinations. Ada Foah offers a rare "
            "combination of river, ocean, and estuary in one sweeping landscape. "
            "Activities include canoe and motorboat trips through the estuary mangroves, "
            "sandbar walks, kite-surfing on the river, and relaxing at eco-lodges set "
            "along the golden riverbanks. The turtles that nest here between October "
            "and January add another remarkable dimension to any visit."
        ),
        "is_featured": False,
    },

    # ── Northern Region ──────────────────────────────────────────────────────
    {
        "name": "Mole National Park",
        "location": "Mole, West Gonja District, Savannah Region",
        "description": (
            "Ghana's largest and most important wildlife refuge, protecting 4,840 km² "
            "of Guinea savanna woodland and its extraordinary biodiversity. Mole is home "
            "to over 90 mammal species including forest elephants, buffalo, hippopotamus, "
            "warthog, kob, roan antelope, waterbuck, and green and colobus monkeys, as "
            "well as over 300 bird species. The park is famous for its walking safaris — "
            "guided walks that bring visitors within metres of wild elephants — an "
            "experience that is genuinely world-class and almost unique in Africa."
        ),
        "is_featured": True,
    },
    {
        "name": "Larabanga Mosque",
        "location": "Larabanga, West Gonja District, Savannah Region",
        "description": (
            "One of the oldest mosques in West Africa and Ghana's most significant Islamic "
            "heritage site, believed to have been built in 1421 in the distinctive Sudano-"
            "Sahelian architectural style — characterised by its earthen construction, "
            "protruding wooden beams, and conical minarets. Located at the entrance to "
            "Mole National Park, the mosque is considered so sacred that the local "
            "community has for centuries refused all attempts at permanent structural "
            "alteration, insisting instead on annual replastering with earth."
        ),
        "is_featured": False,
    },
    {
        "name": "Paga Crocodile Pond",
        "location": "Paga, Kassena-Nankana West District, Upper East Region",
        "description": (
            "A truly extraordinary cultural and wildlife experience at Ghana's border with "
            "Burkina Faso. The Paga community keeps wild Nile crocodiles in a series of "
            "sacred ponds; these crocodiles are believed to contain the souls of deceased "
            "community members and are therefore completely harmless to humans. Visitors "
            "can sit on, stroke, and photograph the crocodiles under the guidance of a "
            "local chief's representative — an experience as astonishing as any in West "
            "Africa."
        ),
        "is_featured": True,
    },
    {
        "name": "Tongo Hills & Tengzug Shrine",
        "location": "Tongo, Talensi District, Upper East Region",
        "description": (
            "A dramatic landscape of ancient granite outcrops, boulders, and sacred groves "
            "in the Upper East Region, home to the Talensi people and their centuries-old "
            "animist shrine tradition. The Tengzug Shrine — carved into the base of a "
            "massive boulder — is one of the most important and actively used traditional "
            "shrines in Ghana, visited by supplicants from across West Africa. The hike "
            "through the Tongo Hills to the shrine is itself remarkable for its surreal "
            "geological landscape."
        ),
        "is_featured": False,
    },

    # ── Brong-Ahafo / Bono Region ─────────────────────────────────────────
    {
        "name": "Kintampo Waterfalls",
        "location": "Kintampo, Bono East Region",
        "description": (
            "A powerful and beautiful waterfall on the Pumpum River in the geographic "
            "centre of Ghana. The falls cascade 24 metres down a broad rock face into a "
            "clear pool, surrounded by lush forest. A well-maintained path and wooden "
            "platforms allow visitors to view the falls from multiple angles. The site "
            "also includes natural cave formations in the rock, locally known as the "
            "'Fuller Falls', named after a former colonial administrator."
        ),
        "is_featured": False,
    },
    {
        "name": "Bui National Park",
        "location": "Bui, Bono Region",
        "description": (
            "A wilderness reserve centred on a dramatic gorge on the Black Volta River, "
            "protecting one of the last remaining viable populations of black-and-white "
            "colobus monkeys in Ghana. The park is also home to hippos, baboons, antelopes, "
            "green monkeys, and crocodiles. While less visited than Mole, Bui offers a "
            "more remote and intimate wilderness experience, with boat trips on the Black "
            "Volta offering excellent hippo and crocodile sightings."
        ),
        "is_featured": False,
    },

    # ── Eastern Region ───────────────────────────────────────────────────────
    {
        "name": "Aburi Botanical Gardens",
        "location": "Aburi, Akuapem North District, Eastern Region",
        "description": (
            "Established in 1890 in the cool highlands of the Akuapem Ridge, 30 km north "
            "of Accra, the Aburi Botanical Gardens is one of West Africa's oldest and most "
            "beautiful colonial-era gardens. Set at an elevation of 450 metres, the gardens "
            "offer a refreshing escape from Accra's heat, with avenues of towering silk "
            "cotton trees, tropical plants, a fernery, and a charming canopy walkway. A "
            "beloved weekend retreat for Accra residents for over a century."
        ),
        "is_featured": True,
    },
    {
        "name": "Boti Falls",
        "location": "Boti, Yilo Krobo District, Eastern Region",
        "description": (
            "Twin waterfalls — a male and a female fall — plunging side by side into a "
            "shared pool in a beautiful forest reserve in the Eastern Region. According to "
            "local Krobo tradition, the two falls join at their base during the rainy season "
            "as a symbol of marriage. The surrounding forest is rich with butterflies, birds, "
            "and an umbrella rock formation that shelters several hundred people. A short "
            "hike from the car park makes this a very accessible yet rewarding natural "
            "attraction."
        ),
        "is_featured": False,
    },
    {
        "name": "Akosombo Dam",
        "location": "Akosombo, Asuogyaman District, Eastern Region",
        "description": (
            "One of Africa's great engineering achievements, the Akosombo Dam was "
            "completed in 1965 under President Kwame Nkrumah and created Lake Volta — "
            "the world's largest artificial lake by surface area at 8,502 km². The dam "
            "still generates a substantial portion of Ghana's electricity. Guided tours "
            "of the dam structure offer fascinating insight into this feat of mid-century "
            "African infrastructure, with spectacular views of the Volta River gorge and "
            "the lake stretching north to the horizon."
        ),
        "is_featured": False,
    },

    # ── Western Region ───────────────────────────────────────────────────────
    {
        "name": "Busua Beach",
        "location": "Busua, Ahanta West District, Western Region",
        "description": (
            "One of Ghana's finest and most picturesque beaches — a sweeping arc of "
            "golden sand backed by palm trees and rolling hills, with warm, clear surf "
            "that makes it the best surfing spot in Ghana. Busua has developed a small "
            "but excellent collection of beachfront guesthouses, restaurants, and surf "
            "schools while retaining the relaxed, unhurried atmosphere of a genuine "
            "Ghanaian fishing village. The nearby Butre estuary adds a scenic river "
            "dimension to the experience."
        ),
        "is_featured": True,
    },
    {
        "name": "Fort Metal Cross (Dixcove Fort)",
        "location": "Dixcove, Ahanta West District, Western Region",
        "description": (
            "A well-preserved British fort perched dramatically on a promontory above the "
            "fishing village of Dixcove, offering stunning views along the Western Region "
            "coastline. Built in 1691, the fort is far less visited than Cape Coast or "
            "Elmina but arguably more atmospheric — its crumbling battlements, cannon "
            "emplacements, and intimate scale make it feel genuinely ancient. The village "
            "of Dixcove below is one of the most photogenic and authentic fishing "
            "communities on the entire Ghanaian coast."
        ),
        "is_featured": False,
    },
    {
        "name": "Ankasa Conservation Area",
        "location": "Ankasa, Jomoro District, Western Region",
        "description": (
            "Ghana's only tract of virgin, undisturbed lowland rainforest — a 509 km² "
            "conservation area of extraordinary biodiversity on the border with Côte "
            "d'Ivoire. Ankasa protects Ghana's only remaining population of pygmy hippos, "
            "as well as forest elephants, leopards, bongo, Diana monkeys, chimpanzees, and "
            "over 600 butterfly species. The forest receives very few visitors, making it "
            "one of West Africa's true wilderness experiences for serious nature travellers."
        ),
        "is_featured": False,
    },

    # ── Upper West Region ────────────────────────────────────────────────────
    {
        "name": "Nkoranza – Slave River (Nakore)",
        "location": "Gwollu, Sissala East District, Upper West Region",
        "description": (
            "The historic Gwollu Defence Wall — a network of dry-stone defensive "
            "fortifications built by the Sissala people in the 18th and 19th centuries "
            "to protect their communities from slave raiders. Parts of the wall still "
            "stand up to two metres high and stretch for several kilometres. The site "
            "offers a compelling and little-known perspective on the human geography of "
            "the slave trade far from the coast, and is maintained as a heritage site "
            "by the local community."
        ),
        "is_featured": False,
    },
    {
        "name": "Wa Naa's Palace",
        "location": "Wa, Upper West Region",
        "description": (
            "The traditional palace of the Wa Naa — the paramount chief of the Wala "
            "people — in the capital of Ghana's Upper West Region. The palace is a "
            "beautiful example of Sahelian vernacular architecture, constructed from "
            "banco (mud and straw) with conical turrets and intricate decorative motifs. "
            "Visitors may request an audience with the palace staff and explore the "
            "grounds, which include a mosque and ancestral shrine dating to the palace's "
            "founding in the 17th century."
        ),
        "is_featured": False,
    },
]


class Command(BaseCommand):
    help = "Seed the database with all major tourist sites in Ghana"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing TouristSite records before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count, _ = TouristSite.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing site(s)."))

        created = 0
        skipped = 0

        for data in SITES:
            obj, was_created = TouristSite.objects.get_or_create(
                name=data["name"],
                defaults={
                    "location":    data["location"],
                    "description": data["description"],
                    "is_featured": data["is_featured"],
                },
            )
            if was_created:
                created += 1
                self.stdout.write(f"  ✓ Created: {obj.name}")
            else:
                skipped += 1
                self.stdout.write(self.style.WARNING(f"  – Skipped (exists): {obj.name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created} site(s) created, {skipped} already existed."
            )
        )
