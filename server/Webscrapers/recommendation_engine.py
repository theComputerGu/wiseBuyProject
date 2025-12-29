"""
WiseBuy ML Recommendation Engine
================================
Five recommendation strategies:
1. Bought Together - Co-occurrence based
2. Buy Again - RFM (Recency-Frequency) scoring
3. Restock - Time-based cycle estimation
4. Popular Items - Time-weighted popularity
5. ML Predict - Logistic Regression classification model
"""

import sys
import json
import io
from collections import defaultdict
from datetime import datetime
import math
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

# Only set encoding if running as main script
if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def bought_together(cart_product_ids: list, all_shopping_lists: list, limit: int = 10,
                     products_data: list = None) -> list:
    """
    Find products frequently bought together using category-aware co-occurrence.
    Prioritizes complementary categories (e.g., bread+butter, meat+vegetables).

    Args:
        cart_product_ids: List of product IDs currently in cart
        all_shopping_lists: List of shopping lists, each with 'items' array of product IDs
        limit: Max recommendations to return
        products_data: List of product objects with category info

    Returns:
        List of {productId, score, reason}
    """
    if not cart_product_ids or not all_shopping_lists:
        return []

    # Define complementary category pairs (categories that go well together)
    COMPLEMENTARY_CATEGORIES = {
        'מוצרי קירור וביצים': ['לחמים ומאפים', 'חטיפים וממתקים', 'ירקות ופירות'],  # dairy -> bread, snacks, produce
        'לחמים ומאפים': ['מוצרי קירור וביצים', 'מעדנייה וסלטים', 'עוף בשר ודגים'],  # bread -> dairy, deli, meat
        'עוף בשר ודגים': ['ירקות ופירות', 'שימורים', 'לחמים ומאפים'],  # meat -> produce, canned, bread
        'ירקות ופירות': ['עוף בשר ודגים', 'מוצרי קירור וביצים', 'שימורים'],  # produce -> meat, dairy, canned
        'משקאות ויין': ['חטיפים וממתקים', 'מעדנייה וסלטים'],  # drinks -> snacks, deli
        'חטיפים וממתקים': ['משקאות ויין', 'מוצרי קירור וביצים'],  # snacks -> drinks, dairy
        'שימורים': ['לחמים ומאפים', 'עוף בשר ודגים', 'ירקות ופירות'],  # canned -> bread, meat, produce
        'מעדנייה וסלטים': ['לחמים ומאפים', 'משקאות ויין'],  # deli -> bread, drinks
        'הכל לבית': ['פארם ותינוקות'],  # household -> pharma
        'פארם ותינוקות': ['הכל לבית',],  # pharma -> household
    }

    # Build product -> category map
    product_categories = {}
    if products_data:
        for p in products_data:
            pid = p.get('_id', {}).get('$oid') or p.get('productId')
            if pid:
                product_categories[pid] = p.get('category', 'אחר')

    # Get categories of cart items
    cart_categories = set()
    for pid in cart_product_ids:
        cat = product_categories.get(pid)
        if cat:
            cart_categories.add(cat)

    # Find complementary categories for cart
    target_categories = set()
    for cat in cart_categories:
        if cat in COMPLEMENTARY_CATEGORIES:
            target_categories.update(COMPLEMENTARY_CATEGORIES[cat])
    # Remove categories already in cart
    target_categories -= cart_categories

    # Build co-occurrence matrix
    co_occurrence = defaultdict(lambda: defaultdict(int))

    for shopping_list in all_shopping_lists:
        items = shopping_list.get('items', [])
        product_ids = [item.get('productId') for item in items if item.get('productId')]

        for i, pid1 in enumerate(product_ids):
            for pid2 in product_ids[i+1:]:
                co_occurrence[pid1][pid2] += 1
                co_occurrence[pid2][pid1] += 1

    # Score products based on co-occurrence with cart items
    cart_set = set(cart_product_ids)
    scores = defaultdict(float)

    for cart_pid in cart_product_ids:
        for other_pid, count in co_occurrence[cart_pid].items():
            if other_pid not in cart_set:
                other_category = product_categories.get(other_pid, '')

                # Boost score if product is from a complementary category
                category_boost = 1.0
                if other_category in target_categories:
                    category_boost = 3.0  # 3x boost for complementary categories
                elif other_category in cart_categories:
                    category_boost = 0.8  # Reduce score for same category (user already has it)

                scores[other_pid] += count * category_boost

    # Normalize scores (0-1 range)
    max_score = max(scores.values()) if scores else 1

    recommendations = []
    for pid, score in sorted(scores.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(score / max_score, 3),
            'reason': 'משלים את הסל שלך',  # "Complements your cart"
            'strategy': 'bought_together'
        })

    return recommendations


