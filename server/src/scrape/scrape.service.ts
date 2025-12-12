import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { exec } from "child_process";
import * as path from "path";
import { StoresService } from "../stores/stores.service";

@Injectable()
export class ScrapeService {
  constructor(private readonly storesService: StoresService) { }

  private readonly PYTHON = path.join(
    process.cwd(),
    "venv",
    "Scripts",
    "python.exe"
  );

  private readonly SCRIPT = path.join(
    process.cwd(),
    "Webscrapers",
    "chpscrapperShops.py"
  );

  // -----------------------------
  // Parse raw scraper output
  // -----------------------------
  private parseStores(raw: string[][]) {
    const stores: { chain: string; address: string; price: number, }[] = [];

    for (const r of raw) {
      if (r.length < 5) continue;

      const chain = r[0];
      const address = r[2];

      const priceText =
        r[5] && r[5].trim() ? r[5] :
          r[4] && r[4].trim() ? r[4] :
            null;

      if (!priceText) continue;

      const match = priceText.match(/([\d.]+)/);
      if (!match) continue;

      stores.push({
        chain,
        address,
        price: Number(match[1]),
      });
    }

    return stores;
  }



  // -----------------------------
  // Exec helper
  // -----------------------------
  private execScraper(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          return reject(err);
        }
        resolve(stdout);
      });
    });
  }

  // -----------------------------
  // Scrape single barcode
  // -----------------------------
  async scrapeOne(barcode: string, city: string) {
    const cmd = `"${this.PYTHON}" "${this.SCRIPT}" "${barcode}" "${city}"`;

    try {
      const stdout = await this.execScraper(cmd);
      const parsed = JSON.parse(stdout);

      const stores = this.parseStores(parsed.stores);
      if (!stores.length) {
        throw new Error("No valid store prices found");
      }
      console.log("stores" ,stores)

      await this.storesService.upsertStores(barcode, stores);

      return { itemcode: barcode, stores };
    } catch (e) {
      throw new InternalServerErrorException(
        "Scraping or parsing failed",
      );
    }
  }

  // -----------------------------
  // Scrape multiple barcodes
  // -----------------------------
  async scrapeBatch(barcodes: string[], city: string) {
    const results: any[] = [];

    for (const barcode of barcodes) {
      try {
        results.push(await this.scrapeOne(barcode, city));
      } catch {
        results.push({ itemcode: barcode, error: true });
      }
    }

    return results;
  }
}
