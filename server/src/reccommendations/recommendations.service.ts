import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
    ShoppingList,
    ShoppingListDocument,
} from "../shoppinglist/schemas/shopping-list.schema";

import {
    Product,
    ProductDocument,
} from "../products/schemas/product.schema";

import {
    Group,
    GroupDocument,
} from "../groups/schemas/groups.schema";

import {
    User,
    UserDocument,
} from "../users/schemas/users.schema";

type Recommendation = {
    productId: string;
    itemcode: string;
    title: string;
    category?: string;
    image: string;
    brand?: string;
    score: number;
    reason: string;
};




@Injectable()
export class RecommendationsService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Group.name)
        private groupModel: Model<GroupDocument>,

        @InjectModel(ShoppingList.name)
        private shoppingListModel: Model<ShoppingListDocument>
    ) { }

    async getByUserId(userId: string): Promise<Recommendation[]> {
        const userObjectId = new Types.ObjectId(userId);

        /* =========================
           1️⃣ Load user
        ========================= */
        const user = await this.userModel
            .findById(userObjectId)
            .lean();

        if (!user?.activeGroup) {
            return [];
        }

        /* =========================
           2️⃣ Load group
        ========================= */
        const group = await this.groupModel
            .findById(user.activeGroup)
            .lean();

        if (!group?.activeshoppinglist) {
            return [];
        }

        /* =========================
           3️⃣ Load shopping list
        ========================= */
        const list = await this.shoppingListModel
            .findById(group.activeshoppinglist)
            .populate("items._id") // 🔥 IMPORTANT
            .lean();

        if (!list || !list.items?.length) {
            return [];
        }

        /* =========================
           4️⃣ Map items → recommendations
        ========================= */
        return list.items.map((item: any, index: number) => ({
            productId: item._id._id.toString(),
            itemcode: item._id.itemcode,
            title: item._id.title,
            category: item._id.category,
            image: item._id.image,
            brand: item._id.brand,
            score: 1 - index * 0.01,
            reason: "From your active shopping list",
        }));
    }
}
