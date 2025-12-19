const fs = require("fs");

const INPUT_FILE  = "wisebuy.products.updated3.json";
const OUTPUT_FILE = "wisebuy.products.cleaned.json";

// 🔥 סף לזיהוי תמונת רובוט
const MIN_IMAGE_BYTES = 500;

async function isRobotImage(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const length = Number(res.headers.get("content-length") || 0);

    return length < MIN_IMAGE_BYTES;
  } catch (err) {
    // שגיאה = נחשיב כתמונה לא תקינה
    return true;
  }
}

async function cleanProducts() {
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  const kept = [];
  const removed = [];

  for (const product of products) {
    if (!product.image) {
      removed.push({ ...product, reason: "no image" });
      continue;
    }

    const isRobot = await isRobotImage(product.image);

    if (isRobot) {
      removed.push({ ...product, reason: "robot image (small size)" });
    } else {
      kept.push(product);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(kept, null, 2));

  console.log("✅ Cleaning finished");
  console.log(`🟢 Kept: ${kept.length}`);
  console.log(`🔴 Removed: ${removed.length}`);
}

cleanProducts();
