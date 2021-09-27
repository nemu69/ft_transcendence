import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateway/chat.gateway';
import { RoomEntity } from './model/room/room.entity';
import { RoomService } from './service/room-service/room.service';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { ConnectedUserEntity } from './model/connected-user/connected-user.entity';
import { MessageEntity } from './model/message/message.entity';
import { JoinedRoomEntity } from './model/joined-room/joined-room.entity';
import { JoinedRoomService } from './service/joined-room/joined-room.service';
import { MessageService } from './service/message/message.service';
import { HistoryService } from 'src/history/service/history.service';
import { HistoryEntity } from 'src/history/model/history.entity';
import { UserEntity } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user-service/user.service';

@Module({
  imports: [AuthModule, UserModule,
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity,
      HistoryEntity,
      UserEntity
    ])
  ],
  providers: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, MessageService, HistoryService, UserService]
})
export class ChatModule { }
