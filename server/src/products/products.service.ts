import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly model: Model<ProductDocument>) {}

  async findAll(filter?: {
    q?: string; category?: string; minPrice?: number; maxPrice?: number;
  }) {
    const query: any = {};
    if (filter?.q) query.title = { $regex: filter.q, $options: 'i' };
    if (filter?.category) query.category = filter.category;
    if (filter?.minPrice != null || filter?.maxPrice != null) {
      query.price = {};
      if (filter.minPrice != null) query.price.$gte = filter.minPrice;
      if (filter.maxPrice != null) query.price.$lte = filter.maxPrice;
    }
    return this.model.find(query).lean().exec();
  }
}
