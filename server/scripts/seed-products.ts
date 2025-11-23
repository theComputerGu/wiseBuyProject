import mongoose from "mongoose";
import { ProductSchema, Product } from "../src/products/schemas/product.schema";
import { model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const ProductModel = model<Product>("Product", ProductSchema);

const DB_URI = process.env.DB_URI!;
const API_URL = process.env.API_URL!;

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB");

    const products = [
      {
        itemcode: "1001",
        title: "Chicken Breast",
        category: "meats",
        pricerange: "45₪",
        unit: "kg",
        image: `${API_URL}/uploads/products/chicken-breast.png`,
      },
      {
        itemcode: "2001",
        title: "חלב תנובה",
        category: "milk",
        pricerange: "6₪",
        unit: "liter",
        image: `${API_URL}/uploads/products/milk.png`,
      },
      {
        itemcode: "2002",
        title: "חלב טרה",
        category: "milk",
        pricerange: "6₪",
        unit: "liter",
        image: `${API_URL}/uploads/products/milk2.png`,
      },
    ];

    await ProductModel.deleteMany(); // ניקוי לפני הכנסת נתונים
    await ProductModel.insertMany(products);

    console.log("✅ Products seeded successfully using ENV");
    console.log("✅ API URL used:", API_URL);

    process.exit();
  } catch (err) {
    console.error("❌ Error while seeding:", err);
    process.exit(1);
  }
}

seed();
