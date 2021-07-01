import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}

    add(user: UserI): Observable<UserI> {
        return from(this.userRepository.save(user));
    }

    findAll(): Observable<UserI[]> {
        return from(this.userRepository.find());
    }

    private readonly users = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123@',
          email: 'admin@admin.fr',
          avatar: 'none',
          status: 'online',
          role: 'admin',
        },
      ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
}