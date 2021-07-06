import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { FriendEntity } from '../models/friend.entity';

export type Friend = any;

@Injectable()
export class FriendService {
	constructor(
        @InjectRepository(FriendEntity)
        private readonly friendRepository: Repository<FriendEntity>,
		private authService: AuthService
    ) {}

	// allFollowing(user: User): Promise<Pagination<FriendEntity>> {
	// 	const query = this.friendRepository
	// 		.createQueryBuilder('friend')
	// 		.where('following.id = :userId', { userId: user.id });	
	// 	return paginate(query, { page: 1, limit: 100 });
	// }

	// allFollower(user: User): Promise<Pagination<FriendEntity>> {
	// 	const query = this.friendRepository
	// 		.createQueryBuilder('friend')
	// 		.where('follower.id = :userId', { userId: user.id });	
	// 	return paginate(query, { page: 1, limit: 100 });
	// }
}
