import { Types } from "mongoose";

export class UserDto {
  _id: Types.ObjectId;      
  name: string;
  email: string;
  groups: Types.ObjectId[]; 
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}