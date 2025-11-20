import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Group, GroupDocument } from '../groups/schemas/groups.schema';
import { GroupsService } from 'src/groups/groups.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private groupsService: GroupsService,
  ) {}

  private toDto(user: UserDocument) {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      groups: user.groups?.map((g) => g.toString()) ?? [],
      activeGroup: user.activeGroup?.toString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? '',
      updatedAt: user.updatedAt?.toISOString() ?? '',
    };
  }

  // --------------------------
  // CREATE USER
  // --------------------------
  async create(data: { name: string; email: string; passwordPlain: string }) {
    if (!data.passwordPlain) {
      throw new Error('Password is required');
    }

    const hashed = await bcrypt.hash(data.passwordPlain, 10);

    const user = await new this.userModel({
      name: data.name,
      email: data.email,
      password: hashed, // 👉 שומר רק HASH
      groups: [],
    }).save();

    // יצירת קבוצה ראשונית
    const group = await this.groupsService.create({
      name: `${user.name}'s Group`,
      adminId: user._id.toString(),
      isDefault: true,   // <--- חדש
    });

    user.activeGroup = group._id as Types.ObjectId;
    user.groups = [group._id as Types.ObjectId];
    await user.save();

    return this.toDto(user);
  }

  // --------------------------
  // LOGIN USER
  // --------------------------
  async login(email: string, passwordPlain: string) {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.password) throw new UnauthorizedException('Invalid email or password');

    const ok = await bcrypt.compare(passwordPlain, user.password);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    return this.toDto(user);
  }

  // --------------------------
  // UPDATE USER
  // --------------------------
  async update(id: string, patch: any) {
    const allowed: any = {};

    if (patch.name) allowed.name = patch.name;
    if (patch.email) allowed.email = patch.email;

    if (patch.passwordPlain && patch.passwordPlain.trim().length > 0) {
      allowed.password = await bcrypt.hash(patch.passwordPlain, 10);
    }

    if (patch.avatarUrl) allowed.avatarUrl = patch.avatarUrl;
    if (patch.activeGroup) allowed.activeGroup = patch.activeGroup;

    const updated = await this.userModel
      .findByIdAndUpdate(id, allowed, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`User ${id} not found`);

    return this.toDto(updated);
  }

  // --------------------------
  async findAll() {
    const users = await this.userModel.find().exec();
    return users.map((u) => this.toDto(u));
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toDto(user);
  }

  async delete(id: string) {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    return deleted ? this.toDto(deleted) : null;
  }

  // --------------------------
  // ACTIVE GROUP
  // --------------------------
  async setActiveGroup(userId: string, groupId: Types.ObjectId | null) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    user.activeGroup = groupId;
    await user.save();

    return { message: 'Active group updated', activeGroup: user.activeGroup };
  }

  async getActiveGroup(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return { activeGroup: user.activeGroup };
  }


  async findUserGroups(userId: string) {
  const user = await this.userModel
    .findById(userId)
    .populate('groups')       // ✔ מביא את האובייקטים המלאים
    .exec();

  if (!user) throw new NotFoundException(`User ${userId} not found`);

  return user.groups;          // ✔ מחזיר מערך של קבוצות
}



async addGroupToUser(userId: string, groupId: string) {
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  // מוסיף רק אם לא קיים
  if (!user.groups.includes(groupId as any)) {
    user.groups.push(new Types.ObjectId(groupId));
  }

  await user.save();
  return this.toDto(user);
}


}
