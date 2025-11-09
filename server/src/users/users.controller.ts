// src/users/users.controller.ts
import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //  Create new user
  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.usersService.create({ name, email, password });
  }

  //  Get all users
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  //  Get single user by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //  Add user to group
  @Patch(':userId/add-group/:groupId')
  async addGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.usersService.addGroup(userId, groupId);
  }

  //  Get all groups of a user
  @Get(':id/groups')
  async getUserGroups(@Param('id') id: string) {
    return this.usersService.findUserGroups(id);
  }

  //  Delete user
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
