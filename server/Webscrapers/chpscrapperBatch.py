import sys
import json
import io

# כדי שיוכל להדפיס עברית ל-stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def get_stores_for_barcode(driver, city: str, barcode: str):
    """Scrape table for single barcode using existing open driver."""
    # מילוי שדה עיר
    city_el = driver.find_element(By.ID, "shopping_address")
    city_el.clear()
    city_el.send_keys(city)

    # מילוי ברקוד/שם מוצר
    barcode_el = driver.find_element(By.ID, "product_name_or_barcode")
    barcode_el.clear()
    barcode_el.send_keys(barcode)

    # לחיצה על כפתור החיפוש
    driver.find_element(By.ID, "get_compare_results_button").click()

    # המתנה לטבלה
    wait = WebDriverWait(driver, 15)
    table = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "table.table.results-table"))
    )

    rows = table.find_elements(By.CSS_SELECTOR, "tbody tr")
    results = []

    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        text_cols = [c.text.strip() for c in cols]
        if len(text_cols) > 1:
            results.append(text_cols)

    return results


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python chpscrapperBatch.py <city> <barcode1> <barcode2> ..."
        }, ensure_ascii=False))
        sys.exit(1)

    city = sys.argv[1]
    barcodes = sys.argv[2:]

    print(f"📦 BATCH PYTHON CITY={city} BARCODES={barcodes}", file=sys.stderr)

    data = {}

    driver = webdriver.Chrome()
    driver.get("https://chp.co.il/")

    for bc in barcodes:
        try:
            stores = get_stores_for_barcode(driver, city, bc)
            data[bc] = stores
        except Exception as e:
            data[bc] = []
            print(f"❌ ERROR for {bc}: {e}", file=sys.stderr)

    driver.quit()

    print(json.dumps(data, ensure_ascii=False))
