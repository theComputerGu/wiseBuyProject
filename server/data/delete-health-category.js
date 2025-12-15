const fs = require("fs");

// =======================
// Load data
// =======================
const products = JSON.parse(
  fs.readFileSync("wisebuy.products.updated3.json", "utf8")
);

// =======================
// CONFIG
// =======================
const FROM_CATEGORY = "מעדנייה סלטים ";
const TO_CATEGORY   = "מעדנייה וסלטים";

// =======================
// Run
// =======================
let changed = 0;

const updated = products.map(p => {
  if (p.category === FROM_CATEGORY) {
    changed++;
    return {
      ...p,
      category: TO_CATEGORY,
    };
  }

  // כל השאר נשארים כמו שהם
  return p;
});

// =======================
// Save
// =======================
fs.writeFileSync(
  "wisebuy.products.updated3.json",
  JSON.stringify(updated, null, 2)
);

// =======================
// Report
// =======================
console.log("✅ Category rename complete");
console.log(`✏️ Renamed: "${FROM_CATEGORY}" → "${TO_CATEGORY}"`);
console.log(`📦 Products updated: ${changed}`);
