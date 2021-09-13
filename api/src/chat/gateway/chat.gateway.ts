import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from 'src/auth/login/service/auth.service';
import { Socket, Server } from 'socket.io';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
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

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server;

  n_ball: CoordinatesI = {
    x: 50,
    y: 50,
    dx: -50,
    dy: 0,
    width: 1,
    height: 1
  };

  gamestate: GameStateI = {
    player1: null,
    player2: null,
    socketId: null,
    spectators: null,
    ball: null
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService) { }

  async onModuleInit() {
    console.log("onModuleInit");
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
    const messages = await this.messageService.findMessagesForRoom(room, { limit: 30, page: 1 });
    messages.meta.currentPage = messages.meta.currentPage - 1;
    // Save Connection to Room
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
    // Send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({...message, user: socket.data.user});
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    // TODO: Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add page +1 to match angular material paginator
    page.page = page.page + 1;
    return page;
  }

 

  //----------------------------------------CONNECTION HANDLER-------------------------------------------
  players = 0;
  start = false;
  @SubscribeMessage('newPlayer')
  async onNewPlayer(n_socket: Socket, data: number) {
    let n_paddle: CoordinatesI = {
      x: 0,
      y: 50,
      dx: 0,
      dy: 0,
      width: 1,
      height: 8
    };
    let n_player: PlayerI = {
      user: null,
      socket: n_socket.id,
      paddle: n_paddle
    };
    function collides(obj1: CoordinatesI, obj2: CoordinatesI) {
      return obj1.x < obj2.x + obj2.width &&
             obj1.x + obj1.width > obj2.x &&
             obj1.y < obj2.y + obj2.height &&
             obj1.y + obj1.height > obj2.y;
    }
     //------------------------------------GAME LOOP--------------------------------------------
    function loopFunction(gamestate: GameStateI, inbound: boolean, server: Server)
    {
        var player1 = gamestate.player1;
        let player2: PlayerI = gamestate.player2;
        let speedMultiplier: number = 1;
        let ball: CoordinatesI = gamestate.ball;
        //PLAYER MOVEMENTS
        player1.paddle.y += player1.paddle.dy;
        if (player1.paddle.y < 0 + player1.paddle.height/2)
          player1.paddle.y = 0 + player2.paddle.height/2;
        else if (player1.paddle.y > 100 - player1.paddle.height/2)
          player1.paddle.y = 100 - player1.paddle.height/2;
        
        player2.paddle.y += player2.paddle.dy;
        if (player2.paddle.y < 0 + player2.paddle.height/2)
          player2.paddle.y = 0 + player2.paddle.height/2;
        else if (player2.paddle.y > 100 - player2.paddle.height/2)
          player2.paddle.y = 100 - player2.paddle.height/2;

        //BALL MOVEMENT
        ball.y += ball.dy;
        if (ball.y < 0 + ball.height/2 || ball.y > 100 - ball.height/2)
        {
          ball.dy *= -1;
          (ball.y < 0) ? ball.y = 0 + ball.height/2 : ball.y = 100 - ball.height/2;
        }
        ball.x += ball.dx;
        //CHECK COLLISION WITH PADDLES IF INSIDE BOUNDS
        
        if (ball.x < 300 - ball.width/2 && ball.x > 0 + ball.width/2)
          inbound = true;
        else
        {
          if (inbound == false)
          {
            console.log("BALL IS OUT");
            speedMultiplier = 1;
            setTimeout(() => {
              ball.x = 150;
              ball.y = 50;
              ball.dx = 1;
              ball.dy = -1;
              let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
              ball.dx = ball.dx / magnitude * speedMultiplier;
              ball.dy = ball.dy / magnitude * speedMultiplier;
              }, 1500);
          }
          inbound = false;
        }
        if (collides(ball, player1.paddle))
        {
          speedMultiplier *= 1.05;
          ball.dx = 10;
          ball.dy = (ball.y - (player1.paddle.y + player1.paddle.height/2))/2;
          if (Math.abs(ball.dx) < Math.abs(ball.dy) / 3)
            ball.dx = Math.abs(ball.dy) / 3;
          if (Math.abs(ball.dy) < 0.5)
            ball.dy = 0;
          let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
          ball.dx = ball.dx / magnitude * speedMultiplier;
          ball.dy = ball.dy / magnitude * speedMultiplier;
          // move ball next to the paddle otherwise the collision will happen again
          // in the next frame
          ball.x = player1.paddle.x + player1.paddle.width;
        }
        else if (collides(ball, player2.paddle))
        {
          speedMultiplier *= 1.05;
          ball.dx = 10;
          ball.dy = (ball.y - (player2.paddle.y + player2.paddle.height/2))/2;
          if (Math.abs(ball.dx) < Math.abs(ball.dy) / 3)
            ball.dx = Math.abs(ball.dy) / 3;
          if (Math.abs(ball.dy) < 0.5)
            ball.dy = 0;
          let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
          ball.dx = ball.dx / magnitude * speedMultiplier;
          ball.dy = ball.dy / magnitude * speedMultiplier;
          // move ball next to the paddle otherwise the collision will happen again
          // in the next frame
          ball.x = player2.paddle.x - player2.paddle.width;
        }
        server.to(player2.socket).emit('gamestate', gamestate);
        server.to(player1.socket).emit('gamestate', gamestate);
    }
    //TODO
    //change so it isn't first come first served but baed on account id.......
    /************************************************************************/
    if (!this.gamestate.player1 /*|| this.gamestate.player1.user == */)
    {
      this.players++;
      console.log("PLAYER1 IN");
      this.gamestate.player1 = n_player;
    }
    else if (!this.gamestate.player2)
    {
      this.players++;
      console.log("PLAYER2  IN");
      this.gamestate.player2 = n_player;
      n_player.paddle.x = 300
    }
    if (this.start == false && this.gamestate.player2)
    {
      this.gamestate.ball = this.n_ball;
      this.start = true;
      console.log("STARTLOOP")
      const loopInterval = 1000 / 60;
      console.log(this.gamestate);
      let gamestate = this.gamestate
      let inbound = true;
      let server = this.server;
      setInterval(function() {loopFunction(gamestate, inbound, server);}, loopInterval);
    }
  }

  //DISCONNECTION HANDLER

  @SubscribeMessage('PlayerExit')
  async onPlayerExit(n_socket: Socket, data: number) {
    this.players--;
    console.log("PLAYER? OUT");
    if (this.gamestate.player1.socket == n_socket.id)
    {
      console.log("PLAYER1 OUT");
      this.gamestate.player1 = null;
    }
    else if (this.gamestate.player2.socket == n_socket.id)
    {
      console.log("PLAYER2 OUT");
      this.gamestate.player2 = null;
    }
    if (this.players <= 0)
    {
      this.gamestate.player1 = null;
      this.gamestate.player2 = null;
    }
  }

  //PADDLE MOVEMENT HANDLER

  @SubscribeMessage('paddle')
  async onPaddleMove(socket: Socket, data: number) {
    if (socket.id == this.gamestate.player1.socket)
    {
      console.log("PLAYER1 MOVE");
      this.gamestate.player1.paddle.dy = data * 3;
    }
    else if (socket.id == this.gamestate.player2.socket)
    {
      console.log("PLAYER2 MOVE");
      this.gamestate.player2.paddle.dy = data * 3;
    }
  }

  @SubscribeMessage('loadState')
  async onLoadState(socket: Socket) {
    console.log("HELLO THERE");
    return this.server.to(socket.id).emit('gamestate', this.gamestate);
  }

}
