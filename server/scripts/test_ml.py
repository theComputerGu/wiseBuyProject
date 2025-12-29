"""Test ML predict function"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\Webscrapers')

from recommendation_engine import ml_predict, get_recommendations

# Load data
with open(r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data\training_groups.json', 'r', encoding='utf-8') as f:
    groups = json.load(f)

with open(r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data\training_shoppinglists.json', 'r', encoding='utf-8') as f:
    shopping_lists = json.load(f)

with open(r'c:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\data\wisebuy.productsLast.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

products_by_id = {p['_id']['$oid']: p for p in products}
lists_by_id = {sl['_id']['$oid']: sl for sl in shopping_lists}
all_product_ids = list(products_by_id.keys())

# Format shopping lists
all_lists = [{'items': [{'productId': item['_id']['$oid']} for item in sl['items']]} for sl in shopping_lists]

# Get all purchases
all_purchases = []
for g in groups:
    for h in g.get('history', []):
        list_id = h.get('shoppingListId', {}).get('$oid')
        if list_id and list_id in lists_by_id:
            sl = lists_by_id[list_id]
            for item in sl['items']:
                all_purchases.append({
                    'productId': item['_id']['$oid'],
                    'purchasedAt': h['purchasedAt']['$date']
                })

products_data = [{'productId': p['_id']['$oid'], 'category': p.get('category', '')} for p in products]

# Test with different user types
for user_idx in [0, 4, 18]:  # Different personas
    group = groups[user_idx]
    print(f'\n=== {group["name"]} (User {user_idx + 1}) ===')

    # Get user history
    user_history = []
    for h in group.get('history', []):
        list_id = h.get('shoppingListId', {}).get('$oid')
        if list_id and list_id in lists_by_id:
            sl = lists_by_id[list_id]
            for item in sl['items']:
                pid = item['_id']['$oid']
                cat = products_by_id.get(pid, {}).get('category', '')
                user_history.append({
                    'productId': pid,
                    'purchasedAt': h['purchasedAt']['$date'],
                    'category': cat
                })

    # Get current cart
    active_list_id = group.get('activeshoppinglist', {}).get('$oid')
    cart_ids = []
    if active_list_id and active_list_id in lists_by_id:
        cart_ids = [item['_id']['$oid'] for item in lists_by_id[active_list_id]['items']]

    print(f'History: {len(user_history)} items, Cart: {len(cart_ids)} items')

    # Test ml_predict directly
    result = ml_predict(user_history, all_purchases, all_product_ids, limit=5)
    print(f'\nML Predict ({len(result)} results):')
    for r in result:
        pid = r['productId']
        title = products_by_id.get(pid, {}).get('title', '?')[:32]
        cat = products_by_id.get(pid, {}).get('category', '?')[:12]
        print(f'  {r["score"]:.3f} - {title} ({cat})')

    # Test full recommendations
    data = {
        'cartProductIds': cart_ids,
        'allShoppingLists': all_lists,
        'userHistory': user_history,
        'allPurchases': all_purchases,
        'allProducts': all_product_ids,
        'productsData': products_data,
        'perCategory': 3
    }

    full_result = get_recommendations(data)
    print(f'\nFull Recommendations ({len(full_result["recommendations"])} total):')
    for r in full_result['recommendations']:
        pid = r['productId']
        title = products_by_id.get(pid, {}).get('title', '?')[:32]
        print(f'  [{r["strategy"]:15}] {r["score"]:.3f} - {title}')