def buy_again(user_history: list, limit: int = 10) -> list:
    """
    Recommend products user has bought before, scored by recency and frequency.

    Args:
        user_history: List of {productId, purchasedAt (ISO date string)}
        limit: Max recommendations to return

    Returns:
        List of {productId, score, reason}
    """
    if not user_history:
        return []

    now = datetime.now()
    product_stats = defaultdict(lambda: {'count': 0, 'last_purchase': None})

    for purchase in user_history:
        pid = purchase.get('productId')
        if not pid:
            continue

        purchased_at = purchase.get('purchasedAt')
        if purchased_at:
            try:
                purchase_date = datetime.fromisoformat(purchased_at.replace('Z', '+00:00'))
                purchase_date = purchase_date.replace(tzinfo=None)
            except:
                purchase_date = now
        else:
            purchase_date = now

        product_stats[pid]['count'] += 1

        if product_stats[pid]['last_purchase'] is None or purchase_date > product_stats[pid]['last_purchase']:
            product_stats[pid]['last_purchase'] = purchase_date

    # Calculate RFM-like scores
    scores = {}
    max_count = max(s['count'] for s in product_stats.values()) if product_stats else 1

    for pid, stats in product_stats.items():
        # Recency score: decays over time (half-life of 30 days)
        days_ago = (now - stats['last_purchase']).days if stats['last_purchase'] else 0
        recency_score = math.exp(-days_ago / 30)

        # Frequency score: normalized by max
        frequency_score = stats['count'] / max_count

        # Combined score (weighted: 60% recency, 40% frequency)
        scores[pid] = 0.6 * recency_score + 0.4 * frequency_score

    recommendations = []
    for pid, score in sorted(scores.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(score, 3),
            'reason': 'קנית בעבר',  # "You bought this before"
            'strategy': 'buy_again'
        })

    return recommendations


