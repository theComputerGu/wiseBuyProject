"""
Generate improved training data for WiseBuy ML recommendation engine.
Creates realistic shopping patterns with logical product bundles.
OVERWRITES existing training data with better quality data.
"""

import json
import random
import sys
import io
from datetime import datetime, timedelta
from bson import ObjectId

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load products
with open(r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data\wisebuy.productsLast.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Organize products by category and build search index
categories = {}
products_by_id = {}
products_by_keyword = {}

for p in products:
    cat = p.get('category') or 'אחר'
    pid = p['_id']['$oid']
    title = p.get('title', '').lower()

    if cat not in categories:
        categories[cat] = []
    categories[cat].append(pid)
    products_by_id[pid] = p

    # Index by keywords
    for word in title.split():
        if len(word) > 2:
            if word not in products_by_keyword:
                products_by_keyword[word] = []
            products_by_keyword[word].append(pid)

print(f"Loaded {len(products)} products in {len(categories)} categories")

# Define REALISTIC shopping bundles - products that actually go together
SHOPPING_BUNDLES = [
    # Breakfast bundle
    {
        'name': 'ארוחת בוקר',
        'items': [
            ('מוצרי קירור וביצים', ['חלב', 'יוגורט', 'גבינה', 'ביצים', 'חמאה', 'קוטג', 'שמנת']),
            ('לחמים ומאפים', ['לחם', 'פיתה', 'מאפה', 'באגט', 'חלה', 'קרואסון']),
            ('משקאות ויין', ['קפה', 'תה', 'מיץ', 'חלב']),
            ('חטיפים וממתקים', ['דגני', 'קורנפלקס', 'גרנולה']),
        ],
    },
    # Meat dinner
    {
        'name': 'ארוחת ערב בשרית',
        'items': [
            ('עוף בשר ודגים', ['עוף', 'חזה', 'שוק', 'כרעיים', 'שניצל', 'קציצות', 'בקר', 'טחון']),
            ('ירקות ופירות', ['בצל', 'שום', 'עגבני', 'תפוח', 'גזר', 'פלפל', 'מלפפון']),
            ('שימורים', ['רוטב', 'עגבניות', 'תבלין', 'שמן', 'זית']),
            ('לחמים ומאפים', ['לחם', 'פיתה', 'אורז']),
        ],
    },
    # Fish dinner
    {
        'name': 'ארוחת דגים',
        'items': [
            ('עוף בשר ודגים', ['דג', 'סלמון', 'אמנון', 'טונה', 'פילה']),
            ('ירקות ופירות', ['לימון', 'ירק', 'עגבני', 'בצל']),
            ('שימורים', ['שמן', 'זית', 'תבלין']),
        ],
    },
    # Salad lunch
    {
        'name': 'ארוחת צהריים קלה',
        'items': [
            ('ירקות ופירות', ['חסה', 'מלפפון', 'עגבני', 'גזר', 'אבוקדו', 'פלפל']),
            ('מעדנייה וסלטים', ['סלט', 'חומוס', 'טחינה', 'ממרח']),
            ('לחמים ומאפים', ['לחם', 'פיתה', 'טורטיה']),
            ('מוצרי קירור וביצים', ['גבינה', 'טופו', 'פטה']),
        ],
    },
    # Snack time
    {
        'name': 'חטיפים ונשנושים',
        'items': [
            ('חטיפים וממתקים', ['ביסלי', 'במבה', 'שוקולד', 'עוגיות', 'אגוז', 'צ\'יפס', 'קרקר']),
            ('משקאות ויין', ['קולה', 'ספרייט', 'פנטה', 'מים', 'בירה', 'אנרגיה']),
        ],
    },
    # Baby essentials
    {
        'name': 'מוצרי תינוקות',
        'items': [
            ('פארם ותינוקות', ['חיתול', 'מגבון', 'תינוק', 'סימילק', 'מטרנה', 'נוטרילון']),
            ('מוצרי קירור וביצים', ['חלב', 'יוגורט', 'מעדן']),
        ],
    },
    # Cleaning day
    {
        'name': 'יום ניקיון',
        'items': [
            ('הכל לבית', ['סבון', 'אקונומיקה', 'נייר', 'שקית', 'ניקוי', 'מרכך', 'כלים', 'אבקה', 'מטליות']),
        ],
    },
    # Shabbat prep
    {
        'name': 'הכנה לשבת',
        'items': [
            ('עוף בשר ודגים', ['עוף', 'בקר', 'דג']),
            ('ירקות ופירות', ['תפוח', 'ירק', 'בצל', 'גזר']),
            ('לחמים ומאפים', ['חלה', 'לחם']),
            ('משקאות ויין', ['יין', 'מיץ', 'ענבים']),
            ('מעדנייה וסלטים', ['סלט', 'חומוס', 'טחינה']),
            ('מוצרי קירור וביצים', ['גבינה', 'שמנת']),
        ],
    },
    # Pasta night
    {
        'name': 'ערב פסטה',
        'items': [
            ('שימורים', ['פסטה', 'ספגטי', 'רוטב', 'עגבניות', 'פנה', 'רביולי']),
            ('מוצרי קירור וביצים', ['גבינה', 'שמנת', 'פרמזן', 'מוצרלה']),
            ('ירקות ופירות', ['שום', 'בצל', 'בזיליקום', 'עגבני']),
        ],
    },
    # Baking
    {
        'name': 'אפייה ביתית',
        'items': [
            ('אחר', ['קמח', 'סוכר', 'שמרים', 'אבקה', 'קקאו', 'וניל']),
            ('מוצרי קירור וביצים', ['ביצים', 'חמאה', 'שמנת', 'חלב']),
            ('חטיפים וממתקים', ['שוקולד', 'צימוקים', 'אגוזים']),
        ],
    },
]

# Define user personas
PERSONAS = [
    {
        'name': 'משפחה דתית גדולה',
        'bundles': ['הכנה לשבת', 'ארוחת בוקר', 'ארוחת ערב בשרית', 'יום ניקיון'],
        'shopping_days': [3, 4],  # Wednesday, Thursday
        'items_per_list': (15, 25),
        'lists_per_month': 4,
        'regularity': 0.7,  # How often they buy the same products
    },
    {
        'name': 'משפחה עם תינוק',
        'bundles': ['מוצרי תינוקות', 'ארוחת בוקר', 'יום ניקיון', 'ארוחת צהריים קלה'],
        'shopping_days': None,  # Any day
        'items_per_list': (12, 20),
        'lists_per_month': 5,
        'regularity': 0.8,
    },
    {
        'name': 'זוג צעיר',
        'bundles': ['ערב פסטה', 'ארוחת צהריים קלה', 'חטיפים ונשנושים', 'ארוחת דגים'],
        'shopping_days': None,
        'items_per_list': (8, 14),
        'lists_per_month': 5,
        'regularity': 0.5,
    },
    {
        'name': 'סטודנט',
        'bundles': ['חטיפים ונשנושים', 'ארוחת צהריים קלה', 'ערב פסטה'],
        'shopping_days': None,
        'items_per_list': (5, 10),
        'lists_per_month': 6,
        'regularity': 0.6,
    },
    {
        'name': 'משפחה ממוצעת',
        'bundles': ['ארוחת בוקר', 'ארוחת ערב בשרית', 'ארוחת צהריים קלה', 'יום ניקיון'],
        'shopping_days': [4, 5],  # Thursday, Friday
        'items_per_list': (12, 18),
        'lists_per_month': 4,
        'regularity': 0.65,
    },
    {
        'name': 'טבעוני בריאותי',
        'bundles': ['ארוחת צהריים קלה', 'ארוחת בוקר'],
        'shopping_days': None,
        'items_per_list': (8, 14),
        'lists_per_month': 5,
        'regularity': 0.6,
        'avoid_categories': ['עוף בשר ודגים'],
    },
    {
        'name': 'קשיש לבד',
        'bundles': ['ארוחת בוקר', 'ארוחת דגים', 'יום ניקיון'],
        'shopping_days': [0, 3],  # Sunday, Wednesday
        'items_per_list': (6, 10),
        'lists_per_month': 4,
        'regularity': 0.85,  # Very regular shopping
    },
    {
        'name': 'אמא אופה',
        'bundles': ['אפייה ביתית', 'ארוחת בוקר', 'הכנה לשבת'],
        'shopping_days': [2, 3],  # Tuesday, Wednesday
        'items_per_list': (10, 16),
        'lists_per_month': 4,
        'regularity': 0.7,
    },
]


def find_products_by_keywords(category, keywords, count=3):
    """Find products in a category matching any of the keywords"""
    if category not in categories:
        return []

    matches = []
    cat_products = categories[category]

    for pid in cat_products:
        product = products_by_id.get(pid, {})
        title = product.get('title', '').lower()

        for keyword in keywords:
            if keyword in title:
                matches.append(pid)
                break

    random.shuffle(matches)

    # If not enough matches, add random from category
    if len(matches) < count:
        remaining = [p for p in cat_products if p not in matches]
        random.shuffle(remaining)
        matches.extend(remaining[:count - len(matches)])

    return matches[:count]


def generate_shopping_list_from_bundles(bundle_names, avoid_categories=None):
    """Generate a shopping list from one or more bundles"""
    items = []
    avoid = avoid_categories or []

    for bundle_name in bundle_names:
        bundle = next((b for b in SHOPPING_BUNDLES if b['name'] == bundle_name), None)
        if not bundle:
            continue

        for cat, keywords in bundle['items']:
            if cat in avoid:
                continue
            if cat not in categories:
                continue

            # Find 1-3 products from this category
            count = random.randint(1, 3)
            found = find_products_by_keywords(cat, keywords, count)

            for pid in found:
                if pid not in items:
                    items.append(pid)

    return items


def generate_oid():
    return str(ObjectId())


# Generate training data
NUM_USERS = 50
MONTHS_OF_HISTORY = 6

users = []
groups = []
shopping_lists = []

start_date = datetime.now() - timedelta(days=MONTHS_OF_HISTORY * 30)

print(f"\nGenerating {NUM_USERS} users over {MONTHS_OF_HISTORY} months...")

for i in range(NUM_USERS):
    persona = random.choice(PERSONAS)

    user_id = generate_oid()
    group_id = generate_oid()

    user = {
        '_id': {'$oid': user_id},
        'name': f'user{i + 1}',
        'email': f'user{i + 1}@wisebuy.test',
        'password': '$2b$10$placeholder',
        'groups': [{'$oid': group_id}],
        'activeGroup': {'$oid': group_id},
        'createdAt': {'$date': start_date.isoformat() + 'Z'},
        'updatedAt': {'$date': datetime.now().isoformat() + 'Z'},
    }
    users.append(user)

    history = []
    current_date = start_date
    avoid_cats = persona.get('avoid_categories', [])
    regularity = persona.get('regularity', 0.6)

    # Build favorite products for this user
    favorite_products = generate_shopping_list_from_bundles(persona['bundles'], avoid_cats)
    favorite_products = list(set(favorite_products))[:25]

    purchase_count = 0

    while current_date < datetime.now() - timedelta(days=2):
        # Check shopping day
        if persona['shopping_days'] and current_date.weekday() not in persona['shopping_days']:
            current_date += timedelta(days=1)
            continue

        list_id = generate_oid()

        min_items, max_items = persona['items_per_list']
        target_items = random.randint(min_items, max_items)

        items = []

        # Pick 1-2 bundles for this trip
        trip_bundles = random.sample(persona['bundles'], min(random.randint(1, 2), len(persona['bundles'])))
        bundle_items = generate_shopping_list_from_bundles(trip_bundles, avoid_cats)

        for pid in bundle_items:
            if len(items) < target_items and pid not in items:
                items.append(pid)

        # Add favorites based on regularity
        for fav in favorite_products:
            if random.random() < regularity and len(items) < target_items:
                if fav not in items:
                    items.append(fav)

        # Fill remaining with random from bundle categories
        while len(items) < target_items:
            bundle = next((b for b in SHOPPING_BUNDLES if b['name'] in persona['bundles']), None)
            if bundle:
                cat, keywords = random.choice(bundle['items'])
                if cat in categories and cat not in avoid_cats:
                    pid = random.choice(categories[cat])
                    if pid not in items:
                        items.append(pid)
            else:
                break

        if items:
            shopping_list = {
                '_id': {'$oid': list_id},
                'items': [{'_id': {'$oid': pid}, 'quantity': random.randint(1, 3)} for pid in items],
                'total': sum(random.randint(8, 45) for _ in items),
                'createdAt': {'$date': current_date.isoformat() + 'Z'},
                'updatedAt': {'$date': current_date.isoformat() + 'Z'},
            }
            shopping_lists.append(shopping_list)

            history.append({
                'name': f'קניות {current_date.strftime("%d/%m")}',
                'shoppingListId': {'$oid': list_id},
                'purchasedAt': {'$date': current_date.isoformat() + 'Z'},
                'storename': random.choice(['רמי לוי', 'שופרסל', 'יוחננוף', 'ויקטורי', 'מגה', 'חצי חינם', 'יינות ביתן']),
                'storeadress': random.choice(['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'רמת גן', 'פתח תקווה', 'ראשון לציון', 'נתניה', 'אשדוד']),
                'totalprice': shopping_list['total'],
                'itemcount': len(items),
            })
            purchase_count += 1

        # Next shopping trip
        days_between = 30 // persona['lists_per_month']
        current_date += timedelta(days=random.randint(max(3, days_between - 3), days_between + 4))

    # Create active cart
    active_list_id = generate_oid()
    trip_bundles = random.sample(persona['bundles'], min(random.randint(1, 2), len(persona['bundles'])))
    active_items = generate_shopping_list_from_bundles(trip_bundles, avoid_cats)[:random.randint(3, 7)]

    active_list = {
        '_id': {'$oid': active_list_id},
        'items': [{'_id': {'$oid': pid}, 'quantity': random.randint(1, 2)} for pid in active_items],
        'total': 0,
        'createdAt': {'$date': datetime.now().isoformat() + 'Z'},
        'updatedAt': {'$date': datetime.now().isoformat() + 'Z'},
    }
    shopping_lists.append(active_list)

    group = {
        '_id': {'$oid': group_id},
        'name': persona['name'],
        'admin': {'$oid': user_id},
        'users': [{'$oid': user_id}],
        'groupcode': f'GRP{i + 1:03d}',
        'activeshoppinglist': {'$oid': active_list_id},
        'isDefault': True,
        'history': history,
        'createdAt': {'$date': start_date.isoformat() + 'Z'},
        'updatedAt': {'$date': datetime.now().isoformat() + 'Z'},
    }
    groups.append(group)

    print(f"  User {i + 1}: {persona['name']} - {purchase_count} purchases, avg {sum(len(sl['items']) for sl in shopping_lists[-purchase_count-1:-1]) // max(purchase_count, 1)} items/list")

# Save data
output_dir = r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data'

with open(f'{output_dir}/training_users.json', 'w', encoding='utf-8') as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

with open(f'{output_dir}/training_groups.json', 'w', encoding='utf-8') as f:
    json.dump(groups, f, ensure_ascii=False, indent=2)

with open(f'{output_dir}/training_shoppinglists.json', 'w', encoding='utf-8') as f:
    json.dump(shopping_lists, f, ensure_ascii=False, indent=2)

# Summary
total_purchases = sum(len(g['history']) for g in groups)
total_items = sum(len(sl['items']) for sl in shopping_lists)

print(f'\n=== Training Data Generated ===')
print(f'Users: {len(users)}')
print(f'Groups: {len(groups)}')
print(f'Shopping Lists: {len(shopping_lists)}')
print(f'Total Purchases: {total_purchases}')
print(f'Total Items: {total_items}')
print(f'Avg Items per Purchase: {total_items / max(total_purchases, 1):.1f}')
print(f'\nFiles saved to: {output_dir}')
