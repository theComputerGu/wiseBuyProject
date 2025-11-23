import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from './schemas/shopping-list.schema';
import {ProductsModule} from '../products/products.module'

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
      total: 0,
    });
    return list;
  }

  // GET BY ID
  async findById(id: string) {
    const list = await this.shoppingListModel.findById(id).populate('items._id');
    if (!list) throw new NotFoundException('Shopping list not found');
    return list;
  }

  // GET ALL
  async findAll() {
    return this.shoppingListModel
      .find().populate('items._id');
  }

  // ADD ITEM TO LIST
async addItem(listId: string, productId: string) {
  const list = await this.shoppingListModel.findById(listId);
  if (!list) throw new NotFoundException('Shopping list not found');

  // Convert productId once
  const productObjectId = new Types.ObjectId(productId);

  // 1. Check if the item already exists in the list
  const existingItem = list.items.find(
    (item) => item._id.toString() === productId
  );

  if (existingItem) {
    // 2. If exists → increment quantity
    existingItem.quantity += 1;
  } else {
    // 3. If not exists → push new item
    list.items.push({
      _id: productObjectId,
      quantity: 1,
    });
  }

  // 4. Update total count (sum all quantities)
  list.total = list.items.reduce((sum, item) => sum + item.quantity, 0);

  await list.save();
  return list;
}



  // REMOVE ITEM BY ITEM ID
async removeItem(listId: string, productId: string) {
  const list = await this.shoppingListModel.findById(listId);
  if (!list) throw new NotFoundException('Shopping list not found');

  // Find the item by ID
  const itemIndex = list.items.findIndex(
    (item) => item._id.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new NotFoundException('Item not found');
  }

  const item = list.items[itemIndex];

  // If quantity > 1 → decrease by 1
  if (item.quantity > 1) {
    item.quantity -= 1;
  } 
  // If quantity == 1 → remove item from list
  else {
    list.items.splice(itemIndex, 1);
  }

  // Update total (sum of quantities)
  list.total = list.items.reduce((sum, item) => sum + item.quantity, 0);

  await list.save();
  return list;
}


  // DELETE LIST
  async delete(listId: string) {
    return this.shoppingListModel.findByIdAndDelete(listId);
  }
}
