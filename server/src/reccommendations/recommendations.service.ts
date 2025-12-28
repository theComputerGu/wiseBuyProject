import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { exec } from "child_process";
import * as path from "path";

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

import {
    Recommendation,
    RecommendationEngineInput,
    RecommendationEngineOutput,
    PythonRecommendation,
} from "./types/recommendation.types";

@Injectable()
export class RecommendationsService {
    private readonly PYTHON = path.join(
        process.cwd(),
        "venv",
        "Scripts",
        "python.exe"
    );

    private readonly SCRIPT = path.join(
        process.cwd(),
        "Webscrapers",
        "recommendation_engine.py"
    );

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Group.name)
        private groupModel: Model<GroupDocument>,

        @InjectModel(ShoppingList.name)
        private shoppingListModel: Model<ShoppingListDocument>,

        @InjectModel(Product.name)
        private productModel: Model<ProductDocument>
    ) { }

    /**
     * Call Python ML engine with data via stdin
     */
    private callPythonEngine(input: RecommendationEngineInput): Promise<RecommendationEngineOutput> {
        return new Promise((resolve, reject) => {
            const childProcess = exec(
                `"${this.PYTHON}" "${this.SCRIPT}"`,
                { maxBuffer: 10 * 1024 * 1024 },
                (err, stdout, stderr) => {
                    if (err) {
                        console.error("Python engine error:", stderr);
                        return reject(new Error(stderr || err.message));
                    }

                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (parseErr) {
                        reject(new Error(`Failed to parse Python output: ${stdout}`));
                    }
                }
            );

            // Send input data via stdin
            childProcess.stdin?.write(JSON.stringify(input));
            childProcess.stdin?.end();
        });
    }

    /**
     * Get all shopping lists for co-occurrence analysis
     */
    private async getAllShoppingLists(): Promise<Array<{ items: Array<{ productId: string }> }>> {
        const lists = await this.shoppingListModel.find().lean();

        return lists.map(list => ({
            items: (list.items || []).map(item => ({
                productId: item._id.toString()
            }))
        }));
    }

    /**
     * Get user's purchase history from group history (includes category for restock)
     */
    private async getUserHistory(groupIds: Types.ObjectId[]): Promise<Array<{ productId: string; purchasedAt: string; category?: string }>> {
        const groups = await this.groupModel.find({ _id: { $in: groupIds } }).lean();
        const history: Array<{ productId: string; purchasedAt: string; category?: string }> = [];

        // Collect all product IDs first
        const allProductIds: Types.ObjectId[] = [];
        const purchaseData: Array<{ productId: Types.ObjectId; purchasedAt: Date }> = [];

        for (const group of groups) {
            for (const purchase of group.history || []) {
                if (!purchase.shoppingListId) continue;

                const list = await this.shoppingListModel.findById(purchase.shoppingListId).lean();
                if (!list) continue;

                for (const item of list.items || []) {
                    allProductIds.push(item._id);
                    purchaseData.push({
                        productId: item._id,
                        purchasedAt: purchase.purchasedAt
                    });
                }
            }
        }

        // Fetch all products to get categories
        const products = await this.productModel.find({ _id: { $in: allProductIds } }).lean();
        const categoryMap = new Map(
            products.map(p => [(p._id as Types.ObjectId).toString(), p.category])
        );

        // Build history with categories
        for (const purchase of purchaseData) {
            history.push({
                productId: purchase.productId.toString(),
                purchasedAt: purchase.purchasedAt.toISOString(),
                category: categoryMap.get(purchase.productId.toString())
            });
        }

        return history;
    }

    /**
     * Get all purchases across all groups for popularity calculation
     */
    private async getAllPurchases(): Promise<Array<{ productId: string; purchasedAt: string }>> {
        const groups = await this.groupModel.find().lean();
        const purchases: Array<{ productId: string; purchasedAt: string }> = [];

        for (const group of groups) {
            for (const purchase of group.history || []) {
                if (!purchase.shoppingListId) continue;

                const list = await this.shoppingListModel.findById(purchase.shoppingListId).lean();
                if (!list) continue;

                for (const item of list.items || []) {
                    purchases.push({
                        productId: item._id.toString(),
                        purchasedAt: purchase.purchasedAt.toISOString()
                    });
                }
            }
        }

        return purchases;
    }

    /**
     * Get all product IDs for ML prediction candidates
     */
    private async getAllProductIds(): Promise<string[]> {
        const products = await this.productModel.find().select('_id').lean();
        return products.map(p => (p._id as Types.ObjectId).toString());
    }

    /**
     * Enrich Python recommendations with product details
     */
    private async enrichRecommendations(pythonRecs: PythonRecommendation[]): Promise<Recommendation[]> {
        const productIds = pythonRecs.map(r => new Types.ObjectId(r.productId));
        const products = await this.productModel.find({ _id: { $in: productIds } }).lean();

        const productMap = new Map(
            products.map(p => [(p._id as Types.ObjectId).toString(), p])
        );

        const recommendations: Recommendation[] = [];

        for (const rec of pythonRecs) {
            const product = productMap.get(rec.productId);
            if (!product) continue;

            recommendations.push({
                productId: rec.productId,
                itemcode: product.itemcode || '',
                title: product.title,
                category: product.category,
                image: product.image,
                brand: product.brand,
                score: rec.score,
                reason: rec.reason,
                strategy: rec.strategy,
            });
        }

        return recommendations;
    }

    /**
     * Main method: Get ML-powered recommendations for a user
     */
    async getByUserId(userId: string): Promise<Recommendation[]> {
        const userObjectId = new Types.ObjectId(userId);

        // 1. Load user
        const user = await this.userModel.findById(userObjectId).lean();
        if (!user) {
            return [];
        }

        // 2. Load current cart items
        let cartProductIds: string[] = [];

        if (user.activeGroup) {
            const group = await this.groupModel.findById(user.activeGroup).lean();

            if (group?.activeshoppinglist) {
                const list = await this.shoppingListModel.findById(group.activeshoppinglist).lean();

                if (list?.items) {
                    cartProductIds = list.items.map(item => item._id.toString());
                }
            }
        }

        // 3. Gather data for ML engine
        const [allShoppingLists, userHistory, allPurchases, allProducts] = await Promise.all([
            this.getAllShoppingLists(),
            this.getUserHistory(user.groups || []),
            this.getAllPurchases(),
            this.getAllProductIds()
        ]);

        // 4. If no data, return empty
        if (!allShoppingLists.length && !userHistory.length && !allPurchases.length) {
            return [];
        }

        // 5. Call Python ML engine
        const input: RecommendationEngineInput = {
            cartProductIds,
            allShoppingLists,
            userHistory,
            allPurchases,
            allProducts,
            limit: 15
        };

        try {
            const result = await this.callPythonEngine(input);

            if (result.error) {
                console.error("ML engine error:", result.error);
                return [];
            }

            // 6. Enrich with product details
            return this.enrichRecommendations(result.recommendations);
        } catch (error) {
            console.error("Failed to get recommendations:", error);
            return [];
        }
    }
}
