import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorePrice, StorePriceDocument } from './schemas/storeprices.schema';

@Injectable()
export class storePricesService {
    constructor(
        @InjectModel(StorePrice.name)
        private storePriceModel: Model<StorePriceDocument>,
    ) { }



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

        const cheapest = prices.reduce((a, b) => (a.price < b.price ? a : b));

        return {
            productId,
            prices,
            cheapest,
        };
    }
}