def restock_items(user_history: list, limit: int = 10) -> list:
    """
    Recommend products that are due for restocking based on purchase patterns.

    Estimates restock cycles based on:
    1. User's personal purchase frequency for each product
    2. Default category-based cycles (milk=7 days, toilet paper=30 days, etc.)

    Args:
        user_history: List of {productId, purchasedAt, category (optional)}
        limit: Max recommendations to return

    Returns:
        List of {productId, score, reason}
    """
    if not user_history:
        return []

    # Default restock cycles by category (in days)
    DEFAULT_CYCLES = {
        'dairy': 7,           # milk, cheese, yogurt
        'חלב': 7,
        'גבינות': 10,
        'bread': 5,           # bread, bakery
        'לחם': 5,
        'מאפים': 5,
        'vegetables': 7,      # fresh produce
        'fruits': 7,
        'ירקות': 7,
        'פירות': 7,
        'meat': 10,           # meat, poultry
        'בשר': 10,
        'eggs': 14,           # eggs
        'ביצים': 14,
        'cleaning': 30,       # cleaning supplies
        'ניקיון': 30,
        'paper': 30,          # toilet paper, paper towels
        'נייר': 30,
        'hygiene': 30,        # personal hygiene
        'היגיינה': 30,
        'snacks': 14,         # snacks, chips
        'חטיפים': 14,
        'beverages': 14,      # drinks
        'משקאות': 14,
        'frozen': 21,         # frozen foods
        'קפואים': 21,
        'canned': 60,         # canned goods
        'שימורים': 60,
    }
    DEFAULT_CYCLE = 21  # default for unknown categories

    now = datetime.now()
    product_purchases = defaultdict(list)
    product_categories = {}

    # Group purchases by product
    for purchase in user_history:
        pid = purchase.get('productId')
        if not pid:
            continue

        purchased_at = purchase.get('purchasedAt')
        if purchased_at:
            try:
                purchase_date = datetime.fromisoformat(purchased_at.replace('Z', '+00:00'))
                purchase_date = purchase_date.replace(tzinfo=None)
            except:
                purchase_date = now
        else:
            purchase_date = now

        product_purchases[pid].append(purchase_date)

        # Store category if available
        category = purchase.get('category', '').lower()
        if category:
            product_categories[pid] = category

    recommendations = []

    for pid, dates in product_purchases.items():
        if len(dates) < 1:
            continue

        dates.sort(reverse=True)
        last_purchase = dates[0]
        days_since_purchase = (now - last_purchase).days

        # Calculate average cycle from user's history (if enough data)
        if len(dates) >= 2:
            intervals = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
            avg_cycle = sum(intervals) / len(intervals)
            # Clamp to reasonable range
            avg_cycle = max(3, min(90, avg_cycle))
        else:
            # Use category-based default
            category = product_categories.get(pid, '').lower()
            avg_cycle = DEFAULT_CYCLE
            for cat_key, cycle in DEFAULT_CYCLES.items():
                if cat_key in category:
                    avg_cycle = cycle
                    break

        # Score: how "overdue" is this product?
        # score = days_since_purchase / avg_cycle
        # score > 1 means overdue, score < 1 means not yet due
        overdue_ratio = days_since_purchase / avg_cycle

        # Only recommend if at least 70% through the cycle
        if overdue_ratio >= 0.7:
            # Normalize score (cap at 2.0 for very overdue items)
            score = min(overdue_ratio, 2.0) / 2.0

            if overdue_ratio >= 1.5:
                reason = 'כדאי להשלים מלאי!'  # "Time to restock!"
            elif overdue_ratio >= 1.0:
                reason = 'אולי נגמר?'  # "Might be running low?"
            else:
                reason = 'בקרוב יגמר'  # "Running low soon"

            recommendations.append({
                'productId': pid,
                'score': round(score, 3),
                'reason': reason,
                'strategy': 'restock'
            })

    # Sort by score (most overdue first)
    recommendations.sort(key=lambda x: -x['score'])
    return recommendations[:limit]


def popular_items(all_purchases: list, limit: int = 10, decay_days: int = 30) -> list:
    """
    Recommend popular items across all users, weighted by recency.

    Args:
        all_purchases: List of {productId, purchasedAt}
        limit: Max recommendations to return
        decay_days: Half-life for time decay

    Returns:
        List of {productId, score, reason}
    """
    if not all_purchases:
        return []

    now = datetime.now()
    popularity = defaultdict(float)

    for purchase in all_purchases:
        pid = purchase.get('productId')
        if not pid:
            continue

        purchased_at = purchase.get('purchasedAt')
        if purchased_at:
            try:
                purchase_date = datetime.fromisoformat(purchased_at.replace('Z', '+00:00'))
                purchase_date = purchase_date.replace(tzinfo=None)
            except:
                purchase_date = now
        else:
            purchase_date = now

        # Time-weighted popularity
        days_ago = (now - purchase_date).days
        weight = math.exp(-days_ago / decay_days)
        popularity[pid] += weight

    # Normalize scores
    max_pop = max(popularity.values()) if popularity else 1

    recommendations = []
    for pid, pop in sorted(popularity.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(pop / max_pop, 3),
            'reason': 'פופולרי עכשיו',  # "Trending now"
            'strategy': 'popular'
        })

    return recommendations


