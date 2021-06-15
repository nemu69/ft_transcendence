import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController, ChatController],
  components: [ChatService],
})
export class AppModule {}
