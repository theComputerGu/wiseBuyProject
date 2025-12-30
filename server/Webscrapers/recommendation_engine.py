import sys
import json
import io
from collections import defaultdict
from datetime import datetime
import math
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')










def bought_together(cart_product_ids: list, all_shopping_lists: list, limit: int = 10,
                     products_data: list = None) -> list:

    if not cart_product_ids or not all_shopping_lists:
        return []

    COMPLEMENTARY_CATEGORIES = {
        'מוצרי קירור וביצים': ['לחמים ומאפים', 'חטיפים וממתקים', 'ירקות ופירות'],
        'לחמים ומאפים': ['מוצרי קירור וביצים', 'מעדנייה וסלטים', 'עוף בשר ודגים'],
        'עוף בשר ודגים': ['ירקות ופירות', 'שימורים', 'לחמים ומאפים'], 
        'ירקות ופירות': ['עוף בשר ודגים', 'מוצרי קירור וביצים', 'שימורים'], 
        'משקאות ויין': ['חטיפים וממתקים', 'מעדנייה וסלטים'], 
        'חטיפים וממתקים': ['משקאות ויין', 'מוצרי קירור וביצים'], 
        'שימורים': ['לחמים ומאפים', 'עוף בשר ודגים', 'ירקות ופירות'],  
        'מעדנייה וסלטים': ['לחמים ומאפים', 'משקאות ויין'], 
        'הכל לבית': ['פארם ותינוקות'],  
        'פארם ותינוקות': ['הכל לבית',], 
    }


    product_categories = {}
    if products_data:
        for p in products_data:
            pid = p.get('_id', {}).get('$oid') or p.get('productId')
            if pid:
                product_categories[pid] = p.get('category', 'אחר')


    cart_categories = set()
    for pid in cart_product_ids:
        cat = product_categories.get(pid)
        if cat:
            cart_categories.add(cat)


    target_categories = set()
    for cat in cart_categories:
        if cat in COMPLEMENTARY_CATEGORIES:
            target_categories.update(COMPLEMENTARY_CATEGORIES[cat])
    target_categories -= cart_categories


    co_occurrence = defaultdict(lambda: defaultdict(int))

    for shopping_list in all_shopping_lists:
        items = shopping_list.get('items', [])
        product_ids = [item.get('productId') for item in items if item.get('productId')]

        for i, pid1 in enumerate(product_ids):
            for pid2 in product_ids[i+1:]:
                co_occurrence[pid1][pid2] += 1
                co_occurrence[pid2][pid1] += 1


    cart_set = set(cart_product_ids)
    scores = defaultdict(float)

    for cart_pid in cart_product_ids:
        for other_pid, count in co_occurrence[cart_pid].items():
            if other_pid not in cart_set:
                other_category = product_categories.get(other_pid, '')

        
                category_boost = 1.0
                if other_category in target_categories:
                    category_boost = 3.0 
                elif other_category in cart_categories:
                    category_boost = 0.8  

                scores[other_pid] += count * category_boost


    max_score = max(scores.values()) if scores else 1

    recommendations = []
    for pid, score in sorted(scores.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(score / max_score, 3),
            'reason': 'משלים את הסל שלך',
            'strategy': 'bought_together'
        })

    return recommendations














def buy_again(user_history: list, limit: int = 10) -> list:
   
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


    scores = {}
    max_count = max(s['count'] for s in product_stats.values()) if product_stats else 1

    for pid, stats in product_stats.items():
     
        days_ago = (now - stats['last_purchase']).days if stats['last_purchase'] else 0
        recency_score = math.exp(-days_ago / 30)

    
        frequency_score = stats['count'] / max_count

       
        scores[pid] = 0.6 * recency_score + 0.4 * frequency_score

    recommendations = []
    for pid, score in sorted(scores.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(score, 3),
            'reason': 'קנית בעבר',
            'strategy': 'buy_again'
        })

    return recommendations
















def restock_items(user_history: list, limit: int = 10) -> list:
    




    if not user_history:
        return []

    DEFAULT_CYCLES = {
        'dairy': 7,     
        'חלב': 7,
        'גבינות': 10,
        'bread': 5,    
        'לחם': 5,
        'מאפים': 5,
        'vegetables': 7, 
        'fruits': 7,
        'ירקות': 7,
        'פירות': 7,
        'meat': 10,       
        'בשר': 10,
        'eggs': 14,         
        'ביצים': 14,
        'cleaning': 30,      
        'ניקיון': 30,
        'paper': 30,      
        'נייר': 30,
        'hygiene': 30,     
        'היגיינה': 30,
        'snacks': 14,      
        'חטיפים': 14,
        'beverages': 14,  
        'משקאות': 14,
        'frozen': 21,   
        'קפואים': 21,
        'canned': 60,    
        'שימורים': 60,
    }
    DEFAULT_CYCLE = 21  

    now = datetime.now()
    product_purchases = defaultdict(list)
    product_categories = {}


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


        if len(dates) >= 2:
            intervals = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
            avg_cycle = sum(intervals) / len(intervals)
 
            avg_cycle = max(3, min(90, avg_cycle))
        else:
  
            category = product_categories.get(pid, '').lower()
            avg_cycle = DEFAULT_CYCLE
            for cat_key, cycle in DEFAULT_CYCLES.items():
                if cat_key in category:
                    avg_cycle = cycle
                    break


        overdue_ratio = days_since_purchase / avg_cycle


        if overdue_ratio >= 0.7:
   
            score = min(overdue_ratio, 2.0) / 2.0

            if overdue_ratio >= 1.5:
                reason = 'כדאי להשלים מלאי!' 
            elif overdue_ratio >= 1.0:
                reason = 'אולי נגמר?' 
            else:
                reason = 'בקרוב יגמר' 

            recommendations.append({
                'productId': pid,
                'score': round(score, 3),
                'reason': reason,
                'strategy': 'restock'
            })


    recommendations.sort(key=lambda x: -x['score'])
    return recommendations[:limit]



