def ml_predict(user_history: list, all_purchases: list, all_products: list, limit: int = 10) -> list:
    """
    Use Logistic Regression classifier to predict which products a user is likely to buy.

    Features per user-product pair:
    - User's purchase frequency for this product
    - Days since user last bought this product
    - Product's overall popularity
    - User's category affinity (how often user buys from this category)
    - Product's average purchase interval

    Args:
        user_history: List of {productId, purchasedAt, category}
        all_purchases: List of {productId, purchasedAt} from all users
        all_products: List of all product IDs to consider
        limit: Max recommendations to return

    Returns:
        List of {productId, score, reason}
    """
    if not user_history or not all_purchases or len(all_products) < 5:
        return []

    now = datetime.now()

    # Build user purchase stats
    user_product_stats = defaultdict(lambda: {'count': 0, 'last_purchase': None, 'category': None})
    user_category_counts = defaultdict(int)
    total_user_purchases = 0

    for purchase in user_history:
        pid = purchase.get('productId')
        if not pid:
            continue

        purchased_at = purchase.get('purchasedAt')
        category = purchase.get('category', 'unknown')

        try:
            purchase_date = datetime.fromisoformat(purchased_at.replace('Z', '+00:00'))
            purchase_date = purchase_date.replace(tzinfo=None)
        except:
            purchase_date = now

        user_product_stats[pid]['count'] += 1
        user_product_stats[pid]['category'] = category
        if user_product_stats[pid]['last_purchase'] is None or purchase_date > user_product_stats[pid]['last_purchase']:
            user_product_stats[pid]['last_purchase'] = purchase_date

        user_category_counts[category] += 1
        total_user_purchases += 1

    # Build global product stats
    global_product_stats = defaultdict(lambda: {'count': 0, 'purchases': []})

    for purchase in all_purchases:
        pid = purchase.get('productId')
        if not pid:
            continue

        purchased_at = purchase.get('purchasedAt')
        try:
            purchase_date = datetime.fromisoformat(purchased_at.replace('Z', '+00:00'))
            purchase_date = purchase_date.replace(tzinfo=None)
        except:
            purchase_date = now

        global_product_stats[pid]['count'] += 1
        global_product_stats[pid]['purchases'].append(purchase_date)

    # Calculate global max for normalization
    max_global_count = max((s['count'] for s in global_product_stats.values()), default=1)

    # Need at least some products user has bought to train on
    bought_products = list(user_product_stats.keys())
    if len(bought_products) < 3:
        return []

    # Prepare training data
    # Positive samples: products the user has bought
    # Negative samples: random products the user hasn't bought

    X = []  # Features
    y = []  # Labels (1 = bought, 0 = not bought)

    # Build category map for all products from all_purchases
    product_categories = {}
    for purchase in user_history:
        pid = purchase.get('productId')
        cat = purchase.get('category', 'unknown')
        if pid and cat:
            product_categories[pid] = cat

    # Feature extraction function
    def get_features(pid, for_prediction=False):
        user_stats = user_product_stats.get(pid, {'count': 0, 'last_purchase': None, 'category': None})
        global_stats = global_product_stats.get(pid, {'count': 0, 'purchases': []})

        # Feature 1: Global popularity (normalized) - main signal for new products
        popularity = global_stats['count'] / max_global_count

        # Feature 2: Category affinity - does user buy from this category?
        # For prediction, use product's category from global data
        category = user_stats['category'] or product_categories.get(pid, 'unknown')
        category_affinity = user_category_counts.get(category, 0) / max(total_user_purchases, 1)

        # Feature 3: Is this a frequently purchased product globally?
        regularity = 0.1
        purchases = sorted(global_stats['purchases'], reverse=True)
        if len(purchases) >= 2:
            intervals = [(purchases[i] - purchases[i+1]).days for i in range(min(5, len(purchases)-1))]
            avg_interval = sum(intervals) / len(intervals) if intervals else 30
            regularity = 1 / (1 + avg_interval / 30)

        # Feature 4: Recency of global purchases (is this product trending?)
        if purchases:
            days_since_any = (now - purchases[0]).days
            global_recency = math.exp(-days_since_any / 14)  # 2-week decay
        else:
            global_recency = 0

        # Feature 5: Co-purchase score - how often is this bought with user's products?
        co_purchase_score = 0
        # (simplified - could be enhanced with actual co-occurrence data)

        return [popularity, category_affinity, regularity, global_recency, co_purchase_score]

    # Positive samples (products user bought)
    for pid in bought_products:
        X.append(get_features(pid))
        y.append(1)

    # Negative samples (products user didn't buy, from global pool)
    not_bought = [p for p in global_product_stats.keys() if p not in user_product_stats]

    if not not_bought:
        return []

    # Sample up to same number as positive samples
    import random
    sample_size = min(len(not_bought), max(len(bought_products) * 2, 5))
    negative_samples = random.sample(not_bought, sample_size)

    for pid in negative_samples:
        X.append(get_features(pid))
        y.append(0)

    # Need at least some samples of each class
    if len(X) < 4 or sum(y) < 2 or (len(y) - sum(y)) < 2:
        return []

    # Train Logistic Regression (simpler, more interpretable)
    X = np.array(X)
    y = np.array(y)

    try:
        # Scale features for Logistic Regression
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        clf = LogisticRegression(
            random_state=42,
            max_iter=200,
            class_weight='balanced'  # Handle imbalanced classes
        )
        clf.fit(X_scaled, y)
    except Exception as e:
        return []

    # Predict on all products user hasn't bought
    candidates = [p for p in all_products if p not in user_product_stats]

    if not candidates:
        return []

    # Get predictions
    predictions = []
    for pid in candidates:
        features = get_features(pid)
        try:
            # Scale features using the same scaler
            features_scaled = scaler.transform([features])
            # Get probability of class 1 (will buy)
            proba = clf.predict_proba(features_scaled)[0][1]
            predictions.append((pid, proba))
        except:
            continue

    # Sort by probability
    predictions.sort(key=lambda x: -x[1])

    # Normalize scores to 0-1 range based on top predictions
    max_proba = predictions[0][1] if predictions else 1.0
    min_proba = predictions[min(limit, len(predictions)-1)][1] if len(predictions) > limit else 0.0

    recommendations = []
    for pid, proba in predictions[:limit]:
        # Normalize score relative to the prediction range
        if max_proba > min_proba:
            normalized_score = (proba - min_proba) / (max_proba - min_proba)
        else:
            normalized_score = proba

        recommendations.append({
            'productId': pid,
            'score': round(normalized_score, 3),
            'reason': 'מותאם אישית עבורך',  # "Personalized for you"
            'strategy': 'ml_predict'
        })

    return recommendations


