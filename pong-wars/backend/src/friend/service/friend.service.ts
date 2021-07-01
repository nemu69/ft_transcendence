import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendEntity } from '../models/friend.entity';

@Injectable()
export class FriendService {

    constructor(
        @InjectRepository(FriendEntity)
        private friendRepository: Repository<FriendEntity>
    ) {}
}
