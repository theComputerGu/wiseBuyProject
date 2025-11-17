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
import { Types } from 'mongoose';
import { get, post } from 'axios';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) { }

  //create group
  @Post()
  async create(
    @Body('name') name: string,
    @Body('adminId') adminId: string,
  ) {
    return this.groupsService.create({ name, adminId });
  }
  //get all groups
  @Get()
  async findAll() {
    return this.groupsService.findAll();
  }
  //get group by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }
  //get group by code
  @Get('code/:groupcode')
  async findByCode(@Param('groupcode') code: string) {
    return this.groupsService.findByCode(code);
  }
  //get users of a specific group
  @Get(':id/users')
  async getUsers(@Param('id') id: string) {
    return this.groupsService.findUsers(id);
  }
  //add user to group
  @Patch(':id/add-user')
  async addUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.groupsService.addUserToGroup(id, userId);
  }
  //remove user from group
  @Patch(':id/remove-user')
  async removeUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.groupsService.removeUserFromGroup(id, userId);
  }
  //delete group
  @Delete(':id')
  async delete(@Param('id') id: string, @Body('requesterId') requesterId: string) {
    return this.groupsService.delete(id, requesterId);
  }

  // set active shopping list
  @Patch(':id/activeshoppinglist')
  async updateActiveList(
    @Param('id') groupId: string,
    @Body('list') list: Types.ObjectId | null,
  ) {
    return this.groupsService.updateActiveList(groupId, list);
  }

  //get active shopping list
  @Get(':id/activeshoppinglist')
  async getActiveShoppingList(@Param('id') groupId: string) {
    return this.groupsService.getActiveShoppingList(groupId);
  }
  //get group admin
  @Get(':id/admin')
  async getAdmin(@Param('id') groupId: string) {
    return this.groupsService.getAdmin(groupId);
  }

  //get history
  @Get(':id/history')
  async getHistory(@Param('id') groupId: string) {
    return this.groupsService.getHistory(groupId);
  }

  // move active shopping list to history
  @Post(':id/history')
  async addToHistory(
    @Param('id') groupId: string,
    @Body('name') name: string,
  ) {
    return this.groupsService.addToHistory(name, groupId);
  }

}
