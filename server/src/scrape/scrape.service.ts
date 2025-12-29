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
    const stores: StoreOffer[] = [];

    for (const row of raw) {
      if (row.length < 5) continue;

      const chain = row[0];
      const address = row[2];

      const priceText =
        row[5]?.trim() ||
        row[4]?.trim() ||
        null;

      if (!priceText) continue;

      const match = priceText.match(/([\d.]+)/);
      if (!match) continue;

      stores.push({
        chain,
        address,
        price: Number(match[1]),
        lastUpdated: new Date(),
      });
    }

    return stores;
  }

  // =========================
  // Scrape single product
  // =========================
  async scrapeOne(
    barcode: string,
    city: string,
  ): Promise<StoreOffer[]> {
    const cmd = `"${this.PYTHON}" "${this.SCRIPT}" "${barcode}" "${city}"`;

    try {
      const stdout = await this.execScraper(cmd);
      const parsed = JSON.parse(stdout);

      const stores = this.parseStores(parsed.stores);

      if (!stores.length) {
        throw new Error("No stores found");
      }

      return stores;
    } catch (e) {
      throw new InternalServerErrorException(
        "Scraping failed",
      );
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
