// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Injectable()
export class ProductsService {
constructor(@InjectModel(Product.name) private model: Model<ProductDocument>) {}


async create(dto: CreateProductDto) {
const doc = new this.model({ ...dto });
await doc.save();
return doc;
}


async findAll(query: { q?: string; category?: string; minPrice?: number; maxPrice?: number }) {
const filter: FilterQuery<ProductDocument> = {};
if (query.category) filter.category = query.category;
if (query.q) filter.title = { $regex: query.q, $options: 'i' };
if (query.minPrice !== undefined || query.maxPrice !== undefined) {
filter.price = {} as any;
if (query.minPrice !== undefined) (filter.price as any).$gte = query.minPrice;
if (query.maxPrice !== undefined) (filter.price as any).$lte = query.maxPrice;
}
return this.model.find(filter).sort({ createdAt: -1 }).exec();
}


async findOne(id: string) {
const doc = await this.model.findById(id).exec();
if (!doc) throw new NotFoundException('Product not found');
return doc;
}


async update(id: string, dto: UpdateProductDto) {
const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
if (!doc) throw new NotFoundException('Product not found');
return doc;
}


async remove(id: string) {
const res = await this.model.findByIdAndDelete(id).exec();
if (!res) throw new NotFoundException('Product not found');
return { ok: true };
}
}