import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { StoreOffer } from "../stores/schemas/stores.schema";

@Injectable()
export class ScrapeService {
  private readonly PYTHON = path.join(
    process.cwd(),
    "venv",
    "Scripts",
    "python.exe",
  );

  private readonly SCRIPT = path.join(
    process.cwd(),
    "Webscrapers",
    "chpscrapperShops.py",
  );

  // ----------------------------
  // Execute python scraper
  // ----------------------------
  private execScraper(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        cmd,
        { maxBuffer: 10 * 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) {
            console.error(stderr);
            return reject(err);
          }
          resolve(stdout);
        },
      );
    });
  }

  // ----------------------------
  // Parse CHP raw table
  // ----------------------------
  private parseStores(raw: string[][]): StoreOffer[] {
  console.log("🧾 RAW TABLE FROM PYTHON:", raw);

  const stores: StoreOffer[] = [];

  for (const row of raw) {
    console.log("➡️ ROW:", row);

    if (row.length < 3) continue;

    const chain = row[0];
    const address = row[2];

    let price: number | null = null;

    for (let i = row.length - 1; i >= 0; i--) {
      const cell = row[i]?.trim();
      console.log("   🔎 CELL:", cell);

      if (!cell) continue;

      const match = cell.match(/^\d+(\.\d+)?$/);
      if (match) {
        price = Number(match[0]);
        break;
      }
    }

    if (price === null) {
      console.warn("❌ NO PRICE FOUND IN ROW:", row);
      continue;
    }

    stores.push({ chain, address, price, lastUpdated: new Date() });
  }

  return stores;
}




  // =========================
  // Scrape single product
  // =========================
  async scrapeOne(barcode: string, city: string): Promise<StoreOffer[]> {
  const cmd = `"${this.PYTHON}" "${this.SCRIPT}" "${barcode}" "${city}"`;

  console.log("🐍 RUN PYTHON:", cmd);

  try {
    const stdout = await this.execScraper(cmd);

    console.log("🐍 PYTHON STDOUT RAW >>>");
    console.log(stdout);
    console.log("<<< END PYTHON STDOUT");

    const parsed = JSON.parse(stdout);

    console.log("🐍 PARSED JSON:", parsed);

    const stores = this.parseStores(parsed.stores);

    console.log("🏪 PARSED STORES:", stores);

    if (!stores.length) {
      console.warn("⚠️ NO STORES AFTER PARSE", {
        barcode,
        city,
        raw: parsed.stores,
      });
      throw new Error("No stores found");
    }

    return stores;
  } catch (e) {
    console.error("❌ SCRAPE ONE FAILED", {
      barcode,
      city,
      error: e,
    });

    throw new InternalServerErrorException("Scraping faileddddd");
  }
}


  async scrapeBatch(
    barcodes: string[],
    city: string,
  ): Promise<
    {
      itemcode: string;
      stores: StoreOffer[];
    }[]
  > {

    
    const results: {itemcode: string;stores: StoreOffer[];}[] = [];

    for (const barcode of barcodes) {
      try {
        const stores =
          await this.scrapeOne(barcode, city);

        results.push({
          itemcode: barcode,
          stores,
        });
      } catch {
        results.push({
          itemcode: barcode,
          stores: [],
        });
      }
    }

    return results;
  }
}
