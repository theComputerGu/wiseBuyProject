// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Group, GroupDocument } from '../groups/schemas/groups.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    ) { }

    //  Create a new user
    async create(data: Partial<User>): Promise<User> {
        const user = new this.userModel(data);
        return user.save();
    }

    //  Get all users
    async findAll(): Promise<User[]> {
        return this.userModel.find().populate('groups').exec();
    }

    //  Get a single user by ID
    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).populate('groups').exec();
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    //  Add a group to a user
    async addGroup(userId: string, groupId: string): Promise<User> {
        const user = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $addToSet: { groups: new Types.ObjectId(groupId) } },
                { new: true },
            )
            .populate('groups');

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        // Also add the user to the group’s `users` list for consistency
        await this.groupModel.findByIdAndUpdate(groupId, {
            $addToSet: { users: new Types.ObjectId(userId) },
        });

        return user;
    }

    //  Get all groups the user belongs to
    async findUserGroups(userId: string): Promise<Group[]> {
        const user = await this.userModel.findById(userId).populate('groups').exec();
        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
        return (user.groups as any) as Group[];
    }
    //  Delete a user
    async delete(userId: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(userId).exec();
    }
}
