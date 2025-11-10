import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.usersService.create({ name, email, password });
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':userId/add-group/:groupId')
  async addGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.usersService.addGroup(userId, groupId);
  }

  @Get(':id/groups')
  async getUserGroups(@Param('id') id: string) {
    return this.usersService.findUserGroups(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  // 🔐 NEW: /users/login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto.email, dto.password);
  }
}
