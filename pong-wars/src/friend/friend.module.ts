import { Module } from '@nestjs/common';
import { FriendEntity } from './models/friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendService } from './service/friend.service';
import { FriendController } from './controller/friend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendEntity])
  ],
  providers: [FriendService],
  controllers: [FriendController]
})
export class FriendModule {}
