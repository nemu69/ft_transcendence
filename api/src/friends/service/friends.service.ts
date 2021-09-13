import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { FriendEntity } from 'src/friends/model/friends.entity';
import { FriendsI } from 'src/friends/model/friends.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';


@Injectable()
export class FriendsService {


  constructor(
    @InjectRepository(FriendEntity)
    private readonly roomRepository: Repository<FriendEntity>
  ) { }




}
