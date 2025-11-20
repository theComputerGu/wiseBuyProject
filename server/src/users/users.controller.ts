import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { Types } from 'mongoose';
import type { Request } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----------------------------
  // CREATE
  // -----------------------------
  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('passwordPlain') passwordPlain: string,
  ) {
    return this.usersService.create({ name, email, passwordPlain });
  }

  // -----------------------------
  // LOGIN
  // -----------------------------
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto.email, dto.passwordPlain);
  }

  // -----------------------------
  // FIND ALL
  // -----------------------------
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // -----------------------------
  // FIND ONE
  // -----------------------------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/groups')
  async getUserGroups(@Param('id') userId: string) {
  return this.usersService.findUserGroups(userId);
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() patch: any,
  ) {
    return this.usersService.update(id, patch);
  }

  // -----------------------------
  // DELETE
  // -----------------------------
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  // -----------------------------
  // UPLOAD AVATAR
  // -----------------------------
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'avatars');
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const unique = Date.now();
          cb(null, `${req.params.id}_${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/avatars/${file.filename}`;

    return this.usersService.update(id, { avatarUrl: url });
  }

  // -----------------------------
  // ACTIVE GROUP
  // -----------------------------


  @Get(':id/activegroup')
  async getActiveGroup(@Param('id') id: string) {
    return this.usersService.getActiveGroup(id);
  }


      // users.controller.ts
    @Patch(':userId/add-group/:groupId')
    async addGroupToUser(
      @Param('userId') userId: string,
      @Param('groupId') groupId: string,
    ) {
      return this.usersService.addGroupToUser(userId, groupId);
    }

  // SET ACTIVE GROUP
@Patch(':id/set-active-group')
async setActiveGroup(
  @Param('id') userId: string,
  @Body('groupId') groupId: string | null,
) {
  return this.usersService.setActiveGroup(
    userId,
    groupId ? new Types.ObjectId(groupId) : null,
  );
}

}
