// import { Injectable, InternalServerErrorException } from "@nestjs/common";
// import { exec } from "child_process";
// import * as path from "path";
// import { StoreOffer } from "../stores/schemas/stores.schema";

// @Injectable()
// export class ScrapeService {
//   private readonly PYTHON = path.join(
//     process.cwd(),
//     "venv",
//     "Scripts",
//     "python.exe",
//   );

//   private readonly SCRIPT = path.join(
//     process.cwd(),
//     "Webscrapers",
//     "chpscrapperShops.py",
//   );


//   private execScraper(cmd: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       exec(
//         cmd,
//         { maxBuffer: 10 * 1024 * 1024 },
//         (err, stdout, stderr) => {
//           if (err) {
//             return reject(err);
//           }
//           resolve(stdout);
//         },
//       );
//     });
//   }


//   private parseStores(raw: string[][]): StoreOffer[] {

//   const stores: StoreOffer[] = [];

//   for (const row of raw) {


//     if (row.length < 3) continue;

//     const chain = row[0];
//     const address = row[2];

//     let price: number | null = null;

//     for (let i = row.length - 1; i >= 0; i--) {
//       const cell = row[i]?.trim();
   

//       if (!cell) continue;

//       const match = cell.match(/^\d+(\.\d+)?$/);
//       if (match) {
//         price = Number(match[0]);
//         break;
//       }
//     }

//     if (price === null) {
 
//       continue;
//     }

//     stores.push({ chain, address, price, lastUpdated: new Date() });
//   }

//   return stores;
// }




//   async scrapeOne(barcode: string, city: string): Promise<StoreOffer[]> {
//   const cmd = `"${this.PYTHON}" "${this.SCRIPT}" "${barcode}" "${city}"`;



//   try {
//     const stdout = await this.execScraper(cmd);

 

//     const parsed = JSON.parse(stdout);



//     const stores = this.parseStores(parsed.stores);



//     if (!stores.length) {
//       console.warn("⚠️ NO STORES AFTER PARSE", {
//         barcode,
//         city,
//         raw: parsed.stores,
//       });
//       throw new Error("No stores found");
//     }

//     return stores;
//   } catch (e) {
//     console.error("❌ SCRAPE ONE FAILED", {
//       barcode,
//       city,
//       error: e,
//     });

//     throw new InternalServerErrorException("Scraping faileddddd");
//   }
// }


//   async scrapeBatch(
//     barcodes: string[],
//     city: string,
//   ): Promise<
//     {
//       itemcode: string;
//       stores: StoreOffer[];
//     }[]
//   > {

    
//     const results: {itemcode: string;stores: StoreOffer[];}[] = [];

//     for (const barcode of barcodes) {
//       try {
//         const stores =
//           await this.scrapeOne(barcode, city);

//         results.push({
//           itemcode: barcode,
//           stores,
//         });
//       } catch {
//         results.push({
//           itemcode: barcode,
//           stores: [],
//         });
//       }
//     }

//     return results;
//   }
// }
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

  private execScraper(cmd: string): Promise<string> {
    console.log("🐍 EXEC CMD:", cmd);

    return new Promise((resolve, reject) => {
      exec(
        cmd,
        { maxBuffer: 10 * 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) {
            console.error("🐍 PYTHON ERROR:", stderr);
            return reject(err);
          }

          console.log("🐍 PYTHON STDOUT LENGTH:", stdout.length);
          resolve(stdout);
        },
      );
    });
  }

  private parseStores(raw: string[][]): StoreOffer[] {
    console.log("🧾 RAW STORES ROW COUNT:", raw.length);

    const stores: StoreOffer[] = [];

    let droppedShortRow = 0;
    let droppedNoPrice = 0;

    for (const row of raw) {
      console.log("➡️ ROW:", row);

      if (row.length < 3) {
        droppedShortRow++;
        continue;
      }

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
        console.warn("❌ NO PRICE FOUND:", row);
        droppedNoPrice++;
        continue;
      }

      stores.push({ chain, address, price, lastUpdated: new Date() });
    }

    console.log("🧮 PARSE SUMMARY:", {
      totalRows: raw.length,
      parsedStores: stores.length,
      droppedShortRow,
      droppedNoPrice,
    });

    return stores;
  }

  async scrapeOne(barcode: string, city: string): Promise<StoreOffer[]> {
    console.log("🕷️ SCRAPE ONE START:", { barcode, city });

    const cmd = `"${this.PYTHON}" "${this.SCRIPT}" "${barcode}" "${city}"`;

    try {
      const stdout = await this.execScraper(cmd);

      console.log("🐍 RAW STDOUT >>>");
      console.log(stdout);
      console.log("<<< END STDOUT");

      const parsed = JSON.parse(stdout);

      console.log(
        "🐍 PARSED JSON STORES COUNT:",
        parsed?.stores?.length,
      );

      const stores = this.parseStores(parsed.stores);

      console.log(
        "🏪 STORES AFTER PARSE:",
        stores.length,
      );

      if (!stores.length) {
        console.warn("⚠️ NO STORES AFTER PARSE", {
          barcode,
          city,
          rawCount: parsed.stores?.length,
        });
        throw new Error("No stores found");
      }

      console.log("✅ SCRAPE ONE SUCCESS:", {
        barcode,
        storeCount: stores.length,
      });

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
    console.log("🕷️ SCRAPE BATCH START:", {
      barcodesCount: barcodes.length,
      city,
    });

    const results: {
      itemcode: string;
      stores: StoreOffer[];
    }[] = [];

    for (const barcode of barcodes) {
      try {
        const stores = await this.scrapeOne(barcode, city);

        console.log("✅ BATCH ITEM OK:", {
          barcode,
          stores: stores.length,
        });

        results.push({
          itemcode: barcode,
          stores,
        });
      } catch {
        console.warn("⚠️ BATCH ITEM FAILED:", barcode);

        results.push({
          itemcode: barcode,
          stores: [],
        });
      }
    }

    console.log(
      "🏁 SCRAPE BATCH FINISHED:",
      results.map(r => ({
        itemcode: r.itemcode,
        stores: r.stores.length,
      })),
    );

    return results;
  }
}
