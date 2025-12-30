import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@t-ecosystem/core-types';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
       uid: '123',
       email: 'admin@t-ecosystem.com',
       displayName: 'System Admin',
       role: 'admin',
       photoURL: '',
    }
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      uid: Math.random().toString(36).substring(7),
      email: createUserDto.email,
      displayName: createUserDto.displayName,
      role: 'member',
      photoURL: createUserDto.photoURL || '',
    };
    this.users.push(newUser);
    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User> {
    const user = this.users.find(u => u.uid === id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex(u => u.uid === id);
    if (userIndex === -1) throw new NotFoundException(`User #${id} not found`);
    
    const updatedUser = { ...this.users[userIndex], ...updateUserDto };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.uid === id);
    if (userIndex === -1) throw new NotFoundException(`User #${id} not found`);
    this.users.splice(userIndex, 1);
  }
}
