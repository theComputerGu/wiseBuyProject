import random
import unicodedata
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
import urllib.parse
import time
import os
import re
import base64

# --------------------------------------------
# CONFIG
# --------------------------------------------
API_URL = "http://localhost:3000/products"
XML_PATH = "PriceFull7290027600007-019-202511280300.xml"

SAVE_FOLDER = r"C:\Users\sean\Desktop\WiseBuy\wiseBuyProject\server\uploads\products"

CITY = "קריית אונו"
CHAIN_ID = "7290027600007"
BASE_SITE = "https://chp.co.il"
IMAGES_BASE = "https://images.chp.co.il"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
})


# --------------------------------------------
# CATEGORY RULES
# --------------------------------------------
CATEGORY_RULES = {
    # מוצרי חלב / מקרר
    "dairy": [
        "חלב", "שוקו", "יוגורט", "יופלה", "אקטימל",
        "גבינה", "גבינות", "גבינת",
        "שמנת", "קצפת", "להקצפה",
        "קוטג", "לבנה", "לבן",
        "חמאה", "מרגרינה",
        "ברי", "בושה", "מיני ברי",
        "עיזים", "עיזים טבעי",
        "גוש חלב", "בולגרית", "טוב טעם"
    ],

    # בשר, עוף, דגים, נקניקים
    "meats": [
        "בשר", "עוף", "הודו", "כבש",
        "פרגית", "סטייק", "צלי", "טחון",
        "שניצל", "המבורגר", "קבב",
        "נקניק", "נקניקיות", "פסטרמה",
        "דג", "סלמון", "טונה", "הרינג", "פילה דג"
    ],

    # שתייה – כולל אנרגיה, מים, קפה, תה
    "drinks": [
        "משקה", "משקאות",
        "מים", "סודה", "פרייה",
        "מיץ", "מיצים", "לימונדה",
        "תה", "חליטת תה",
        "קפה", "קפוצ'ינו", "נס קפה",
        "בירה", "יין",
        "XL", "אקסל", "מונסטר", "רד בול",
        "מי קוקוס"
    ],

    # חטיפים, מתוקים, שוקולד, עוגיות וכו'
    "snacks": [
        "שוקולד", "שוק.", "שוק.מריר", "שוק.חלב",
        "חטיף", "חטיפים",
        "עוגה", "עוגות",
        "עוגיות", "עוגית",
        "וופל", "ופל",
        "קרקר", "קרקרים",
        "טופי", "סוכריה", "סוכריות",
        "חמצוצים",
        "מסטיק", "אורביט", "מנטוס",
        "נייטשר וואלי", "פייבר וואן",
        "קראנץ", "קראנצי",
        "לינדט", "ריטר", "קינדר"
    ],

    # רטבים, ממרחים מלוחים, תיבול
    "sauces": [
        "רוטב", "ברביקיו", "BBQ",
        "טבסקו", "סרירצה",
        "קטשופ", "מיונז", "מיונז",
        "חרדל", "תיבול",
        "ויניגרט", "פסטו",
        "סויה", "טריאקי", "צ'ילי",
        "טחינה", "ממרח חומוס"
    ],

    # קוסמטיקה / טיפוח גוף/פנים/שיער
    "cosmetics": [
        "קרם", "תחליב", "לושן",
        "מסכה", "מסיכת",
        "שמפו", "מרכך",
        "סבון רחצה", "סבון גוף",
        "נוטרוגינה", "ניוטרוג'ינה",
        "לוריאל", "אלביב",
        "וזלין", "וסלין",
        "ספיד סטיק", "דאודורנט",
        "AGE SPECIALIST", "ESSENTIALS"
    ],

    # היגיינה, נייר, תחבושות, מגבונים וכו'
    "hygiene": [
        "טמפונים", "טמפון",
        "תחבושת", "תחבושות",
        "קרפרי", "דיפנד", "קוטקס",
        "טישו", "קלינקס",
        "נייר טואלט", "גליל נייר",
        "מגבונים", "מגבונים לחים",
        "חיתולים", "חיתול"
    ],

    # דגני בוקר, גרנולה וכו'
    "cereals": [
        "דגני", "דגני בוקר",
        "קורנפלקס", "קורנפלקס",
        "פיטנס", "קראנץ", "קראנצי",
        "גרנולה",
        "פייבר וואן",
        "קורני", "חטיף דגנים"
    ],

    # קפואים – ירקות, פירות, גלידות, מאפים קפואים
    "frozen": [
        "קפוא", "קפואה",
        "ירקות קפואים", "אפונת גן קפואה",
        "אוכמניות קפוא", "תות קפוא",
        "פיצה קפואה", "בורקס קפוא",
        "גלידה", "קרמיסימו", "שלגון", "ארטיק"
    ],

    # פירות (בעיקר טריים, אבל גם חלק מארוזים)
    "fruits": [
        "בננה", "בננות",
        "תות", "תותים", "תות שדה",
        "אוכמניות",
        "ענבים",
        "תפוח", "תפוחים",
        "אפרסק", "אפרסקים",
        "מנגו", "קיווי",
        "אבטיח", "מלון",
        "קלמנטינה", "תפוז", "נקטארין",
        "פירות יער"
    ],
}
def guess_category(title: str):
    if not title:
        return "other"
    for cat, words in CATEGORY_RULES.items():
        if any(word in title for word in words):
            return cat
    return "other"


