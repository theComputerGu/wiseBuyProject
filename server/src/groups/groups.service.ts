// src/groups/groups.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/groups.schema';
import { User, UserDocument } from '../users/schemas/users.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

 //  Create a new group
async create(data: Partial<Group>): Promise<Group> {
  // Generate a random 5-digit code
  const groupcode = Math.floor(10000 + Math.random() * 90000).toString();

  const group = new this.groupModel({ ...data, groupcode });
  return group.save();
}
  //  Get all groups (with user info)
  async findAll(): Promise<Group[]> {
    return this.groupModel.find().populate('users').exec();
  }

  //  Get a specific group by ID
  async findOne(id: string): Promise<Group | null > {
    return this.groupModel.findById(id).populate('users').exec();
  }

  // Get all users
  async findUsers(id: string): Promise<any[] | null> {
  const group = await this.groupModel.findById(id).populate('users').exec();
  return group ? group.users : null;
  }

  //  Find by group code
  async findByCode(groupcode: string): Promise<Group | null> {
    return this.groupModel.findOne({ groupcode }).populate('users').exec();
  }

  //  Add a user to group
  async addUserToGroup(groupId: string, userId: string): Promise<Group | null > {
    return this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $addToSet: { users: userId } },
        { new: true },
      )
      .populate('users');
  }

  //  Delete group
  async delete(groupId: string): Promise<Group | null > {
    return this.groupModel.findByIdAndDelete(groupId).exec();
  }
}