def popular_items(all_purchases: list, limit: int = 10, decay_days: int = 30) -> list:
   

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

        days_ago = (now - purchase_date).days
        weight = math.exp(-days_ago / decay_days)
        popularity[pid] += weight

    max_pop = max(popularity.values()) if popularity else 1

    recommendations = []
    for pid, pop in sorted(popularity.items(), key=lambda x: -x[1])[:limit]:
        recommendations.append({
            'productId': pid,
            'score': round(pop / max_pop, 3),
            'reason': 'פופולרי עכשיו',
            'strategy': 'popular'
        })

    return recommendations
















def ml_predict(user_history: list, all_purchases: list, all_products: list, limit: int = 10) -> list:
   

    if not user_history or not all_purchases or len(all_products) < 5:
        return []

    now = datetime.now()


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

    max_global_count = max((s['count'] for s in global_product_stats.values()), default=1)


    bought_products = list(user_product_stats.keys())
    if len(bought_products) < 3:
        return []


    X = [] 
    y = []  


    product_categories = {}
    for purchase in user_history:
        pid = purchase.get('productId')
        cat = purchase.get('category', 'unknown')
        if pid and cat:
            product_categories[pid] = cat


    def get_features(pid, for_prediction=False):
        user_stats = user_product_stats.get(pid, {'count': 0, 'last_purchase': None, 'category': None})
        global_stats = global_product_stats.get(pid, {'count': 0, 'purchases': []})

  
        popularity = global_stats['count'] / max_global_count

        
        category = user_stats['category'] or product_categories.get(pid, 'unknown')
        category_affinity = user_category_counts.get(category, 0) / max(total_user_purchases, 1)

      
        regularity = 0.1
        purchases = sorted(global_stats['purchases'], reverse=True)
        if len(purchases) >= 2:
            intervals = [(purchases[i] - purchases[i+1]).days for i in range(min(5, len(purchases)-1))]
            avg_interval = sum(intervals) / len(intervals) if intervals else 30
            regularity = 1 / (1 + avg_interval / 30)

      
        if purchases:
            days_since_any = (now - purchases[0]).days
            global_recency = math.exp(-days_since_any / 14)
        else:
            global_recency = 0

     
        co_purchase_score = 0
       

        return [popularity, category_affinity, regularity, global_recency, co_purchase_score]


    for pid in bought_products:
        X.append(get_features(pid))
        y.append(1)


    not_bought = [p for p in global_product_stats.keys() if p not in user_product_stats]

    if not not_bought:
        return []


    import random
    sample_size = min(len(not_bought), max(len(bought_products) * 2, 5))
    negative_samples = random.sample(not_bought, sample_size)

    for pid in negative_samples:
        X.append(get_features(pid))
        y.append(0)


    if len(X) < 4 or sum(y) < 2 or (len(y) - sum(y)) < 2:
        return []


    X = np.array(X)
    y = np.array(y)

    try:
   
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        clf = LogisticRegression(
            random_state=42,
            max_iter=200,
            class_weight='balanced'
        )
        clf.fit(X_scaled, y)
    except Exception as e:
        return []


    candidates = [p for p in all_products if p not in user_product_stats]

    if not candidates:
        return []


    predictions = []
    for pid in candidates:
        features = get_features(pid)
        try:
       
            features_scaled = scaler.transform([features])
            proba = clf.predict_proba(features_scaled)[0][1]
            predictions.append((pid, proba))
        except:
            continue


    predictions.sort(key=lambda x: -x[1])


    max_proba = predictions[0][1] if predictions else 1.0
    min_proba = predictions[min(limit, len(predictions)-1)][1] if len(predictions) > limit else 0.0

    recommendations = []
    for pid, proba in predictions[:limit]:

        if max_proba > min_proba:
            normalized_score = (proba - min_proba) / (max_proba - min_proba)
        else:
            normalized_score = proba

        recommendations.append({
            'productId': pid,
            'score': round(normalized_score, 3),
            'reason': 'מותאם אישית עבורך',
            'strategy': 'ml_predict'
        })

    return recommendations























def get_recommendations(data: dict) -> dict:
    

    cart_ids = data.get('cartProductIds', [])
    all_lists = data.get('allShoppingLists', [])
    user_history = data.get('userHistory', [])
    all_purchases = data.get('allPurchases', [])
    all_products = data.get('allProducts', [])
    products_data = data.get('productsData', []) 
    per_category = data.get('perCategory', 3) 

    cart_set = set(cart_ids)

    seen_products = set()
    final_recs = []

    def add_recs_from_strategy(recs, max_count):

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








if __name__ == "__main__":
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
