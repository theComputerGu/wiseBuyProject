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

  //  Create group
  @Post()
  async create(
    @Body('name') name: string,
  ) {
    return this.groupsService.create({ name });
  }

  //  Get all groups
  @Get()
  async findAll() {
    return this.groupsService.findAll();
  }

  //  Get group by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  //  Get group by join code
  @Get('code/:groupcode')
  async findByCode(@Param('groupcode') groupcode: string) {
    return this.groupsService.findByCode(groupcode);
  }

  // Get all users of a specific group
@Get(':id/users')
async getGroupUsers(@Param('id') id: string) {
  return this.groupsService.findUsers(id);
}

  //  Add user to group
  @Patch(':id/add-user')
  async addUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.groupsService.addUserToGroup(id, userId);
  }

  //  Delete entire group
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.groupsService.delete(id);
  }
}
