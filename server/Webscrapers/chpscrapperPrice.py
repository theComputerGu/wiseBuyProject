import sys
import json
from selenium import webdriver
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re


def get_price_range(barcode: str, city: str):
    driver = webdriver.Chrome()
    driver.get("https://chp.co.il/")

    # Fill inputs
    city_el = driver.find_element(By.ID, "shopping_address")
    barcode_el = driver.find_element(By.ID, "product_name_or_barcode")

    city_el.send_keys(city)
    barcode_el.send_keys(barcode)

    # Wait for autocomplete suggestions
    wait = WebDriverWait(driver, 10)
    items = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "li.ui-menu-item"))
    )

    price_ranges = []

    for li in items:
        full_text = li.text.strip()
        match = re.search(r"(\d+\.\d+)\s*-\s*(\d+\.\d+)", full_text)
        price_ranges.append(match.group(0) if match else None)

    driver.quit()
    return price_ranges


# -------------------------------------------------
# READ TERMINAL ARGUMENTS
# -------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 chpscrapper.py <barcode> <city>")
        sys.exit(1)

    barcode = sys.argv[1]
    city = sys.argv[2]

    result = get_price_range(barcode, city)
    # REAL JSON OUTPUT for NestJS or CLI
    print(json.dumps({
        "prices": result
    }, ensure_ascii=False))
    
