import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/groups.schema';
import { User, UserDocument } from '../users/schemas/users.schema';
import { ShoppingListsService } from '../shoppinglist/shopping-lists.service'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private groupModel: Model<GroupDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    

    private shoppingListService: ShoppingListsService,
  ) { }

  async create(data: { name: string; adminId: string; isDefault?: boolean }) {

    const groupcode = Math.floor(10000 + Math.random() * 90000).toString();
    const defaultList = await this.shoppingListService.create()
    const group = new this.groupModel({
      name: data.name,
      admin: data.adminId,
      users: [data.adminId],
      groupcode,
      activeshoppinglist: defaultList,
      history: [],
      isDefault: data.isDefault ?? false,   // <----- חדש
    });
    return group.save();
  }

  async findAll() {
    return this.groupModel.find().exec();
  }

  async findOne(id: string) {
    const group = await this.groupModel.findById(id).exec();

    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async findUsers(id: string) {
    const group = await this.groupModel.findById(id).populate("users").exec();
    return group?.users;
  }

  async findByCode(code: string) {
    const group = await this.groupModel
      .findOne({ groupcode: code }).exec();

    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async addUserToGroup(groupId: string, userId: string) {

    const group = await this.groupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { users: new Types.ObjectId(userId) } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: new Types.ObjectId(groupId) } },
    );

    return group;
  }


  async removeUserFromGroup(groupId: string, userId: string) {
    await this.groupModel.findByIdAndUpdate(
      groupId,
      { $pull: { users: new Types.ObjectId(userId) } },
    );

    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { groups: new Types.ObjectId(groupId) } },
    );

    return { success: true };
  }

  async delete(groupId: string, requesterId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    if (group.isDefault) {
      throw new Error('Default personal group cannot be deleted');
    }
    if (group.admin.toString() !== requesterId) {
      throw new Error('Only admin can delete this group');
    }
    await this.groupModel.findByIdAndDelete(groupId);

    await this.userModel.updateMany(
      { groups: groupId },
      { $pull: { groups: groupId } }
    );

    return { deleted: true, groupId };
  }

  async updateActiveList(groupId: string, listId: Types.ObjectId | null) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.activeshoppinglist = listId; 
    await group.save();

    return group;
  }

  // groups.service.ts
  async addToHistory(
  name: string,
  groupId: string,
  storename: string,
  storeadress: string,
  totalprice: number,
  itemcount: number,
  items: { itemcode: string; quantity: number }[],
) {
  const group = await this.groupModel.findById(groupId);
  if (!group || !group.activeshoppinglist) {
    throw new NotFoundException("Group or active list not found");
  }

  // ✅ הרשימה הפעילה (כבר עם populate בפנים)
  const list = await this.shoppingListService.findById(
    group.activeshoppinglist.toString()
  );

  // ✅ יוצרים רשימת קנייה חדשה שתכנס להיסטוריה
  const purchasedList = await this.shoppingListService.create();

  // ✅ מעתיקים רק פריטים שנקנו בפועל
  for (const i of items) {
    const original = list.items.find(
      (x: any) => x._id.itemcode === i.itemcode
    );

    if (!original) continue;

    purchasedList.items.push({
      _id: original._id,
      quantity: i.quantity,
    });
  }

  purchasedList.total = purchasedList.items.reduce(
    (s, i) => s + i.quantity,
    0,
  );

  await purchasedList.save();

  // ✅ היסטוריה
  group.history.push({
    name,
    shoppingListId: purchasedList._id,
    purchasedAt: new Date(),
    storename,
    storeadress,
    totalprice,
    itemcount,
  });

  // ✅ רשימה חדשה ריקה
  const newList = await this.shoppingListService.create();
  group.activeshoppinglist = newList._id;

  await group.save();

  return {
    updatedGroup: group,
    newList,
  };
}





  async getActiveShoppingList(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('activeshoppinglist');

    if (!group) throw new NotFoundException('Group not found');

    return group.activeshoppinglist;
  }


  async getAdmin(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('admin');

    if (!group) throw new NotFoundException('Group not found');

    return group.admin;
  }


  async getHistory(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('history');

    if (!group) throw new NotFoundException('Group not found');

    return group.history;

  }

  async restorePurchase(groupId: string, shoppingListId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    if (!group.activeshoppinglist) {
      throw new NotFoundException("No active shopping list");
    }

    const activeList = await this.shoppingListService.findById(
      group.activeshoppinglist.toString()
    );

    const oldList = await this.shoppingListService.findById(shoppingListId);

    if (!oldList) throw new NotFoundException("Purchase list not found");


    for (const oldItem of oldList.items) {
      const existingItem = activeList.items.find(
        (item) =>
          item._id.toString() === oldItem._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += oldItem.quantity;
      } else {
        activeList.items.push({
          _id: oldItem._id,
          quantity: oldItem.quantity,
        });
      }
    }

    activeList.total = activeList.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    await activeList.save();

    return activeList;
  }

  async gethistorybyid(groupId: string, historyId: string) {
 
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new NotFoundException("Group not found");
    }


    try {
      const history = group.history.find(
        (h) => h.shoppingListId?.toString() === historyId
      );
    } catch {
      throw new NotFoundException("History record not found");
    }

    const list = await this.shoppingListService.findById(historyId)
    if (!list) throw new NotFoundException("List not found");

    return list;
  }
}
