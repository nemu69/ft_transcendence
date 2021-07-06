import { Module } from '@nestjs/common';
import { FriendService } from './services/friend.service';
import { FriendController } from './controller/friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity } from './models/friend.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([FriendEntity]),
		AuthModule
  ],
  providers: [FriendService],
  controllers: [FriendController],
  exports: [FriendService]
})
export class FriendModule {}
