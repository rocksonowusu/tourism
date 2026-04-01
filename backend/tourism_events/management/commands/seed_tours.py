"""
Management command: seed_tours
Seeds the database with two sample Ghana tour packages.

Usage:
    python manage.py seed_tours
    python manage.py seed_tours --clear    # wipe existing tours first
"""

from django.core.management.base import BaseCommand

from tourism_events.models import Tour


TOURS = [
    {
        "title": "Cape Coast & Elmina Heritage Trail",
        "description": (
            "Embark on a powerful two-day journey through Ghana's most significant "
            "historical landmarks along the Cape Coast. Visit the haunting Cape Coast "
            "Castle — a UNESCO World Heritage Site — and walk through the 'Door of No "
            "Return' where millions of enslaved Africans were shipped across the Atlantic. "
            "Continue to the Elmina Castle, the oldest European building in sub-Saharan "
            "Africa, and explore the vibrant Elmina fishing harbour. The tour also "
            "includes a serene canopy walk at Kakum National Park, rising 30 metres "
            "above the rainforest floor, and a visit to the Hans Cottage Botel — a unique "
            "lakeside lodge surrounded by crocodiles. End each day with authentic Fante "
            "cuisine and storytelling by local guides."
        ),
        "location": "Cape Coast, Central Region",
        "duration": "2 days / 1 night",
        "max_group_size": 15,
        "is_active": True,
        "is_featured": True,
        "highlights": [
            "Guided tour of Cape Coast Castle (UNESCO World Heritage Site)",
            "Visit the 'Door of No Return'",
            "Elmina Castle & fishing harbour walk",
            "Kakum National Park canopy walkway",
            "Hans Cottage Botel crocodile sanctuary",
            "Traditional Fante dinner with storytelling",
        ],
        "inclusions": [
            "Air-conditioned transport from Accra",
            "Professional English-speaking guide",
            "1 night hotel accommodation (3-star)",
            "Breakfast & dinner",
            "All entrance / admission fees",
            "Bottled water throughout",
        ],
        "exclusions": [
            "Lunch on Day 1",
            "Personal souvenirs & shopping",
            "Travel insurance",
            "Tips / gratuities",
        ],
        "itinerary": [
            {
                "day": 1,
                "title": "Accra → Cape Coast → Elmina",
                "description": (
                    "Early morning pick-up from your Accra hotel. Drive along the scenic "
                    "coastal highway to Cape Coast (approx. 3 hrs). Tour the Cape Coast "
                    "Castle with a certified heritage guide. After lunch (own expense), "
                    "continue to Elmina Castle and explore the colourful fishing harbour. "
                    "Check in to hotel, followed by a traditional Fante dinner."
                ),
            },
            {
                "day": 2,
                "title": "Kakum National Park → Accra",
                "description": (
                    "Breakfast at hotel. Head to Kakum National Park for the thrilling "
                    "canopy walkway experience — seven rope-and-plank bridges suspended "
                    "30 m above the forest floor. Stop at Hans Cottage Botel to see the "
                    "resident crocodiles and enjoy the lakeside atmosphere. Begin the "
                    "return drive to Accra, arriving by late afternoon."
                ),
            },
        ],
    },
    {
        "title": "Accra City & Culture Experience",
        "description": (
            "Discover the vibrant soul of Ghana's capital in this immersive full-day "
            "tour through Accra's most iconic neighbourhoods and cultural landmarks. "
            "Start at the W.E.B. Du Bois Memorial Centre and Kwame Nkrumah Memorial "
            "Park — resting place of Ghana's founding father. Dive into the buzzing "
            "Makola Market, one of West Africa's largest open-air markets, then head to "
            "the creative district of Osu for art galleries, street food, and boutique "
            "shopping. The afternoon takes you to the Jamestown lighthouse and the "
            "historic fishing community of Ga Mashie, where you'll witness traditional "
            "boxing culture and taste fresh kenkey by the shore. The tour wraps up with "
            "a sunset dinner at a rooftop restaurant overlooking the city skyline."
        ),
        "location": "Accra, Greater Accra Region",
        "duration": "Full day (8 hours)",
        "max_group_size": 20,
        "is_active": True,
        "is_featured": True,
        "highlights": [
            "Kwame Nkrumah Memorial Park & Mausoleum",
            "W.E.B. Du Bois Memorial Centre",
            "Makola Market guided walkthrough",
            "Osu art galleries & street food",
            "Jamestown lighthouse & Ga Mashie fishing village",
            "Rooftop sunset dinner with city views",
        ],
        "inclusions": [
            "Hotel pick-up & drop-off within Accra",
            "Air-conditioned minivan",
            "Professional English-speaking guide",
            "Street food tasting (kelewele, waakye, kenkey)",
            "Rooftop dinner (set menu)",
            "All entrance / admission fees",
            "Bottled water throughout",
        ],
        "exclusions": [
            "Alcoholic beverages",
            "Personal shopping",
            "Travel insurance",
            "Tips / gratuities",
        ],
        "itinerary": [
            {
                "day": 1,
                "title": "Full-Day Accra Immersion",
                "description": (
                    "8:00 AM — Hotel pick-up. Visit Kwame Nkrumah Memorial Park and the "
                    "W.E.B. Du Bois Centre. 10:30 AM — Guided walk through Makola Market. "
                    "12:30 PM — Street food tasting in Osu, followed by art gallery visits. "
                    "2:30 PM — Drive to Jamestown, climb the lighthouse for panoramic "
                    "views, and explore Ga Mashie. 5:00 PM — Rooftop dinner with sunset "
                    "views. 7:00 PM — Drop-off at hotel."
                ),
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with two sample Ghana tour packages."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing tours before seeding.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count, _ = Tour.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing tour record(s)."))

        created = 0
        for data in TOURS:
            title = data["title"]
            if Tour.objects.filter(title=title).exists():
                self.stdout.write(self.style.NOTICE(f"  ⏭  Skipped (already exists): {title}"))
                continue

            Tour.objects.create(**data)
            created += 1
            self.stdout.write(self.style.SUCCESS(f"  ✅ Created: {title}"))

        self.stdout.write(self.style.SUCCESS(f"\nDone — {created} tour(s) seeded."))
