"""
Generate realistic training data for WiseBuy ML recommendation engine.
Creates users, groups, and shopping lists with realistic shopping patterns.
"""

import json
import random
import sys
import io
from datetime import datetime, timedelta
from bson import ObjectId

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load products
with open(r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data\wisebuy.products.updated3.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Organize products by category
categories = {}
for p in products:
    cat = p.get('category') or 'אחר'
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(p['_id']['$oid'])

print(f"Loaded {len(products)} products in {len(categories)} categories")

# Define user personas with shopping patterns
PERSONAS = [
    {
        'name': 'משפחה עם ילדים',  # Family with kids
        'preferences': {
            'מוצרי קירור וביצים': 0.25,  # dairy - high
            'חטיפים וממתקים': 0.20,       # snacks
            'לחמים ומאפים': 0.15,          # bread
            'משקאות ויין': 0.15,           # drinks
            'ירקות ופירות': 0.10,          # produce
            'שימורים': 0.10,               # canned
            'עוף בשר ודגים': 0.05,         # meat
        },
        'items_per_list': (8, 15),
        'lists_per_month': 4,
    },
    {
        'name': 'זוג צעיר',  # Young couple
        'preferences': {
            'משקאות ויין': 0.20,
            'מעדנייה וסלטים': 0.18,
            'ירקות ופירות': 0.15,
            'עוף בשר ודגים': 0.15,
            'מוצרי קירור וביצים': 0.12,
            'לחמים ומאפים': 0.10,
            'חטיפים וממתקים': 0.10,
        },
        'items_per_list': (5, 10),
        'lists_per_month': 5,
    },
    {
        'name': 'סטודנט',  # Student
        'preferences': {
            'שימורים': 0.25,               # canned - cheap
            'חטיפים וממתקים': 0.20,
            'משקאות ויין': 0.20,
            'לחמים ומאפים': 0.15,
            'מוצרי קירור וביצים': 0.10,
            'אחר': 0.10,
        },
        'items_per_list': (4, 8),
        'lists_per_month': 6,
    },
    {
        'name': 'אמא בית',  # Homemaker
        'preferences': {
            'ירקות ופירות': 0.20,
            'עוף בשר ודגים': 0.18,
            'מוצרי קירור וביצים': 0.15,
            'הכל לבית': 0.12,
            'לחמים ומאפים': 0.10,
            'שימורים': 0.10,
            'פארם ותינוקות': 0.08,
            'מעדנייה וסלטים': 0.07,
        },
        'items_per_list': (12, 20),
        'lists_per_month': 3,
    },
    {
        'name': 'רווק בריא',  # Health-conscious single
        'preferences': {
            'ירקות ופירות': 0.30,
            'מוצרי קירור וביצים': 0.20,
            'עוף בשר ודגים': 0.15,
            'משקאות ויין': 0.10,
            'לחמים ומאפים': 0.10,
            'מעדנייה וסלטים': 0.10,
            'אחר': 0.05,
        },
        'items_per_list': (6, 12),
        'lists_per_month': 5,
    },
]

# Common product pairings (products often bought together)
COMMON_PAIRINGS = {
    'מוצרי קירור וביצים': ['לחמים ומאפים', 'ירקות ופירות'],  # dairy with bread and produce
    'עוף בשר ודגים': ['ירקות ופירות', 'שימורים'],            # meat with produce and canned
    'לחמים ומאפים': ['מעדנייה וסלטים', 'מוצרי קירור וביצים'], # bread with deli and dairy
    'חטיפים וממתקים': ['משקאות ויין'],                        # snacks with drinks
}


def generate_oid():
    return str(ObjectId())


def select_products_for_persona(persona, categories, count):
    """Select products based on persona preferences"""
    selected = []
    prefs = persona['preferences']

    for _ in range(count * 2):  # Try more times to get enough
        if len(selected) >= count:
            break

        # Weighted random category selection
        r = random.random()
        cumulative = 0
        chosen_cat = None
        for cat, weight in prefs.items():
            cumulative += weight
            if r <= cumulative:
                chosen_cat = cat
                break

        if chosen_cat and chosen_cat in categories and categories[chosen_cat]:
            pid = random.choice(categories[chosen_cat])
            if pid not in selected:
                selected.append(pid)

                # Sometimes add a paired product
                if chosen_cat in COMMON_PAIRINGS and random.random() < 0.3:
                    paired_cat = random.choice(COMMON_PAIRINGS[chosen_cat])
                    if paired_cat in categories and categories[paired_cat]:
                        paired_pid = random.choice(categories[paired_cat])
                        if paired_pid not in selected and len(selected) < count:
                            selected.append(paired_pid)

    return selected[:count]


# Generate data
NUM_USERS = 20
MONTHS_OF_HISTORY = 4

users = []
groups = []
shopping_lists = []

# Start date: 4 months ago
start_date = datetime.now() - timedelta(days=MONTHS_OF_HISTORY * 30)

print(f"\nGenerating data for {NUM_USERS} users over {MONTHS_OF_HISTORY} months...")

for i in range(NUM_USERS):
    # Pick a persona
    persona = random.choice(PERSONAS)

    # Create user
    user_id = generate_oid()
    group_id = generate_oid()

    user = {
        '_id': {'$oid': user_id},
        'name': f'user{i+1}',
        'email': f'user{i+1}@wisebuy.test',
        'password': '$2b$10$placeholder',
        'groups': [{'$oid': group_id}],
        'activeGroup': {'$oid': group_id},
        'createdAt': {'$date': start_date.isoformat() + 'Z'},
        'updatedAt': {'$date': datetime.now().isoformat() + 'Z'},
    }
    users.append(user)

    # Create group with purchase history
    history = []
    current_date = start_date

    # Track frequently bought products for this user (creates patterns)
    favorite_products = select_products_for_persona(persona, categories, 15)

    while current_date < datetime.now() - timedelta(days=2):
        # Create shopping list for this purchase
        list_id = generate_oid()

        # Decide how many items
        min_items, max_items = persona['items_per_list']
        num_items = random.randint(min_items, max_items)

        # Mix of favorites and new products
        items = []

        # Add some favorites (40-60% chance for each)
        for fav in favorite_products:
            if random.random() < 0.5 and len(items) < num_items:
                items.append({
                    '_id': {'$oid': fav},
                    'quantity': random.randint(1, 3)
                })

        # Fill rest with random products based on preferences
        remaining = num_items - len(items)
        if remaining > 0:
            new_products = select_products_for_persona(persona, categories, remaining + 3)
            for pid in new_products:
                if len(items) >= num_items:
                    break
                if not any(item['_id']['$oid'] == pid for item in items):
                    items.append({
                        '_id': {'$oid': pid},
                        'quantity': random.randint(1, 3)
                    })

        if items:
            shopping_list = {
                '_id': {'$oid': list_id},
                'items': items,
                'total': random.randint(80, 450),
                'createdAt': {'$date': current_date.isoformat() + 'Z'},
                'updatedAt': {'$date': current_date.isoformat() + 'Z'},
            }
            shopping_lists.append(shopping_list)

            # Add to history
            history.append({
                'name': f'קניות {current_date.strftime("%d/%m")}',
                'shoppingListId': {'$oid': list_id},
                'purchasedAt': {'$date': current_date.isoformat() + 'Z'},
                'storename': random.choice(['רמי לוי', 'שופרסל', 'יוחננוף', 'ויקטורי', 'מגה']),
                'storeadress': random.choice(['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'רמת גן']),
                'totalprice': sum(item['quantity'] * random.randint(5, 30) for item in items),
                'itemcount': len(items),
            })

        # Next shopping trip
        days_between = 30 // persona['lists_per_month']
        current_date += timedelta(days=random.randint(max(1, days_between - 3), days_between + 3))

    # Create active shopping list (current cart)
    active_list_id = generate_oid()
    active_items = select_products_for_persona(persona, categories, random.randint(2, 5))
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
        'name': f'הבית של {user["name"]}',
        'admin': {'$oid': user_id},
        'users': [{'$oid': user_id}],
        'groupcode': f'GRP{i+1:03d}',
        'activeshoppinglist': {'$oid': active_list_id},
        'isDefault': True,
        'history': history,
        'createdAt': {'$date': start_date.isoformat() + 'Z'},
        'updatedAt': {'$date': datetime.now().isoformat() + 'Z'},
    }
    groups.append(group)

    print(f"  User {i+1}: {persona['name']} - {len(history)} purchases, {sum(len(h.get('items', [])) for h in [shopping_lists[-2]] if h)} items/list avg")

# Save to files
output_dir = r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data'

with open(f'{output_dir}/training_users.json', 'w', encoding='utf-8') as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

with open(f'{output_dir}/training_groups.json', 'w', encoding='utf-8') as f:
    json.dump(groups, f, ensure_ascii=False, indent=2)

with open(f'{output_dir}/training_shoppinglists.json', 'w', encoding='utf-8') as f:
    json.dump(shopping_lists, f, ensure_ascii=False, indent=2)

# Print summary
total_purchases = sum(len(g['history']) for g in groups)
total_items = sum(len(sl['items']) for sl in shopping_lists)

print(f'\n=== Training Data Generated ===')
print(f'Users: {len(users)}')
print(f'Groups: {len(groups)}')
print(f'Shopping Lists: {len(shopping_lists)}')
print(f'Total Purchases: {total_purchases}')
print(f'Total Items: {total_items}')
print(f'\nFiles saved to: {output_dir}')
print(f'  - training_users.json')
print(f'  - training_groups.json')
print(f'  - training_shoppinglists.json')
