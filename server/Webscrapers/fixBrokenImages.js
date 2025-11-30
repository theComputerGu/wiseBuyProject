const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://192.168.199.122:3000";
const SAVE_FOLDER = path.join(__dirname, "..", "uploads", "products");

const BROKEN_PRODUCTS = [
  {
    title: "תח.רחצה יוגורט שקדים700מ",
    itemcode: "7290117860991",
  },
  {
    title: "מרכך מטפח לשיער רגיל650מ",
    itemcode: "7290117860090",
  },
];

// CHP main domain (SAFE)
const SAFE_CDN = "https://www.chp.co.il/images/items";

// Fetch HTML (not critical now, fallback always exists)
async function fetchProductPage(itemcode) {
  const url = `https://www.chp.co.il/קריית%20אונו/0/0/${itemcode}`;
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch (e) {
    console.log(`❌ Failed fetching HTML for ${itemcode}`);
    return null;
  }
}

// Extract <img> from HTML if exists
function extractImage(html) {
  if (!html) return null;

  const dataUriMatch = html.match(/data-uri="([^"]+)"/);
  if (dataUriMatch) return dataUriMatch[1];

  const imgMatch = html.match(/<img[^>]*src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];

  return null;
}

// Normalize image URL
function normalizeUrl(src) {
  if (!src) return null;

  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return "https://www.chp.co.il" + src;

  return `${SAFE_CDN}/${src}`;
}

// Download image
async function downloadImage(url, itemcode) {
  fs.mkdirSync(SAVE_FOLDER, { recursive: true });

  try {
    const resp = await axios.get(url, { responseType: "arraybuffer" });

    if (resp.status !== 200 || resp.data.length < 1000) {
      console.log(`❌ invalid image for ${itemcode}`);
      return null;
    }

    const filename = `${itemcode}.jpg`;
    const savePath = path.join(SAVE_FOLDER, filename);

    fs.writeFileSync(savePath, resp.data);

    console.log(`✔ Saved image → ${savePath}`);
    return filename;
  } catch (e) {
    console.log(`❌ Failed downloading ${url}`);
    return null;
  }
}

// Update DB
async function updateProduct(itemcode, filename) {
  const imageUrl = `${API_URL}/uploads/products/${filename}`;

  try {
    await axios.patch(`${API_URL}/${itemcode}`, { image: imageUrl });
    console.log(`✔ Updated DB → ${itemcode}`);
  } catch (e) {
    console.log(`❌ Failed DB update for ${itemcode}`, e.response?.data);
  }
}

async function fixBrokenImages() {
  for (const product of BROKEN_PRODUCTS) {
    console.log(`\n==============================`);
    console.log(`📌 Fixing ${product.title} (${product.itemcode})`);
    console.log(`==============================`);

    const html = await fetchProductPage(product.itemcode);

    let src = extractImage(html);

    if (!src) {
      console.log("⚠ No image tag — using SAFE CHP CDN...");
      src = `${SAFE_CDN}/${product.itemcode}.jpg`;
    }

    const normalized = normalizeUrl(src);
    console.log("→ Image URL:", normalized);

    const file = await downloadImage(normalized, product.itemcode);

    if (file) {
      await updateProduct(product.itemcode, file);
    } else {
      console.log(`❌ Could not fix ${product.itemcode}`);
    }
  }

  console.log("\n✨ Done");
}

fixBrokenImages();
