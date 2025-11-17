import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/stores.schema';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name)
    private readonly storeModel: Model<StoreDocument>,
  ) {}

  async create(data: Partial<Store>): Promise<Store> {
    const created = new this.storeModel(data);
    return created.save();
  }

  async findAll(query: any): Promise<Store[]> {
    const filter: any = {};

    if (query.city) filter.city = query.city;
    if (query.ChainId) filter.ChainId = query.ChainId;

    return this.storeModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id).exec();
    if (!store) throw new NotFoundException(`Store with ID ${id} not found`);
    return store;
  }

  async update(id: string, data: Partial<Store>): Promise<Store> {
    const updated = await this.storeModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.storeModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return { deleted: true };
  }
}