# --------------------------------------------
# UNIT MAPPER
# --------------------------------------------
def map_unit(unit_str: str):
    if not unit_str:
        return "unit"
    if "גר" in unit_str:
        return "gram"
    if "ליט" in unit_str or "מל" in unit_str:
        return "liter"
    if "קג" in unit_str:
        return "kg"
    return "unit"


def human_delay():
    # Delay between 1.2 – 6.5 sec (real human pattern)
    base = random.uniform(1.2, 4.3)
    
    # occasional longer pause every ~20 requests
    if random.random() < 0.05:
        base += random.uniform(3, 8)

    # small jitter
    jitter = random.uniform(0.1, 0.4)

    return base + jitter

# --------------------------------------------
# NORMALIZE URL
# --------------------------------------------
def normalize_image_url(src: str | None):
    if not src:
        return None
    if src.startswith("http://") or src.startswith("https://"):
        return src
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("/"):
        return urllib.parse.urljoin(BASE_SITE, src)
    return urllib.parse.urljoin(IMAGES_BASE + "/", src)


# --------------------------------------------
# EXTRACT IMAGE FROM HTML (PRIMARY LOGIC)
# --------------------------------------------
def extract_image_from_chp(html: str):
    """
    Returns (external_url, base64_data)
    """

    # 1️⃣ FIRST: data-uri extraction (your working solution)
    match = re.search(r'data-uri="([^"]+)"', html)
    if match:
        src = match.group(1)
        if src.startswith("data:image"):
            return None, src
        return normalize_image_url(src), None

    # 2️⃣ SECOND: fallback to <img src="...">
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src", "") or ""
        if src.startswith("data:image"):
            return None, src
        if src.startswith("http") or src.startswith("//") or src.endswith(".jpg") or src.endswith(".png"):
            return normalize_image_url(src), None

    return None, None


# --------------------------------------------
# SCRAPE CHP PAGE
# --------------------------------------------
def scrape_chp(barcode: str):
    print(f"    [CHP] Requesting page for barcode {barcode}")

    try:
        city_encoded = urllib.parse.quote(CITY)
        url = f"{BASE_SITE}/{city_encoded}/0/0/{barcode}"
        print(f"    [CHP] URL: {url}")

        r = SESSION.get(url, timeout=10)
        if r.status_code != 200:
            print(f"    [CHP] Invalid page ({r.status_code})")
            return None, None, None

        html = r.text
    

        # IMAGE extraction (supports data-uri AND src=)
        external_url, base64_img = extract_image_from_chp(html)

        if external_url:
            print(f"    [CHP] Found external image: {external_url}")
        elif base64_img:
            print("    [CHP] Found BASE64 image")
        else:
            print("    [CHP] No image found")

        
        soup = BeautifulSoup(html, "html.parser")
        prices = []

        # Select all rows in result table
        rows = soup.select("table.table.results-table tbody tr")

        for tr in rows:
            tds = tr.find_all("td")
            if not tds:
                continue

            # The last <td> is always the price column
            raw = tds[-1].get_text()

            # Clean unicode junk (NBSP, RTL marks)

            # Match ONLY floats with dot (e.g. 21.90)
            price_match = re.search(r"(\d+\.\d{2})", raw)
            if price_match:
                prices.append(float(price_match.group(1)))
        price_range = None
        if prices:
            price_range = f"₪{min(prices):.2f} - ₪{max(prices):.2f}"
            print(f"    [CHP] Price range: {price_range}")
        else:
            print("    [CHP] No price data")

        return external_url, base64_img, price_range

    except Exception as e:
        print("    [CHP ERROR]", e)
        return None, None, None


