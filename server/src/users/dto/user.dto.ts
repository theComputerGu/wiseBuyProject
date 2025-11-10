// src/users/dto/user.dto.ts
export class UserDto {
  _id: string;
  name: string;
  email: string;
  groups: string[];
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string; // 👈 חדש
}