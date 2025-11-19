import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Group } from '../../groups/schemas/groups.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  // The user's currently active group (frontend + backend use this)
  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  activeGroup: Types.ObjectId | null;


  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  groups: Types.ObjectId[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  avatarUrl?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
