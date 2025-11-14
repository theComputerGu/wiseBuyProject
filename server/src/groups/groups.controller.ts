// src/groups/groups.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('adminId') adminId: string,
  ) {
    return this.groupsService.create({ name, adminId });
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Get('code/:groupcode')
  findByCode(@Param('groupcode') code: string) {
    return this.groupsService.findByCode(code);
  }

  @Get(':id/users')
  getUsers(@Param('id') id: string) {
    return this.groupsService.findUsers(id);
  }

  @Patch(':id/add-user')
  addUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.groupsService.addUserToGroup(id, userId);
  }

  @Patch(':id/remove-user')
  removeUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.groupsService.removeUserFromGroup(id, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Body('requesterId') requesterId: string) {
    return this.groupsService.delete(id, requesterId);
  }
}
