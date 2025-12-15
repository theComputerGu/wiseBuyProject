const fs = require("fs");

// =======================
// Load data
// =======================
const products = JSON.parse(
  fs.readFileSync("wisebuy.products.updated3.json", "utf8")
);

// =======================
// CONFIG – מה אנחנו משפרים עכשיו?
// =======================
const TARGET_CATEGORY = "חטיפים וממתקים";

const KEYWORDS = [
  "מוצי"

];

// =======================
// Normalize helper
// =======================
function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[\"׳״]/g, "")
    .replace(/[^\p{L}\p{N}\s%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================
// Match function
// =======================
function matchesCategory(title) {
  const t = normalize(title);
  return KEYWORDS.some(k => t.includes(k));
}

// =======================
// Run (SAFE MODE)
// =======================
let changed = 0;

const updated = products.map(p => {
  if (matchesCategory(p.title)) {
    if (p.category !== TARGET_CATEGORY) {
      changed++;
      return {
        ...p,
        category: TARGET_CATEGORY,
      };
    }
  }

  // ❗ כל השאר – נשארים כמו שהם
  return p;
});

// =======================
// Save
// =======================
fs.writeFileSync(
  "wisebuy.products.updated3.json",
  JSON.stringify(updated, null, 2)
);

console.log("✅ Focused categorization done");
console.log(`🎯 Target category: ${TARGET_CATEGORY}`);
console.log(`✏️ Products updated: ${changed}`);
