import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/groups.schema';
import { User, UserDocument } from '../users/schemas/users.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(data: { name: string; adminId: string }) {
    const groupcode = Math.floor(10000 + Math.random() * 90000).toString();

    const group = new this.groupModel({
      name: data.name,
      admin: data.adminId,
      users: [data.adminId],
      groupcode,
      shoppingList: [],
      history: [],
    });

    return group.save();
  }

  async findAll() {
    return this.groupModel
      .find()
      .populate('users', 'name email avatarUrl')
      .populate('admin', 'name email avatarUrl')
      .exec();
  }

  async findOne(id: string) {
    const group = await this.groupModel
      .findById(id)
      .populate('users', 'name email avatarUrl')
      .populate('admin', 'name email avatarUrl')
      .exec();

    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async findUsers(id: string) {
    const group = await this.groupModel
      .findById(id)
      .populate('users', 'name email avatarUrl')
      .exec();
    return group ? group.users : [];
  }

  async findByCode(code: string) {
    const group = await this.groupModel
      .findOne({ groupcode: code })
      .populate('users', 'name email avatarUrl')
      .populate('admin', 'name email avatarUrl')
      .exec();

    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async addUserToGroup(groupId: string, userId: string) {
    return this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $addToSet: { users: new Types.ObjectId(userId) } },
        { new: true },
      )
      .populate('users', 'name email avatarUrl')
      .populate('admin', 'name email avatarUrl')
      .exec();
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


  // ================================================
  //  UPDATE ACTIVE SHOPPING LIST OF GROUP (CORRECT)
  // ================================================
  async updateActiveList(groupId: string, listId: Types.ObjectId | null) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    group.activeshoppinglist = listId;  // either a listId or null
    await group.save();

    return group;
  }

//  ADD SHOPPING LIST TO GROUP HISTORY 
async addToHistory(name :string ,groupId: string, list: any) {
  const group = await this.groupModel.findById(groupId);
  if (!group) throw new NotFoundException("Group not found");

  group.history.push({
    name: name,
    shoppingListId: list._id,
    purchasedAt: new Date(),
    storeId: list.storeId,
  });

  // Clear the active shopping list
  group.activeshoppinglist = null;

  await group.save();

  return group;
}
}
