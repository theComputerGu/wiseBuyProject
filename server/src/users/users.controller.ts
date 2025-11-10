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
import { FileInterceptor } from '@nestjs/platform-express'; // ✅ להעלאת קובץ
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

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

  // 🔐 Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto.email, dto.password);
  }

  // 🖼️ העלאת תמונת פרופיל (avatar)
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
      limits: { fileSize: 3 * 1024 * 1024 }, // עד 3MB
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request, // ✅ כאן נוסף ה־req שגרם לשגיאה
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // ✅ נבנה את הכתובת המדויקת של הקובץ
    const base =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/avatars/${file.filename}`;

    console.log('[uploadAvatar] saved:', file.path);
    console.log('[uploadAvatar] url:', url);

    // ✅ נשמור את כתובת התמונה במסד
    const doc = await this.usersService.update(id, { avatarUrl: url });
    return doc; // אפשר גם למפות ל-DTO אם יש לך
  }
}
