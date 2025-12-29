import sys
import json
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import re


# -------------------------------------------------
# FUNCTION 2 — Get stores + prices table
# -------------------------------------------------
def get_stores_table(barcode: str, city: str):
    # Configure Chrome for speed
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-logging')
    options.add_argument('--log-level=3')
    options.add_argument('--blink-settings=imagesEnabled=false')
    options.add_argument('--disable-infobars')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.page_load_strategy = 'eager'  # Don't wait for all resources

    driver = webdriver.Chrome(options=options)
    driver.get("https://chp.co.il/")

    # Fill inputs
    city_el = driver.find_element(By.ID, "shopping_address")
    barcode_el = driver.find_element(By.ID, "product_name_or_barcode")

    city_el.send_keys(city)
    barcode_el.send_keys(barcode)

    # CLICK search
    driver.find_element(By.ID, "get_compare_results_button").click()

    # Wait for table
    wait = WebDriverWait(driver, 15)
    table = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "table.table.results-table"))
    )

    rows = table.find_elements(By.CSS_SELECTOR, "tbody tr")
    results = []

    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        text_cols = [c.text.strip() for c in cols]

        # Ignore rows with one column (like dividers)
        if len(text_cols) > 1:
            results.append(text_cols)

    driver.quit()
    return results


# -------------------------------------------------
# TERMINAL ARGUMENT HANDLING
# -------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 chpscrapper.py <barcode> <city>")
        sys.exit(1)

    barcode = sys.argv[1]
    city = sys.argv[2]

    data = get_stores_table(barcode, city)
    print(json.dumps({
        "stores": data
    }, ensure_ascii=False))