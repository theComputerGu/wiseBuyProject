const axios = require("axios");

const API_URL = "http://192.168.199.122:3000";

const categories = [
  "meats", "dairy", "drinks", "snacks", "sauces", "cosmetics",
  "hygiene", "cereals", "frozen", "fruits", "other"
];

async function imageExists(url) {
  try {
    await axios.head(url);
    return true;
  } catch (e) {
    return false;
  }
}

async function checkBrokenImages() {
  const results = {};

  for (const category of categories) {
    console.log(`\n🔍 Checking category: ${category}`);

    const { data: products } = await axios.get(`${API_URL}/products`, {
      params: { category }
    });

    let brokenCount = 0;

    for (const product of products) {
      const imgUrl = product.image;
      const ok = await imageExists(imgUrl);

      if (!ok) {
        brokenCount++;

        console.log(
          `❌ Missing image → "${product.title}" | itemcode: ${product.itemcode}`
        );
      }
    }

    results[category] = brokenCount;
    console.log(`📌 Category "${category}" has ${brokenCount} broken images`);
  }

  console.log("\n===========================");
  console.log("📊 SUMMARY");
  console.log("===========================");
  console.log(results);
}

checkBrokenImages();
