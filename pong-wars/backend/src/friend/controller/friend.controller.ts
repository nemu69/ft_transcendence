import { Controller } from '@nestjs/common';
import { FriendService } from '../service/friend.service';

@Controller('friend')
export class FriendController {

    constructor(private friendService: FriendService) {}
}
