import { Module } from '@nestjs/common';
import { User, UserSchema } from '../users/schemas/users.schema';
import { Group, GroupSchema } from './schemas/groups.schema';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
