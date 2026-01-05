const API_URL = "http://localhost:3000";
const ADDRESS_KEY = "32.0669,34.8359"; // נחשוני יהודה, בני ברק

const CATEGORIES = [
  "מוצרי קירור וביצים",
  "עוף בשר ודגים",
  "שימורים",
  "מעדנייה וסלטים",
  "משקאות ויין",
  "חטיפים וממתקים",
  "פארם ותינוקות",
  "הכל לבית",
  "אחר",
];

const BATCH_SIZE = 5;

async function getProductsByCategory(category: string) {
  // ⚠️ תעדכן פה לנתיב האמיתי אצלך
  const url = `${API_URL}/products?category=${encodeURIComponent(category)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetching products for ${category}`);

  const data = await res.json();

  // מצפה למבנה: [{ _id: { itemcode } }] או [{ itemcode }]
  return data;
}

function extractItemcode(p: any): string | null {
  return p?.itemcode ?? p?._id?.itemcode ?? null;
}

async function resolveBatch(itemcodes: string[]) {
  const res = await fetch(`${API_URL}/stores/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addressKey: ADDRESS_KEY, itemcodes }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function warmupCategory(category: string) {
  console.log(`\n🔥 START CATEGORY: ${category}`);

  const products = await getProductsByCategory(category);

  const itemcodes = products
    .map(extractItemcode)
    .filter((x: any): x is string => Boolean(x));

  console.log(`📦 Total products: ${itemcodes.length}`);

  for (let i = 0; i < itemcodes.length; i += BATCH_SIZE) {
    const batch = itemcodes.slice(i, i + BATCH_SIZE);
    console.log(`➡️ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(itemcodes.length / BATCH_SIZE)} | ${batch.length} items`);

    await resolveBatch(batch);
  }

  console.log(`✅ FINISHED CATEGORY: ${category}`);
}

async function main() {
  console.log("🚀 WARMUP STARTED");

  for (const category of CATEGORIES) {
    try {
      await warmupCategory(category);
    } catch (err) {
      console.error(`❌ CATEGORY FAILED: ${category}`);
      console.error(err);
    }
  }

  console.log("\n🎉 ALL CATEGORIES COMPLETED");
}

main();
