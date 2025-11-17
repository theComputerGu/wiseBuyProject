import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Group, GroupDocument } from '../groups/schemas/groups.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}


  private toDto(user: UserDocument) {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      groups: (user.groups ?? []).map((g: any) => g.toString()),
      createdAt: user.createdAt?.toISOString() ?? '',
      updatedAt: user.updatedAt?.toISOString() ?? '',
      defaultGroupId: user.groupID ?? null,
    };
  }


  async create(data: Partial<User>) {
    const user = await new this.userModel(data).save();
    return this.toDto(user);
  }


  async findAll() {
    const users = await this.userModel.find().populate('groups').exec();
    return users.map((u) => this.toDto(u));
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).populate('groups').exec();
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return this.toDto(user);
  }

  async addGroup(userId: string, groupId: string) {
  let user = await this.userModel
    .findByIdAndUpdate(
      userId,
      { $addToSet: { groups: new Types.ObjectId(groupId) } },
      { new: true }
    )
    .populate('groups')
    .exec();

  if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

  await this.groupModel.findByIdAndUpdate(groupId, {
    $addToSet: { users: new Types.ObjectId(userId) },
  });

  if (!user.groupID) {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { defaultGroupId: groupId },
        { new: true }
      )
      .populate('groups')
      .exec();

    if (!updated) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user = updated;
  }

  return this.toDto(user);
}


  async removeGroup(userId: string, groupId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { groups: new Types.ObjectId(groupId) },
    });

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: { users: new Types.ObjectId(userId) },
    });

    const user = await this.userModel.findById(userId).populate('groups').exec();
    if (!user) throw new NotFoundException('User not found');

    return this.toDto(user);
  }


  async findUserGroups(userId: string) {
  const user = await this.userModel
    .findById(userId)
    .populate('groups')
    .exec();

  if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

  return user.groups as any;
}



  async delete(userId: string) {
    const deleted = await this.userModel.findByIdAndDelete(userId).exec();
    return deleted ? this.toDto(deleted) : null;
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).populate('groups').exec();

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.toDto(user);
  }

  async update(id: string, patch: Partial<User>) {
    const allowed: Partial<User> = {};

    if (typeof patch.name === 'string') allowed.name = patch.name;
    if (typeof patch.email === 'string') allowed.email = patch.email;
    if (typeof patch.password === 'string') allowed.password = patch.password;
    if (typeof patch.avatarUrl === 'string') allowed.avatarUrl = patch.avatarUrl;
    if (typeof patch.groupID === 'string') allowed.groupID = patch.groupID;

    const updated = await this.userModel
      .findByIdAndUpdate(id, allowed, {
        new: true,
        runValidators: true,
      })
      .populate('groups')
      .exec();

    if (!updated) throw new NotFoundException(`User with ID ${id} not found`);

    return this.toDto(updated);
  }
}
