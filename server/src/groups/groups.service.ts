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

  async create(data: { name: string; adminId: string;isDefault?: boolean  }) {
   
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

    group.activeshoppinglist = listId;  // either a listId or null
    await group.save();

    return group;
  }

  //  ADD SHOPPING LIST TO GROUP HISTORY 
  async addToHistory(name: string, groupId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException("Group not found");

    group.history.push({
      name: name,
      shoppingListId: group.activeshoppinglist?._id,
      purchasedAt: new Date(),
      storeId: group.activeshoppinglist?._id// will be added later
    });

    // Clear the active shopping list
    group.activeshoppinglist = null;

    await group.save();

    return group;
  }

  //get active shopping list
  async getActiveShoppingList(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('activeshoppinglist');

    if (!group) throw new NotFoundException('Group not found');

    return group.activeshoppinglist;
  }

  //get Group Admin
  async getAdmin(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('admin');

    if (!group) throw new NotFoundException('Group not found');

    return group.admin;
  }

  //get group histroy
  async getHistory(groupId: string) {
    const group = await this.groupModel.findById(groupId).populate('history');

    if (!group) throw new NotFoundException('Group not found');

    return group.history;

  }




  
}
