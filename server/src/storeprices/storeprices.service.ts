import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorePrice, StorePriceDocument } from './schemas/storeprices.schema';

@Injectable()
export class storePricesService {
    constructor(
        @InjectModel(StorePrice.name)
        private storePriceModel: Model<StorePriceDocument>,
    ) {}


    async addPrice(productId: string, storeId: string, price: number) {
     
        const existing = await this.storePriceModel.findOne({
            productId: new Types.ObjectId(productId),
            storeId: new Types.ObjectId(storeId),
        });

        if (existing) {
            existing.price = price;
            existing.updatedAtXml = new Date();
            return existing.save();
        }

      
        const created = new this.storePriceModel({
            productId: new Types.ObjectId(productId),
            storeId: new Types.ObjectId(storeId),
            price,
            updatedAtXml: new Date(),
        });

        return created.save();
    }

   
    async updatePrice(id: string, price: number) {
        const updated = await this.storePriceModel
            .findByIdAndUpdate(
                id,
                { price, updatedAtXml: new Date() },
                { new: true }
            )
            .exec();

        if (!updated) {
            throw new NotFoundException(`StorePrice with id ${id} not found`);
        }

        return updated;
    }


    async delete(id: string) {
        return this.storePriceModel.findByIdAndDelete(id);
    }


    async getPricesForProduct(productId: string) {
        return this.storePriceModel
            .find({ productId: new Types.ObjectId(productId) })
            .populate('storeId');
    }

  
    async compare(productId: string) {
        const prices = await this.getPricesForProduct(productId);

        if (!prices.length) throw new NotFoundException('No prices found');

        const cheapest = prices.reduce((a, b) =>
            a.price < b.price ? a : b
        );

        return {
            productId,
            prices,
            cheapest,
        };
    }
}
