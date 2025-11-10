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

  // ✅ Create user
  async create(data: Partial<User>): Promise<User> {
    const user = new this.userModel(data);
    return user.save();
  }

  // ✅ Get all users
  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('groups').exec();
  }

  // ✅ Get one user by ID
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).populate('groups').exec();
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // ✅ Add group to user
  async addGroup(userId: string, groupId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { groups: new Types.ObjectId(groupId) } },
        { new: true },
      )
      .populate('groups');

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    await this.groupModel.findByIdAndUpdate(groupId, {
      $addToSet: { users: new Types.ObjectId(userId) },
    });

    return user;
  }

  // ✅ Get user groups
  async findUserGroups(userId: string): Promise<Group[]> {
    const user = await this.userModel.findById(userId).populate('groups').exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user.groups as unknown as Group[];
  }

  // ✅ Delete user
  async delete(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }

  // ✅ Login
  async login(email: string, password: string) {
    const user = (await this.userModel.findOne({ email }).exec()) as
      | UserDocument
      | null;

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
    };
  }

  // ✅ Update user (name/email/password/avatar)
  async update(id: string, patch: Partial<User>) {
    // נעדכן רק שדות מותרים
    const allowed: Partial<User> = {};

    if (typeof patch.name === 'string') allowed.name = patch.name;
    if (typeof patch.email === 'string') allowed.email = patch.email;
    if (typeof patch.password === 'string') allowed.password = patch.password;
    if (typeof patch.avatarUrl === 'string') allowed.avatarUrl = patch.avatarUrl; // ✅ חשוב מאוד

    const updated = await this.userModel
      .findByIdAndUpdate(id, allowed, { new: true, runValidators: true })
      .exec();

    if (!updated) throw new NotFoundException(`User with ID ${id} not found`);

    // ✅ נחזיר אובייקט נקי, כולל תמונה
    return {
      _id: updated.id,
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl || null,
      createdAt: (updated as any).createdAt,
      updatedAt: (updated as any).updatedAt,
    };
  }
}
