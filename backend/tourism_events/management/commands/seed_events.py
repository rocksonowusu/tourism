"""
Management command: seed_events
Seeds the database with popular Ghanaian events at varied dates
so every season_label is represented:
  • happening-now, almost-here, coming-soon, mark-calendar, on-the-horizon
  • just-missed, recently-ended, throwback

Usage:
    python manage.py seed_events
    python manage.py seed_events --clear    # wipe existing events first
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from tourism_events.models import Event, TouristSite


def _offset(days):
    """Return a timezone-aware datetime `days` from now (negative = past)."""
    return timezone.now().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=days)


EVENTS = [
    # ── UPCOMING: on-the-horizon (90+ days) ──────────────────────────────
    {
        "title": "Afrochella (Afro Future)",
        "location": "El-Wak Sports Stadium, Accra, Greater Accra Region",
        "description": (
            "Held every December during Ghana's 'Detty December' season, Afrochella "
            "(rebranded as Afro Future) is a massive Afrobeats and culture festival that "
            "attracts thousands of visitors from the African diaspora. The event features "
            "headline performances from top Afrobeats, amapiano, and highlife artists, "
            "alongside a curated marketplace showcasing African fashion designers, visual "
            "artists, food vendors, and lifestyle brands. It has quickly become the "
            "centrepiece of December nightlife in Accra."
        ),
        "price": Decimal("150.00"),
        "is_featured": True,
        "days_from_now": 250,
        "site_name": None,
        "latitude": Decimal("5.5955"),
        "longitude": Decimal("-0.1870"),
        "highlights": [
            "VIP & General admission tickets",
            "Live performances by top Afrobeats artists",
            "Curated African fashion marketplace",
            "Complimentary welcome drink",
            "Professional photography zones",
            "Shuttle service from Accra city centre",
        ],
    },
    # ── UPCOMING: mark-calendar (15-60 days) ─────────────────────────────
    {
        "title": "Chale Wote Street Art Festival",
        "location": "Jamestown, Accra, Greater Accra Region",
        "description": (
            "One of Africa's most vibrant and internationally acclaimed street art "
            "festivals, Chale Wote transforms the historic Jamestown neighbourhood into "
            "an open-air gallery every August. The festival features live murals, "
            "graffiti, body painting, interactive installations, live music, spoken word, "
            "street performances, fashion shows, and film screenings. Founded in 2011 by "
            "the [ACCRA dot ALT] collective, it celebrates urban Ghanaian culture and has "
            "become a magnet for artists and creatives from across the continent and beyond."
        ),
        "price": Decimal("0.00"),
        "is_featured": True,
        "days_from_now": 35,
        "site_name": None,
        "latitude": Decimal("5.5325"),
        "longitude": Decimal("-0.2127"),
        "highlights": [
            "Free admission to all street installations",
            "Guided walking tour of Jamestown",
            "Live mural painting workshops",
            "Local street food tasting (waakye, kelewele)",
            "Spoken word & poetry sessions",
            "Body painting & face painting experience",
        ],
    },
    # ── UPCOMING: coming-soon (4-14 days) ────────────────────────────────
    {
        "title": "Homowo Festival",
        "location": "Accra, Greater Accra Region",
        "description": (
            "Homowo — meaning 'hooting at hunger' — is the most important traditional "
            "festival of the Ga people of Accra. Celebrated annually between August and "
            "September, it marks the end of a prolonged famine experienced by the Ga "
            "ancestors during their migration. Festivities include a ban on drumming and "
            "noise-making for several weeks, the ritual sprinkling of kpokpoi (a "
            "traditional corn dish) across the streets, Kpashimo traditional dancing, "
            "and colourful processions led by the Ga Mantse (paramount chief). It is a "
            "profound window into Ga spiritual and cultural identity."
        ),
        "price": Decimal("0.00"),
        "is_featured": True,
        "days_from_now": 10,
        "site_name": None,
        "latitude": Decimal("5.6037"),
        "longitude": Decimal("-0.1870"),
        "highlights": [
            "Cultural guide explaining Ga traditions",
            "Taste authentic kpokpoi (traditional corn dish)",
            "Watch the Kpashimo dance procession",
            "Meeting with local Ga elders",
            "Traditional Ga outfit for photo opportunities",
            "Souvenir Ga beaded bracelet",
        ],
    },
    # ── UPCOMING: almost-here (1-3 days) ─────────────────────────────────
    {
        "title": "Panafest – Pan-African Theatre Festival",
        "location": "Cape Coast Castle, Cape Coast, Central Region",
        "description": (
            "Panafest is a biennial cultural event held in Cape Coast that brings together "
            "people of African descent from around the world. Centred on the historic Cape "
            "Coast and Elmina slave castles, the festival features dramatic performances, "
            "poetry readings, music, art exhibitions, and durbar of chiefs. Its mission is "
            "to promote Pan-African unity and provide a space for healing, remembrance, and "
            "celebration of African heritage. The festival culminates with a solemn 'Night "
            "of Remembrance' vigil at Cape Coast Castle's slave dungeons."
        ),
        "price": Decimal("25.00"),
        "is_featured": True,
        "days_from_now": 2,
        "site_name": "Cape Coast Castle",
        "latitude": Decimal("5.1053"),
        "longitude": Decimal("-1.2413"),
        "highlights": [
            "Guided tour of Cape Coast Castle & dungeons",
            "Reserved seating for theatre performances",
            "Return transport from Accra (air-conditioned coach)",
            "Lunch at a local Cape Coast restaurant",
            "Night of Remembrance vigil candle",
            "Official Panafest souvenir programme",
        ],
    },
    # ── PAST: just-missed (1-3 days ago) ─────────────────────────────────
    {
        "title": "Hogbetsotso Festival",
        "location": "Anloga, Volta Region",
        "description": (
            "The Hogbetsotso ('Festival of the Exodus') is the grandest festival of the "
            "Anlo Ewe people, celebrated on the first Saturday of November in Anloga, the "
            "traditional capital of the Anlo state. It commemorates the escape of the Ewe "
            "people from the tyrannical King Agorkorli of Notsie (in present-day Togo). "
            "Highlights include the spectacular Borborbor and Agbadza dances, a durbar of "
            "chiefs in full regalia, libation pouring to ancestors, and the dramatic "
            "re-enactment of the legendary exodus. It is one of Ghana's most visually "
            "stunning and culturally significant celebrations."
        ),
        "price": Decimal("0.00"),
        "is_featured": False,
        "days_from_now": -2,
        "site_name": None,
        "latitude": Decimal("5.7939"),
        "longitude": Decimal("0.8940"),
        "highlights": [
            "Transport to Anloga from Accra or Ho",
            "Borborbor & Agbadza dance performances",
            "Durbar of chiefs in full regalia",
            "Traditional Ewe meal",
            "Cultural storytelling session",
            "Commemorative festival cloth",
        ],
    },
    # ── PAST: recently-ended (4-30 days ago) ─────────────────────────────
    {
        "title": "Ghana Food Festival",
        "location": "Accra Mall Grounds, Accra, Greater Accra Region",
        "description": (
            "A celebration of Ghana's incredible culinary diversity, bringing together "
            "food lovers, chefs, and vendors from every region. The festival features "
            "jollof rice cook-offs, kelewele tastings, waakye competitions, live cooking "
            "demos by top Ghanaian chefs, and cultural performances. It's a delicious "
            "window into the rich food heritage of Ghana — from coastal seafood to "
            "northern shea-butter dishes."
        ),
        "price": Decimal("10.00"),
        "is_featured": False,
        "days_from_now": -18,
        "site_name": None,
        "latitude": Decimal("5.6220"),
        "longitude": Decimal("-0.1726"),
        "highlights": [
            "All-you-can-taste food pass",
            "Jollof rice cook-off participation",
            "Live cooking demo with top Ghanaian chef",
            "Recipe booklet to take home",
            "Complimentary sobolo (hibiscus) drink",
            "Food festival branded tote bag",
        ],
    },
    # ── PAST: throwback (30+ days ago) ───────────────────────────────────
    {
        "title": "Kundum Festival",
        "location": "Axim, Western Region",
        "description": (
            "The Kundum festival is celebrated by the Nzema and Ahanta people of the "
            "Western Region to mark the harvest season and to drive away evil spirits. "
            "Running for several weeks, it features elaborate masquerade dances, communal "
            "feasting, drumming, and purification rituals. The festival is one of the "
            "oldest harvest celebrations in Ghana and a spectacular display of Western "
            "Region culture and traditions."
        ),
        "price": Decimal("0.00"),
        "is_featured": False,
        "days_from_now": -65,
        "site_name": None,
        "latitude": Decimal("4.8695"),
        "longitude": Decimal("-2.2400"),
        "highlights": [
            "Round-trip transport from Takoradi",
            "Masquerade dance viewing area",
            "Traditional Nzema feast",
            "Guided village heritage walk",
            "Purification ritual observation",
            "Handcrafted Nzema souvenir",
        ],
    },
    # ── UPCOMING: on-the-horizon (60+ days) ──────────────────────────────
    {
        "title": "Kente Festival",
        "location": "Bonwire, Ashanti Region",
        "description": (
            "A vibrant celebration of Ghana's world-famous hand-woven Kente cloth in "
            "Bonwire, the ancestral home of Kente weaving. Watch master weavers at work, "
            "participate in weaving workshops, enjoy traditional Ashanti drumming and "
            "dancing, and take home an authentic piece of Ghanaian heritage. The festival "
            "draws weavers, designers, and textile enthusiasts from around the globe."
        ),
        "price": Decimal("0.00"),
        "is_featured": True,
        "days_from_now": 75,
        "site_name": None,
        "latitude": Decimal("6.7725"),
        "longitude": Decimal("-1.5410"),
        "highlights": [
            "Hands-on Kente weaving workshop",
            "Tour of master weavers' looms",
            "Traditional Ashanti drumming performance",
            "Authentic Kente strip to take home",
            "Guided tour of Bonwire village",
            "Local Ashanti lunch (fufu & light soup)",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with popular Ghanaian events (mixed past & future dates)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete ALL existing events before seeding.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count, _ = Event.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"🗑  Deleted {count} existing event(s)."))

        created = 0
        skipped = 0

        for entry in EVENTS:
            title = entry["title"]

            if Event.objects.filter(title=title).exists():
                self.stdout.write(f"  ⏭  {title} (already exists)")
                skipped += 1
                continue

            # Try to link to an existing tourist site
            site = None
            if entry.get("site_name"):
                site = TouristSite.objects.filter(name__icontains=entry["site_name"]).first()
                if site:
                    self.stdout.write(f"  🔗 Linked to site: {site.name}")

            Event.objects.create(
                title=title,
                location=entry["location"],
                description=entry["description"],
                date=_offset(entry["days_from_now"]),
                price=entry["price"],
                is_featured=entry["is_featured"],
                latitude=entry.get("latitude"),
                longitude=entry.get("longitude"),
                highlights=entry.get("highlights", []),
                tourist_site=site,
            )
            self.stdout.write(self.style.SUCCESS(f"  ✅ {title}"))
            created += 1

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Done! Created {created}, skipped {skipped}.")
        )
