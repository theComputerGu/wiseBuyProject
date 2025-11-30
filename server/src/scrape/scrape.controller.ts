import { Controller, Get, Param } from "@nestjs/common";
import { exec } from "child_process";

@Controller("scrape")
export class ScrapeController {

    // --------------------------
    // GET PRICE
    // --------------------------
    @Get("price/:barcode/:city")
    async getPrice(
        @Param("barcode") barcode: string,
        @Param("city") city: string
    ) {
        return new Promise((resolve) => {
            exec(
                `python3 ./Webscrapers/chpscrapperPrice.py ${barcode} ${city}`,
                { encoding: "utf8" },
                (error, stdout) => {
                    if (error) {
                        console.log("Python Error:", error);
                        return resolve({ price: null, error: "scraper failed" });
                    }

                    try {
                        const data = JSON.parse(stdout);
                        resolve(data);
                    } catch {
                        resolve({ price: stdout });
                    }
                }
            );
        });
    }

    // --------------------------
    // GET STORES
    // --------------------------
    @Get("stores/:barcode/:city")
    async getStores(
        @Param("barcode") barcode: string,
        @Param("city") city: string
    ) {
        return new Promise((resolve) => {
            exec(
                `python3 ./Webscrapers/chpscrapperShops.py ${barcode} ${city}`,
                { encoding: "utf8" },
                (error, stdout) => {
                    if (error) {
                        console.log("Python Error:", error);
                        return resolve({ stores: null, error: "scraper failed" });
                    }

                    try {
                        resolve(JSON.parse(stdout));
                    } catch {
                        resolve({ stores: null, raw: stdout });
                    }
                }
            );
        });
    }
}
