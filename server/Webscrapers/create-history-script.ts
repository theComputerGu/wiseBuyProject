/*import { connect, model, Types } from "mongoose";

// === Import Schemas ===
import { ShoppingListSchema } from "./src/shoppinglist/schemas/shopping-list.schema";
import { GroupSchema } from "./src/groups/schemas/groups.schema";

async function run() {
  await connect("mongodb://localhost:27017/wisebuy");
  console.log("✓ Connected to MongoDB");

  const ShoppingListModel = model("ShoppingList", ShoppingListSchema);
  const GroupModel = model("Group", GroupSchema);

  // ⭐⭐ קבוצה נכונה ⭐⭐
  const groupId = "6918a03a6cde3098698aeb2e";

  // משתמש אקראי
  const userId = "6917988cedfe25d011a44a83";

  // === 10 מוצרים ===
  const items = [
    { name: "Milk 3%", qty: 2, unit: "unit", price: 6.2 },
    { name: "Chicken Breast", qty: 1, unit: "kg", price: 28 },
    { name: "Bread", qty: 1, unit: "unit", price: 5 },
    { name: "Rice 1kg", qty: 1, unit: "unit", price: 7.9 },
    { name: "Tomatoes", qty: 4, unit: "kg", price: 4.5 },
    { name: "Cucumbers", qty: 5, unit: "unit", price: 1.1 },
    { name: "Orange Juice", qty: 1, unit: "unit", price: 9.9 },
    { name: "Pasta 500g", qty: 2, unit: "unit", price: 6.5 },
    { name: "Eggs XL (12)", qty: 1, unit: "unit", price: 12 },
    { name: "Tuna Can", qty: 3, unit: "unit", price: 4.2 },
  ];

  const mongoItems = items.map(i => ({
    productId: new Types.ObjectId(),
    nameSnapshot: i.name,
    quantity: i.qty,
    unit: i.unit,
    pricePerUnit: i.price,
    lineTotal: i.qty * i.price,
  }));

  const total = mongoItems.reduce((sum, x) => sum + x.lineTotal, 0);

  // === יצירת רשימת קניות ===
  const list = await ShoppingListModel.create({
    groupId,
    userId,
    purchasedAt: new Date(),
    items: mongoItems,
    subtotal: total,
    discountTotal: 0,
    taxTotal: 0,
    total,
    currency: "ILS",
    status: "final",
  });

  console.log("✓ New shopping list created:", list._id);

  // === עדכון היסטוריה בקבוצה ===
  const group = await GroupModel.findById(groupId);
  if (!group) {
    console.error("✗ Group not found");
    process.exit(1);
  }

  group.history.push({
    shoppingListId: list._id,   // חובה!!!
    purchasedAt: list.purchasedAt,
    items: list.items.map((i: any) => ({
      productName: i.nameSnapshot ?? "Unknown",
      quantity: i.quantity,
      price: i.pricePerUnit,
    })),
    total: list.total,
    storeId: undefined,
  });

  await group.save();

  console.log("✓ 10 items added & history updated successfully!");
  process.exit(0);
}

run(); */
