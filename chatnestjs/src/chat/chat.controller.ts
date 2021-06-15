import { Controller, Post, Res, Body, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('message')
export class ChatController {
    constructor(private chatService: ChatService){}

  @Post()
  postMessage(@Res() res, @Body() data ) {
      this.chatService.addMessage(data)
      res.status(HttpStatus.OK).send("Comment posted successfully")
  }
}
