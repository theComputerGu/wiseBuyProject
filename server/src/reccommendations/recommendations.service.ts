import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { exec } from "child_process";
import * as path from "path";
import {ShoppingList,ShoppingListDocument,} from "../shoppinglist/schemas/shopping-list.schema";
import {Product,ProductDocument,} from "../products/schemas/product.schema";
import {Group,GroupDocument,} from "../groups/schemas/groups.schema";
import {User,UserDocument,} from "../users/schemas/users.schema";
import {Recommendation,RecommendationEngineInput,RecommendationEngineOutput,PythonRecommendation,} from "./types/recommendation.types";




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

   


    //getting a lot of things:a lot of data from the DB - like all the shopping lists things like that
    private callPythonEngine(input: RecommendationEngineInput): Promise<RecommendationEngineOutput> {
        return new Promise((resolve, reject) => {
        const childProcess = exec(`"${this.PYTHON}" "${this.SCRIPT}"`,{ maxBuffer: 10 * 1024 * 1024 },(err, stdout, stderr) => {

            if (stderr) {
            console.warn("🐍 Python STDERR:", stderr);
            }

            if (err) {
            console.error("❌ Python process failed:", err.message);
            return reject(new Error(stderr || err.message));
            }


            try {
            const result = JSON.parse(stdout);

            console.log("✅ Parsed Python Result:", result);

            resolve(result);
            } catch (parseErr) {
                console.error("❌ Failed to parse Python output");
                return reject(new Error(`Invalid JSON from Python:\n${stdout}`)
            );
            }
        }
    );

    console.log("📥 Input sent to Python:", input);

    childProcess.stdin?.write(JSON.stringify(input));
    childProcess.stdin?.end();
  });
}




    //getting all the shopping lists in the DB and return just: which products appears together in the shopping lists
    private async getAllShoppingLists(): Promise<Array<{ items: Array<{ productId: string }> }>> {
  
        const lists = await this.shoppingListModel.find().lean();


        console.log("🛒 getAllShoppingLists | total lists:", lists.length);


        if (lists.length > 0) {
            console.log("🛒 Raw shopping list example:", {
            _id: lists[0]._id,
            items: lists[0].items,
            });
        }

        const result = lists.map(list => ({
            items: (list.items || []).map(item => ({
            productId: item._id.toString(),
            })),
        }));


        if (result.length > 0) {
            console.log("🛒 Processed shopping list example:", result[0]);
        }


        console.log("🛒 getAllShoppingLists | result:", result);

        return result;

    }





    //getting all the products that the user buy in all the groups - not just his - all the group
    private async getUserHistory(groupIds: Types.ObjectId[]): Promise<Array<{ productId: string; purchasedAt: string; category?: string }>> {
        const groups = await this.groupModel.find({ _id: { $in: groupIds } }).lean();
        const history: Array<{ productId: string; purchasedAt: string; category?: string }> = [];


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

 
        const products = await this.productModel.find({ _id: { $in: allProductIds } }).lean();
        const categoryMap = new Map(
            products.map(p => [(p._id as Types.ObjectId).toString(), p.category])
        );


        for (const purchase of purchaseData) {
            history.push({
                productId: purchase.productId.toString(),
                purchasedAt: purchase.purchasedAt.toISOString(),
                category: categoryMap.get(purchase.productId.toString())
            });
        }

        return history;
    }





    //get all the purcahses from all the DB - all the histories
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






    //get all the id of all the product in order to know to show the products that will be recommended:
    private async getAllProductIds(): Promise<string[]> {
        const products = await this.productModel.find().select('_id').lean();
        return products.map(p => (p._id as Types.ObjectId).toString());
    }







    // for each product relate it to his category:
    private async getProductsData(): Promise<Array<{ productId: string; category: string }>> {
        const products = await this.productModel.find().select('_id category').lean();
        return products.map(p => ({
            productId: (p._id as Types.ObjectId).toString(),
            category: p.category || 'אחר'
        }));
    }

    






    //changing th eproducts that python gave to products that can be shown
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

  
    




    //funcion that run all the other functions:
    async getByUserId(userId: string): Promise<Recommendation[]> {
        const userObjectId = new Types.ObjectId(userId);

 
        const user = await this.userModel.findById(userObjectId).lean();
        if (!user) {
            return [];
        }


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


        const [allShoppingLists, userHistory, allPurchases, allProducts, productsData] = await Promise.all([
            this.getAllShoppingLists(),
            this.getUserHistory(user.groups || []),
            this.getAllPurchases(),
            this.getAllProductIds(),
            this.getProductsData()
        ]);

 
        if (!allShoppingLists.length && !userHistory.length && !allPurchases.length) {
            return [];
        }

   
        const input: RecommendationEngineInput = {
            cartProductIds,
            allShoppingLists,
            userHistory,
            allPurchases,
            allProducts,
            productsData,
            limit: 15
        };

        try {
            const result = await this.callPythonEngine(input);

            if (result.error) {
                console.error("ML engine error:", result.error);
                return [];
            }

       
            return this.enrichRecommendations(result.recommendations);
        } catch (error) {
            console.error("Failed to get recommendations:", error);
            return [];
        }
    }
}
