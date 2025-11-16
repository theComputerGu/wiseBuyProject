import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private model: Model<Product>) {}

  async findAll(filters: any = {}) {
    const query: any = {};

    if (filters.q) {
      query.title = { $regex: filters.q, $options: 'i' };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.brand) {
      query.brand = filters.brand;
    }

    return this.model.find(query).exec();
  }

  findOne(id: string) {
    return this.model.findById(id).exec();
  }

  create(body: any) {
    return this.model.create(body);
  }

  update(id: string, body: any) {
    return this.model.findByIdAndUpdate(id, body, { new: true }).exec();
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
