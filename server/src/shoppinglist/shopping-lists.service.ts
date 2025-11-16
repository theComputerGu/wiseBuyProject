import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from './schemas/shopping-list.schema';

@Injectable()
export class ShoppingListsService {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
  ) {}

  // CREATE EMPTY LIST
  async create() {
    const list = await this.shoppingListModel.create({
      items: [],
    });
    return list;
  }

  // GET BY ID
  async findById(id: string) {
    const list = await this.shoppingListModel.findById(id).populate('items.productId');
    if (!list) throw new NotFoundException('Shopping list not found');
    return list;
  }

  // GET ALL
  async findAll() {
    return this.shoppingListModel
      .find()
      .sort({ createdAt: -1 })
      .populate('items.productId');
  }

  // ADD ITEM TO LIST
  async addItem(listId: string, productId: string, quantity: number) {
    const list = await this.shoppingListModel.findById(listId);
    if (!list) throw new NotFoundException('Shopping list not found');

    list.items.push({
      productId: new Types.ObjectId(productId),
      quantity,
    });

    await list.save();
    return list;
  }

  // UPDATE ITEM QUANTITY
  async updateItem(listId: string, itemIndex: number, quantity: number) {
    const list = await this.shoppingListModel.findById(listId);
    if (!list) throw new NotFoundException('Shopping list not found');

    if (!list.items[itemIndex]) {
      throw new NotFoundException('Item index not found');
    }

    list.items[itemIndex].quantity = quantity;

    await list.save();
    return list;
  }

  // REMOVE ITEM
  async removeItem(listId: string, itemIndex: number) {
    const list = await this.shoppingListModel.findById(listId);
    if (!list) throw new NotFoundException('Shopping list not found');

    if (!list.items[itemIndex]) {
      throw new NotFoundException('Item index not found');
    }

    list.items.splice(itemIndex, 1);

    await list.save();
    return list;
  }

  // DELETE LIST
  async delete(listId: string) {
    return this.shoppingListModel.findByIdAndDelete(listId);
  }
}
