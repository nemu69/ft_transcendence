import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from 'src/auth/login/service/auth.service';
import { Socket, Server } from 'socket.io';
import { UserI, UserStatus } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { HistoryService } from 'src/history/service/history.service';
import { HistoryI } from 'src/history/model/history.interface';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room-service/room.service';
import { PageI } from '../model/page.interface';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { RoomI } from '../model/room/room.interface';
import { ConnectedUserI } from '../model/connected-user/connected-user.interface';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { MessageService } from '../service/message/message.service';
import { MessageI } from '../model/message/message.interface';
import { JoinedRoomI } from '../model/joined-room/joined-room.interface';
import { GameStateI } from 'src/match/model/game-state/game-state.interface';
import { PlayerI } from 'src/match/model/player/player.interface';
import { CoordinatesI } from 'src/match/model/coordinates/coordinates.interface';
import { PowerI } from 'src/match/model/powers/powers.interface';
import { LobbyI } from 'src/match/model/lobby/lobby.interface';
import { type } from 'os';
import { Console } from 'console';
import { FriendsService } from 'src/friends/service/friends.service';
import { UpdateDateColumn } from 'typeorm';

@WebSocketGateway({ cors: true })
export class ChatGateway{

  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private historyService: HistoryService,
    private friendsService: FriendsService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService) { }
  
  // Don't remove this :)

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        // substract page -1 to match the angular material paginator
        rooms.meta.currentPage = rooms.meta.currentPage - 1;
        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    // remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
      // substract page -1 to match the angular material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page));
    // substract page -1 to match the angular material paginator
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessagesForRoom(room, socket.data.user, { limit: 30, page: 1 });
    messages.meta.currentPage = messages.meta.currentPage - 1;
    // Save Connection to Room
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, userId: socket.data.user.id, room });
    // Send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveJoinRoom')
  async onleaveJoinRoom(socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(socket: Socket, roomId: number, userId: number) {
    // remove connection from JoinedRooms
	//console.log(socket);
	
    await this.roomService.deleteAUserFromRoom(roomId, userId);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({...message, user: socket.data.user});
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    // TODO: Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) {
		const nu = await this.friendsService.boolUserIsBlocked(user.userId, createdMessage.user.id);
		if (!nu) await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add page +1 to match angular material paginator
    page.page = page.page + 1;
    return page;
  }
}