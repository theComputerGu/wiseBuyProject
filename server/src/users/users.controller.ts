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
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('avatarUrl') avatarUrl?: string,
    
  ) {
    return this.usersService.create({ name, email, password, avatarUrl });
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':userId/remove-group/:groupId')
removeGroup(
  @Param('userId') userId: string,
  @Param('groupId') groupId: string
) {
  return this.usersService.removeGroup(userId, groupId);
}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() patch: Partial<{ name: string; email: string; password: string; avatarUrl: string }>
  ) {
    return this.usersService.update(id, patch);
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

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto.email, dto.password);
  }

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

    const base =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/avatars/${file.filename}`;

    console.log('[uploadAvatar] saved:', file.path);
    console.log('[uploadAvatar] url:', url);

    const doc = await this.usersService.update(id, { avatarUrl: url });
    return doc;
  }

 //set active group
@Post(':id/activegroup')
async setActiveGroup(
  @Param('id') id: string,
  @Body('groupId') groupId: Types.ObjectId | null,
) {
  return this.usersService.setActiveGroup(id, groupId);
}

//get active group
@Get(':id/activegroup')
async getActiveGroup(@Param('id') id: string) {
  return this.usersService.getActiveGroup(id);
}
}