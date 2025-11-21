import { Types } from "mongoose";

export class UserDto {
  _id: string;
  name: string;
  email: string;
  passwordLength: number;
  avatarUrl?: string | null;
  groups: string[];
  activeGroup?: string | null;
  createdAt?: string;
  updatedAt?: string;
}