def get_recommendations(data: dict) -> dict:
    """
    Main entry point - combines all five strategies.
    Returns 3 results from each category (no duplicates across categories).

    Args:
        data: {
            'cartProductIds': [...],
            'allShoppingLists': [...],
            'userHistory': [...],
            'allPurchases': [...],
            'allProducts': [...],  # List of all product IDs for ML prediction
            'productsData': [...],  # Full product objects with category info
            'limit': 15,
            'perCategory': 3  # Number of results per category
        }

    Returns:
        {'recommendations': [...]}
    """
    cart_ids = data.get('cartProductIds', [])
    all_lists = data.get('allShoppingLists', [])
    user_history = data.get('userHistory', [])
    all_purchases = data.get('allPurchases', [])
    all_products = data.get('allProducts', [])
    products_data = data.get('productsData', [])  # Product objects with categories
    per_category = data.get('perCategory', 3)  # 3 results per category

    # Exclude items already in cart
    cart_set = set(cart_ids)

    # Track seen products to avoid duplicates across categories
    seen_products = set()
    final_recs = []

    def add_recs_from_strategy(recs, max_count):
        """Add up to max_count unique recommendations from a strategy"""
        added = 0
        for rec in recs:
            if added >= max_count:
                break
            pid = rec['productId']
            if pid in cart_set or pid in seen_products:
                continue
            seen_products.add(pid)
            final_recs.append(rec)
            added += 1
        return added

    # Get recommendations from each strategy (fetch more than needed to account for duplicates)
    fetch_limit = per_category * 3

    # 1. Buy Again
    again_recs = buy_again(user_history, limit=fetch_limit)
    add_recs_from_strategy(again_recs, per_category)

    # 2. ML Predictions
    ml_recs = ml_predict(user_history, all_purchases, all_products, limit=fetch_limit)
    add_recs_from_strategy(ml_recs, per_category)

    # 3. Restock
    restock_recs = restock_items(user_history, limit=fetch_limit)
    add_recs_from_strategy(restock_recs, per_category)

    # 4. Bought Together (with category awareness)
    together_recs = bought_together(cart_ids, all_lists, limit=fetch_limit, products_data=products_data)
    add_recs_from_strategy(together_recs, per_category)

    # 5. Popular
    popular_recs = popular_items(all_purchases, limit=fetch_limit)
    add_recs_from_strategy(popular_recs, per_category)

    return {'recommendations': final_recs}




# -------------------------------------------------
# CLI Entry Point
# -------------------------------------------------
if __name__ == "__main__":
    # Read JSON input from stdin
    input_data = sys.stdin.read()

    try:
        data = json.loads(input_data)
        result = get_recommendations(data)
        print(json.dumps(result, ensure_ascii=False))
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON input: {str(e)}'}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
