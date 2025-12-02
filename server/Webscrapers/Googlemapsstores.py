import requests
import time
import json

API_KEY = "AIzaSyB_YwWsltrLfeFOImovl-CE6__nTWkN924"

def get_stores_in_radius(lat, lng, radius, keyword="סופרמרקט"):
    """
    Returns all stores within radius of (lat,lng) using Google Places Nearby Search.
    Handles pagination (max ~60 results per query).
    All results in Hebrew.
    """
    
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": keyword,
        "language": "iw",
        "key": API_KEY,
    }

    all_results = []
    page = 1

    while True:
        response = requests.get(url, params=params)
        data = response.json()

        status = data.get("status")
        if status not in ("OK", "ZERO_RESULTS"):
            print(f"❌ Google API Error: {status}")
            print(data.get("error_message"))
            break

        results = data.get("results", [])
        all_results.extend(results)

        print(f"Page {page}: {len(results)} results")

        next_token = data.get("next_page_token")
        if not next_token:
            break

        # Must wait 1–2 seconds before next_page_token becomes valid
        time.sleep(2)
        page += 1

        params = {"pagetoken": next_token, "key": API_KEY}

    # --- Dedup by place_id ---
    unique = {}
    for p in all_results:
        pid = p["place_id"]
        if pid not in unique:
            unique[pid] = {
                "place_id": pid,
                "name": p.get("name"),
                "address": p.get("vicinity"),  # Hebrew
                "location": p.get("geometry", {}).get("location"),
                "types": p.get("types", [])
            }

    return list(unique.values())


# Example usage
if __name__ == "__main__":
    lat = 32.0853   # Tel Aviv
    lng = 34.7818
    radius = 3000   # 3 km

    stores = get_stores_in_radius(lat, lng, radius)
    print(f"\nTotal stores found: {len(stores)}")

    # Save for debugging
    with open("stores.json", "w", encoding="utf8") as f:
        json.dump(stores, f, ensure_ascii=False, indent=2)
