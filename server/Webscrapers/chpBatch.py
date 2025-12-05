import sys
import json
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# -------------------------------------------------------
# USAGE:
#   python chpBatch.py "קרית אונו" 3387390320244 1234567890123 ...
# -------------------------------------------------------

def scrape(city, barcode):
    """Single scrape used inside batch"""
    driver = webdriver.Chrome()
    driver.get("https://chp.co.il/")

    driver.find_element(By.ID,"shopping_address").send_keys(city)
    driver.find_element(By.ID,"product_name_or_barcode").send_keys(barcode)
    driver.find_element(By.ID,"get_compare_results_button").click()

    wait = WebDriverWait(driver,15)
    table = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,"table.table.results-table")))
    rows = table.find_elements(By.CSS_SELECTOR,"tbody tr")

    stores=[]

    for row in rows:
        cols = [c.text.strip() for c in row.find_elements(By.TAG_NAME,"td")]
        if len(cols)>1:
            stores.append(cols)

    driver.quit()
    return stores


# -------------------------------------------------------
# MAIN — BATCH SCRAPING
# -------------------------------------------------------
if __name__=="__main__":
    if len(sys.argv)<3:
        print(json.dumps({"error":"Usage: python chpBatch.py <city> <barcode1> <barcode2> ..."}))
        exit()

    city     = sys.argv[1]
    barcodes = sys.argv[2:]

    output = {}

    for bc in barcodes:
        try:
            stores = scrape(city, bc)
            output[bc] = stores
        except:
            output[bc] = []

    print(json.dumps(output, ensure_ascii=False))
