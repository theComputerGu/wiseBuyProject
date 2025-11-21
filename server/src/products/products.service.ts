import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from '../products/dto/product.dto';

@Injectable()
export class ProductsService {

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  // CREATE
  async create(dto: CreateProductDto): Promise<Product> {
    const created = new this.productModel(dto);
    return created.save();
  }

  // FIND ALL (with filters)
  async findAll(query: any): Promise<Product[]> {
    const filter: any = {};

    if (query.q) {
      filter.title = { $regex: query.q, $options: 'i' };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.brand) {
      filter.brand = query.brand;
    }

    return this.productModel.find(filter).exec();
  }

  // FIND BY ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  // GET /products/:itemcode
  async finditemcode(itemcode: string): Promise<Product> {
    const product = await this.productModel.findOne({ itemcode }).exec();

    if (!product) {
      throw new NotFoundException(
        `Product with itemcode '${itemcode}' not found`,
      );
    }
    return product;
  }

  // UPDATE
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updated;
  }

  // DELETE
  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Product with ID ${id} not found`);
    return { deleted: true };
  }
}
