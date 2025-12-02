import { Controller, Get, Param } from "@nestjs/common";
import { exec } from "child_process";

// ============================
// נתיב מוחלט לפייתון מתוך ה־venv
// ============================
const PYTHON_PATH = `"C:\\Users\\user\\Desktop\\degree in computer seince\\third year\\semester B\\final project\\WiseBuyProject\\server\\venv\\Scripts\\python.exe"`;

// ============================
// נתיב מוחלט לתיקיית הסקריפטים
// ============================
const SCRIPTS_DIR = `"C:\\Users\\user\\Desktop\\degree in computer seince\\third year\\semester B\\final project\\WiseBuyProject\\server\\Webscrapers"`;


@Controller("scrape")
export class ScrapeController {

  // ============================
  // 1) GET PRICE
  // ============================
  @Get("price/:barcode/:city")
  async getPrice(
    @Param("barcode") barcode: string,
    @Param("city") city: string
  ) {
    console.log("🟦 RAW PARAM CITY =", city);

    let decodedCity = decodeURIComponent(city);
    try {
      decodedCity = decodeURIComponent(decodedCity);
    } catch {}

    console.log("🟩 DECODED CITY =", decodedCity);

    return new Promise((resolve) => {
      const script = `${SCRIPTS_DIR}\\chpscrapperPrice.py`;
      const cmd = `${PYTHON_PATH} ${script} "${barcode}" "${decodedCity}"`;

      console.log("📌 Running PRICE script:", cmd);

      exec(cmd, { encoding: "utf8" }, (error, stdout) => {
        if (error) {
          console.log("🔴 Python PRICE Error:", error);
          return resolve({ price: null, error: "python failed", raw: error });
        }

        try {
          const json = JSON.parse(stdout);
          resolve(json);
        } catch (e) {
          console.log("⚠ JSON Parse PRICE Error:", stdout);
          resolve({ price: null, raw: stdout });
        }
      });
    });
  }

  // ============================
  // 2) GET STORES
  // ============================
  @Get("stores/:barcode/:city")
  async getStores(
    @Param("barcode") barcode: string,
    @Param("city") city: string
  ) {
    console.log("🟦 RAW PARAM CITY =", city);

    // Decode twice — Expo sometimes sends double UTF-8 encoding
    let decodedCity = decodeURIComponent(city);
    try {
      decodedCity = decodeURIComponent(decodedCity);
    } catch {}

    console.log("🟩 DECODED CITY =", decodedCity);

    return new Promise((resolve) => {
      const script = `${SCRIPTS_DIR}\\chpscrapperShops.py`;
      const cmd = `${PYTHON_PATH} ${script} "${barcode}" "${decodedCity}"`;

      console.log("📌 Running STORES script:", cmd);

      exec(cmd, { encoding: "utf8" }, (error, stdout) => {
        if (error) {
          console.log("🔴 Python STORES Error:", error);
          return resolve({ stores: null, error: "python failed", raw: error });
        }

        try {
          const json = JSON.parse(stdout);
          resolve(json);
        } catch (e) {
          console.log("⚠ JSON Parse STORES Error:", stdout);
          resolve({ stores: null, raw: stdout });
        }
      });
    });
  }
}
