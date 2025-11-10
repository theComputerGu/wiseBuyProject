import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { UserDto } from './dto/user.dto';

// ✨ פונקציה עוזרת שממירה מסמך מונגוס ל-UserDto
function toUserDto(doc: any): UserDto {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  return {
    _id: obj._id?.toString(),
    name: obj.name,
    email: obj.email,
    groups: Array.isArray(obj.groups)
      ? obj.groups.map((g: any) => (g?._id ? g._id.toString() : g.toString()))
      : [],
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<UserDto> { // ✅ מחזיר DTO
    const doc = await this.usersService.create({ name, email, password });
    return toUserDto(doc); // ✅ מיפוי ל-DTO
  }

  @Get()
  async findAll(): Promise<UserDto[]> { // ✅ מחזיר מערך DTO
    const docs = await this.usersService.findAll();
    return docs.map(toUserDto); // ✅
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDto> { // ✅
    const doc = await this.usersService.findOne(id);
    return toUserDto(doc); // ✅
  }

  @Patch(':userId/add-group/:groupId')
  async addGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<UserDto> { // ✅ גם כאן נחזיר את המשתמש המעודכן כ-DTO
    const doc = await this.usersService.addGroup(userId, groupId);
    return toUserDto(doc); // ✅
  }

  @Get(':id/groups')
  async getUserGroups(@Param('id') id: string) {
    // אפשר להשאיר כמו שיש אצלך, כי זה מחזיר "קבוצות" ולא User
    // אם תרצה DTO גם לקבוצות — נאמר לי ואכין GroupDto ותיעול.
    return this.usersService.findUserGroups(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // מקובל להחזיר 204/אובייקט סטטוס; משאיר כמו אצלך
    return this.usersService.delete(id);
  }

  // 🔐 Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // תוצר לוגין אצלך לא בהכרח UserDto (לרוב Token + user וכו')
    // לכן השארתי כפי שהוא.
    return this.usersService.login(dto.email, dto.password);
  }

  // ✅ Update user
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; password?: string },
  ): Promise<UserDto> { // ✅
    const doc = await this.usersService.update(id, body);
    return toUserDto(doc); // ✅
  }
}