# --------------------------------------------
# DOWNLOAD IMAGE (URL + BASE64)
# --------------------------------------------
def download_image(external_url: str | None, base64_img: str | None, itemcode: str):
    os.makedirs(SAVE_FOLDER, exist_ok=True)

    # BASE64 case
    if base64_img:
        try:
            header, encoded = base64_img.split(",", 1)
            ext = "png" if "png" in header else "jpg"
            filename = f"{itemcode}.{ext}"
            full_path = os.path.join(SAVE_FOLDER, filename)

            with open(full_path, "wb") as f:
                f.write(base64.b64decode(encoded))

            print(f"    [IMG] Saved BASE64 as {full_path}")
            return filename
        except Exception as e:
            print(f"    [IMG ERROR] Base64 decode failed: {e}")
            return None

    # External URL case
    if external_url:
        try:
            resp = SESSION.get(external_url, timeout=15)
            if resp.status_code != 200:
                print(f"    [IMG] HTTP {resp.status_code} failed")
                return None

            filename = f"{itemcode}.jpg"
            full_path = os.path.join(SAVE_FOLDER, filename)

            with open(full_path, "wb") as f:
                f.write(resp.content)

            print(f"    [IMG] Saved URL image as {full_path}")
            return filename

        except Exception as e:
            print(f"    [IMG ERROR] {itemcode}: {e}")
            return None

    return None



# --------------------------------------------
# MAIN PROCESS
# --------------------------------------------
def upload_products():
    tree = ET.parse(XML_PATH)
    root = tree.getroot()
    items = root.find("Items")

    uploaded = 0
    failed = 0

    for item in items.findall("Item"):
        
        delay = human_delay()
        print(f"[DELAY] Sleeping for {delay:.2f} seconds...")
        time.sleep(delay)
        print(f"[DELAY] Sleeping for {delay} seconds before processing next item...")
        itemcode = item.findtext("ItemCode")
        title = item.findtext("ItemName")
        manufacturer = item.findtext("ManufacturerName")
        unit_of_measure = item.findtext("UnitOfMeasure")

        if not itemcode or not title:
            continue

        print("\n=================================================")
        print(f"[PROCESSING] {itemcode} - {title}")

        unit = map_unit(unit_of_measure or "")
        category = guess_category(title)

        external_url, base64_img, price_range = scrape_chp(itemcode)
        time.sleep(0.2)

        local_image = download_image(external_url, base64_img, itemcode)
        #edit image path for db
        image_path_db = f"http://127.0.0.1:3000/uploads/products/{local_image}" if local_image else None

        payload = {
            "itemcode": itemcode,
            "title": title,
            "unit": unit,
            "brand": manufacturer,
            "image": image_path_db,
            "pricerange": price_range,
            "category": category,
        }

        try:
            res = SESSION.post(API_URL, json=payload, timeout=10)

            if res.status_code == 201:
                print(f"[OK] {itemcode} inserted.")
                uploaded += 1
            else:
                print(f"[FAIL] {itemcode} | status {res.status_code} | {res.text}")
                failed += 1

        except Exception as e:
            print(f"[ERROR] {itemcode} | {e}")
            failed += 1

    print("\n================ IMPORT COMPLETE ================")
    print(f"Uploaded successfully: {uploaded}")
    print(f"Failed:              {failed}")
    print("=================================================")


if __name__ == "__main__":
    upload_products()
