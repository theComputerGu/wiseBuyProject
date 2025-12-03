import { Controller, Get, Param } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";

// ======================================================
// AUTO-RESOLVE PROJECT ROOT
// ======================================================
const ROOT = process.cwd();

// ======================================================
// RELATIVE PYTHON EXECUTABLE (Windows venv)
// ======================================================
const PYTHON_PATH = path.join(ROOT, "venv", "Scripts", "python.exe");

// ======================================================
// RELATIVE SCRIPTS DIRECTORY
// ======================================================
const SCRIPTS_DIR = path.join(ROOT,  "Webscrapers");

@Controller("scrape")
export class ScrapeController {
  // ======================================================
  // 1) GET PRICE
  // ======================================================
  @Get("price/:barcode/:city")
  async getPrice(
    @Param("barcode") barcode: string,
    @Param("city") city: string
  ) {
    console.log("🟦 RAW PARAM CITY =", city);

    // decode twice because Expo double-encodes Hebrew
    let decodedCity = decodeURIComponent(city);
    try {
      decodedCity = decodeURIComponent(decodedCity);
    } catch {}

    console.log("🟩 DECODED CITY =", decodedCity);

    // FULL script path automatically correct
    const script = path.join(SCRIPTS_DIR, "chpscrapperPrice.py");

    const cmd = `"${PYTHON_PATH}" "${script}" "${barcode}" "${decodedCity}"`;
    console.log("📌 Running PRICE script:", cmd);

    return new Promise((resolve) => {
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

  // ======================================================
  // 2) GET STORES
  // ======================================================
  @Get("stores/:barcode/:city")
  async getStores(
    @Param("barcode") barcode: string,
    @Param("city") city: string
  ) {
    console.log("🟦 RAW PARAM CITY =", city);

    let decodedCity = decodeURIComponent(city);
    try {
      decodedCity = decodeURIComponent(decodedCity);
    } catch {}

    console.log("🟩 DECODED CITY =", decodedCity);

    const script = path.join(SCRIPTS_DIR, "chpscrapperShops.py");
    const cmd = `"${PYTHON_PATH}" "${script}" "${barcode}" "${decodedCity}"`;

    console.log("📌 Running STORES script:", cmd);

    return new Promise((resolve) => {
      exec(cmd, { encoding: "utf8" }, (error, stdout) => {
        if (error) {
          console.log("🔴 Python STORES Error:", error);
          return resolve({
            stores: null,
            error: "python failed",
            raw: error,
          });
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
