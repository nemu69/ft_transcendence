import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './controller/friends.controller';
import { FriendEntity } from './model/friends.entity';
import { FriendsService } from './service/friends.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendEntity]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService]
})
export class FriendsModule {}
