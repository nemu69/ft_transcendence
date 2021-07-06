import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/guards/jtw-guards';
import { User } from 'src/user/service/user.service';
import { FriendEntity } from '../models/friend.entity';
import { FriendService } from '../services/friend.service';

@Controller('friend')
export class FriendController {

    constructor(private friendService: FriendService) {}

	// @UseGuards(JwtAuthGuard)
	// @Get()
	// allFollowing(@Req() req): Promise<Pagination<FriendEntity>> {
	// 	const user: User = req.user;
	// 	return this.friendService.allFollowing(user);
	// }
}
