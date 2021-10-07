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
import { UpdateDateColumn } from 'typeorm';

@WebSocketGateway({ cors: true })
export class ChatGateway{

  @WebSocketServer()
  server: Server;

  //Setting up base Interfaces for both game modes
  n_ball: CoordinatesI = {
    x: 200,
    y: 150,
    dx: 1,
    dy: -1,
    width: 10,
    height: 10,
    speedmultiplier: 2,
  };
  //Setting up base Interfaces for both game modes
  b_ball: CoordinatesI = {
    x: 200,
    y: 150,
    dx: 1,
    dy: -1,
    width: 10,
    height: 10,
    speedmultiplier: 2,
  };
  //Setting up base Interfaces for both game modes
  n_gamestate: GameStateI = {
    userServices: this.userService,
    historyServices: this.historyService,
    player1: null,
    player2: null,
    spectators: [],
    ball: null,
    type: 0,
  };
  //Setting up base Interfaces for both game modes
  b_gamestate: GameStateI = {
    userServices: this.userService,
    historyServices: this.historyService,
    player1: null,
    player2: null,
    spectators: [],
    ball: null,
    type: 1,
    powers: [],
  };
  //Lists In which Rooms will be added through matchmaking
  lobby_list: LobbyI = {
    normalRooms: [this.n_gamestate],
    blitzRooms: [this.b_gamestate],
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private historyService: HistoryService,
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

  //Remove unused Rooms and change id's to coincide with new order
  private async UpdateRooms()
  {
    let i : number = 0;
    let y : number = 0;
    this.lobby_list.normalRooms.forEach(room => {
      if (room.type < 0)
      {
        this.lobby_list.normalRooms.splice(i, 1);
        y--;
      }
      else if (y != i && this.lobby_list.normalRooms[y].ball != null)
      {
        this.server.to(this.lobby_list.normalRooms[y].player1.socket.id).emit('id', [y, 0]);
        this.server.to(this.lobby_list.normalRooms[y].player2.socket.id).emit('id', [y, 0]);
      }
      i++;
      y++;
    });
    i = 0;
    y = 0;
    this.lobby_list.blitzRooms.forEach(room => {
      if (room.type < 0)
      {
        this.lobby_list.blitzRooms.splice(i, 1);
        y--;
      }
      else if (y != i && this.lobby_list.blitzRooms[y].ball != null)
      {
        this.server.to(this.lobby_list.blitzRooms[y].player1.socket.id).emit('id', [y, 1]);
        this.server.to(this.lobby_list.blitzRooms[y].player2.socket.id).emit('id', [y, 1]);
      }
      y++;
      i++;
    });
    this.n_id = this.lobby_list.normalRooms.length - 1;
    this.b_id = this.lobby_list.blitzRooms.length - 1;
  }

  //----------------------------------------CONNECTION HANDLER-------------------------------------------
  players = 0;
  n_id = 0;
  b_id = 0;
  //When a new player connects to the game (data -> gamemode | user id)
  @SubscribeMessage('newPlayer')
  async onNewPlayer(n_socket: Socket, data: number[]) {

    if (checkConnection(this.n_gamestate) == 2)
      this.n_gamestate.player1 = null;
    if (checkConnection(this.b_gamestate) == 2)
      this.b_gamestate.player1 = null;

    //Update rooms to facilitate setup
    this.UpdateRooms();
    let n_paddle: CoordinatesI = {
      x: 0,
      y: 120,
      dx: 0,
      dy: 0,
      width: 10,
      height: 60,
      speedmultiplier: 1,
    };

    //Get UserI from received ID to synchronise with n_players info
    const payload = await this.userService.findOne(data[1]);
    payload.status = UserStatus.GAME;
    this.userService.updateOne(payload.id, payload);
    let n_player: PlayerI = {
      user: payload,
      socket: n_socket,
      paddle: n_paddle,
      points: 0,
    };

    //simple function to check collisions between to CoordinatesI interfaces
    function collides(obj1: CoordinatesI, obj2: CoordinatesI) {
      return obj1.x < obj2.x + obj2.width &&
             obj1.x + obj1.width > obj2.x &&
             obj1.y < obj2.y + obj2.height &&
             obj1.y + obj1.height > obj2.y;
    }

    //Randomly Spawn A powerup on the map
    function spawnPowerUp(gamestate: GameStateI)
    {
      //PowerUp that reduces opponent's pallet size
      //Duration and effect setup with stat reset on deactivation
      let SmallerRacket: PowerI = {
        pos: {
          x: 50 + Math.random() * 300,
          y: 20 + Math.random() * 260,
          width: 10,
          height: 10,
        },
        color: "red",
        duration: 5,
        player: -1,
        activate: function (n_player: number) {
          if (n_player == 0)
            gamestate.player2.paddle.height -= 20;
          else
            gamestate.player1.paddle.height -= 20;
        },
        deactivate: function (n_player: number) {
          if (n_player == 0)
            gamestate.player2.paddle.height += 20;
          else
            gamestate.player1.paddle.height += 20;
        }
      }
      //PowerUp that increase player's pallet size
      //Duration and effect setup with stat reset on deactivation
      let BiggerRacket: PowerI = {
        pos: {
          x: 50 + Math.random() * 300,
          y: 20 + Math.random() * 260,
          width: 10,
          height: 10,
        },
        color: "green",
        duration: 5,
        player: -1,
        activate: function (n_player: number) {
          if (n_player == 0)
            gamestate.player1.paddle.height += 20;
          else
            gamestate.player2.paddle.height += 20;
        },
        deactivate: function (n_player: number) {
          if (n_player == 0)
            gamestate.player1.paddle.height -= 20;
          else
            gamestate.player2.paddle.height -= 20;
        }
      }
      //Randomly select one of the powerups to be generated
      let i: number = Math.floor(Math.random() * 2);
      if (i == 0)
        gamestate.powers.push(SmallerRacket);
      else if (i == 1)
        gamestate.powers.push(BiggerRacket);
    }

    //Update Currently in use powerups and call deactivate if duration reaches 0 bounces
    function updatePowerUp(gamestate: GameStateI)
    {
      let i: number = 0;
      gamestate.powers.forEach(power => {
        if (power.player != -1)
        {
          power.duration--;
          if (power.duration < 1)
          {
            power.deactivate(power.player);
            gamestate.powers.splice(i, 1);
          }
        }
        i++;
      });
    }

    //Setup The end of the game through score or disconnect
    function endGame(gamestate: GameStateI, disc: number, userservice: UserService, server: Server)
    {
      let type: string;
      if (gamestate.type == 0)
        type = "normal";
      else
        type = "blitz";
      gamestate.type = -1;
      if (gamestate.player1.points >= 5)
      {
        gamestate.player1.user.nbWin++;
        gamestate.player2.user.nbLoss++;
      }
      else if (gamestate.player2.points >= 5)
      {
        gamestate.player2.user.nbWin++;
        gamestate.player1.user.nbLoss++;
      }
      else if (gamestate.type == -1)
      {
        gamestate.player1.user.nbWin++;
        gamestate.player2.user.nbLoss++;
        gamestate.player1.points = 5;
      }
      else
      {
        gamestate.player2.user.nbWin++;
        gamestate.player1.user.nbLoss++;
        gamestate.player2.points = 5;
      }
      if (gamestate.player2.user.status == UserStatus.GAME)
        gamestate.player2.user.status = UserStatus.ON;
      if (gamestate.player1.user.status == UserStatus.GAME)
        gamestate.player1.user.status = UserStatus.ON;
      /*let p1 : UserI = await this.userService.findOne(gamestate.player1.user.id);
      let p2 : UserI = await this.userService.findOne(gamestate.player2.user.id);*/
      let history: HistoryI = {
        playerOne: gamestate.player1.user,
        playerTwo: gamestate.player2.user,
        playerOneScore: gamestate.player1.points,
        playerTwoScore: gamestate.player2.points,
        game: type,
        date: new Date(),
      };
      gamestate.historyServices.createMatchHistory(history);
      
      userservice.updateOne(gamestate.player2.user.id, gamestate.player2.user);
      userservice.updateOne(gamestate.player1.user.id, gamestate.player1.user);
      //Stop Loop from running
      if (gamestate.player1.paddle.speedmultiplier != -1)
      {
        server.to(gamestate.player1.socket.id).emit('done', 0);
      }
      if (gamestate.player2.paddle.speedmultiplier != -1)
      {
        server.to(gamestate.player2.socket.id).emit('done', 0);
      }
      if (gamestate.spectators.length)
      {
        gamestate.spectators.forEach(element => {
          server.to(element.socket.id).emit('done', -1);
        });
      }
      clearInterval(gamestate.id);
    }

    //Check if Users are still connected properly
    function checkConnection(gamestate: GameStateI)
    {
      let i : number = 0;
      if (gamestate.spectators.length)
      {
        gamestate.spectators.forEach(element => {
          if (!element.socket.connected)
          {
            gamestate.spectators.splice(i, 1);
          }
          i++;
        });
      }
      if (gamestate.player1 && !gamestate.player1.socket.connected)
      {
        gamestate.player1.user.status = UserStatus.OFF;
        return (2);
      }
      else if (gamestate.player2 && !gamestate.player2.socket.connected)
      {
        gamestate.player2.user.status = UserStatus.OFF;
        return (1);
      }
      return (0);
    }

    //Respawn ball with random angle but always towards the side that lost last
    function RespawnBall(ball: CoordinatesI, side: number)
    {
      //reset ball position
      ball.speedmultiplier = 2;
      ball.x = 200 - ball.width/2;
      ball.y = 150 - ball.height/2;
      ball.dx = 10 * side;
      ball.dy = Math.random() * 20 - 10;
      //reset magnitude of ball to speed multiplier
      let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
      ball.dx = ball.dx / magnitude * ball.speedmultiplier;
      ball.dy = ball.dy / magnitude * ball.speedmultiplier;
    }
    
    //calculate Bounces from paddles based on relative positions of both objects
    function CalculateBounce(ball: CoordinatesI, paddle: CoordinatesI)
    {
      ball.speedmultiplier *= 1.05;
      ball.dx  = -Math.sign(ball.dx) * 10;
      ball.dy = ((ball.y + ball.height) - (paddle.y + paddle.height/2))/2;
      if (Math.abs(ball.dx) < Math.abs(ball.dy) / 3)
        ball.dx = Math.abs(ball.dy) / 3 * Math.sign(ball.dx);
      if (Math.abs(ball.dy) < 0.5)
        ball.dy = 0;
      let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
      ball.dx = ball.dx / magnitude * ball.speedmultiplier;
      ball.dy = ball.dy / magnitude * ball.speedmultiplier;
      // move ball next to the paddle otherwise the collision will happen again
      // in the next frame
      if (paddle.x < 200)
        ball.x = paddle.x + paddle.width;
      else
        ball.x = paddle.x - paddle.width;
    }

     //------------------------------------GAME LOOP--------------------------------------------
    function loopFunction(gamestate: GameStateI, server: Server)
    {
      var player1: PlayerI = gamestate.player1;
      let player2: PlayerI = gamestate.player2;
      let ball: CoordinatesI = gamestate.ball;
      //Check if game is done through either points or loss of connection
      let disc: number = 0;
      if ((disc = checkConnection(gamestate)) || player1.points >= 5 || player2.points >= 5)
        endGame(gamestate, disc, gamestate.userServices, server);
      //PLAYER MOVEMENTS based on input variables recieved
      player1.paddle.y += player1.paddle.dy;
      if (player1.paddle.y < 0)
        player1.paddle.y = 0;
      else if (player1.paddle.y > 300 - player1.paddle.height)
        player1.paddle.y = 300 - player1.paddle.height;
        
      player2.paddle.y += player2.paddle.dy;
      if (player2.paddle.y < 0)
        player2.paddle.y = 0;
      else if (player2.paddle.y > 300 - player2.paddle.height)
        player2.paddle.y = 300 - player2.paddle.height;

      //BALL MOVEMENT and bounces on sides if coordinates are out of bounds
      ball.y += ball.dy;
      if (ball.y < 0)
      {
        ball.dy *= -1;
        ball.y = 0
      }
      else if (ball.y > 300 - ball.height)
      {
        ball.dy *= -1;
        ball.y = 300 - ball.height;
      }
      ball.x += ball.dx;
      //CHECK COLLISION WITH PADDLES IF INSIDE BOUNDS

      if (!(ball.x < 415 - ball.width && ball.x > -15))
      {
        //reset ball speed and set start of next round
        ball.speedmultiplier = 2;
        setTimeout(() => {
          //change scores
          if (ball.x <= -15 || ball.x >=415)
          {
            ball.x <= -15 ? player2.points++ : 0;
            ball.x >= 415 ? player1.points++ : 0;
            //send updated scores to both players and spectators
            server.to(player1.socket.id).emit('score', [gamestate.player1.points, gamestate.player2.points]);
            server.to(player2.socket.id).emit('score', [gamestate.player1.points, gamestate.player2.points]);
            if (gamestate.spectators.length)
            {
              gamestate.spectators.forEach(element => {
                server.to(element.socket.id).emit('score', [gamestate.player1.points, gamestate.player2.points]);
              });
            }
          }
          //if powers are present in the game reset all current powers affecting players or on board
          if (gamestate.type == 1 && gamestate.powers)
          {
            gamestate.powers.forEach(power => {
              if (power.player != -1)
                power.deactivate(power.player);
            });
            gamestate.powers.splice(0, gamestate.powers.length);
          }
          //respawn ball same diretion as before last loss
          if (ball.x <= -15)
            RespawnBall(ball, -1);
          else if (ball.x >= 415)
            RespawnBall(ball, 1);
          }, 1500);
      }
      //check collisions between player paddles and the ball
      if (collides(ball, player1.paddle) || collides(ball, player2.paddle))
      {
        //Bounce ball back
        if (collides(ball, player1.paddle))
          CalculateBounce(ball, player1.paddle);
        else
          CalculateBounce(ball, player2.paddle);
        //if the gamemode permits diceroll to determine if a powerup will be spawned
        if (gamestate.type == 1)
        {
          if (Math.floor(Math.random() * 7) == 1)
            spawnPowerUp(gamestate);
          updatePowerUp(gamestate);
        }
      }
      else if (gamestate.type == 1 && gamestate.powers)
      {
        //Check collision with potential powerups if gamemode permits
        let i: number = 0;
        gamestate.powers.forEach(element => {
          if (element.player == -1 && collides(ball, element.pos))
          {
            //activate on position with determined player
            element.player = (ball.dx < 0) ? 1 : 0;
            element.activate(element.player);
          }
          i++;
        });
      }
      //Setup only necessary frontend data in order to refrain from overloading stack
      let n_data: GameStateI = {
        player1:{
          paddle: player1.paddle,
          points: player1.points,
        },
        player2:{
          paddle: player2.paddle,
          points: player2.points,
        },
        ball: ball,
        type: gamestate.type,
        powers: gamestate.powers
      };
      //send Gamestte information to all players and spectators
      server.to(player2.socket.id).emit('gamestate', n_data);
      server.to(player1.socket.id).emit('gamestate', n_data);
      if (gamestate.spectators.length)
      {
        gamestate.spectators.forEach(element => {
          server.to(element.socket.id).emit('gamestate', n_data);
        });
      }
    }
    //TODO POTENTIAL FRIEND LIST GAME SEARCH
    //Enter player in first available space in chosen gamemode
    if (!this.n_gamestate.player1 && data[0] == 0)
    {
      this.players++;
      console.log("PLAYER1 IN");
      this.n_gamestate.player1 = n_player;
    }
    else if (!this.n_gamestate.player2 && data[0] == 0)
    {
      this.players++;
      console.log("PLAYER2  IN");
      this.n_gamestate.player2 = n_player;
      n_player.paddle.x = 400
    }
    if (!this.b_gamestate.player1 && data[0] == 1)
    {
      this.players++;
      console.log("PLAYER1 IN");
      this.b_gamestate.player1 = n_player;
    }
    else if (!this.b_gamestate.player2 && data[0] == 1)
    {
      this.players++;
      console.log("PLAYER2  IN");
      this.b_gamestate.player2 = n_player;
      n_player.paddle.x = 400
    }
    else if (data[0] == 2)
    {
      //Randomly affect a game to a spectator
      let room_nb : number;
      if (Math.floor(Math.random()*2) == 0)
      {
        room_nb = Math.floor(Math.random() * (this.lobby_list.normalRooms.length - 1));
        this.lobby_list.normalRooms[room_nb].spectators.push(n_player);
        this.server.to(n_player.socket.id).emit('score', [this.lobby_list.normalRooms[room_nb].player1.points,this.lobby_list.normalRooms[room_nb].player2.points]);
        this.server.to(n_player.socket.id).emit('name', [this.lobby_list.normalRooms[room_nb].player1.user.username,this.lobby_list.normalRooms[room_nb].player2.user.username]);
      }
      else
      {
        room_nb = Math.floor(Math.random() * (this.lobby_list.blitzRooms.length - 1));
        this.lobby_list.blitzRooms[room_nb].spectators.push(n_player);
        this.server.to(n_player.socket.id).emit('score', [this.lobby_list.blitzRooms[room_nb].player1.points,this.lobby_list.blitzRooms[room_nb].player2.points]);
        this.server.to(n_player.socket.id).emit('name', [this.lobby_list.blitzRooms[room_nb].player1.user.username,this.lobby_list.blitzRooms[room_nb].player2.user.username]);
      }
    }
    //once oth players are present in a game launch it
    if (this.n_gamestate.player2)
    {
      this.n_gamestate.ball = this.n_ball;
      const loopInterval = 1000 / 60;
      let gamestate = this.n_gamestate;
      let server = this.server;
      if (Math.random() < 0.5)
        RespawnBall(this.n_gamestate.ball, 1);
      else
        RespawnBall(this.n_gamestate.ball, -1);
      //Start Room's Game Loop
      gamestate.id = setInterval(function() {loopFunction(gamestate, server);}, loopInterval);
      //Send Players their room's id
      server.to(this.n_gamestate.player2.socket.id).emit('id', [this.n_id, 0]);
      server.to(this.n_gamestate.player1.socket.id).emit('id', [this.n_id, 0]);
      server.to(this.n_gamestate.player1.socket.id).emit('name', 0);
      server.to(this.n_gamestate.player2.socket.id).emit('name', 1);
      server.to(this.n_gamestate.player1.socket.id).emit('score', [0, 0]);
      server.to(this.n_gamestate.player2.socket.id).emit('score', [0, 0]);

      //Reset info for next room
      this.n_ball = {
        x: 50,
        y: 50,
        dx: -50,
        dy: 0,
        width: 10,
        height: 10,
        speedmultiplier: 1,
      };
      this.n_gamestate = {
        userServices: this.userService,
        historyServices: this.historyService,
        player1: null,
        player2: null,
        spectators: [],
        ball: null,
        type: 0,
      };
      this.players = 0;
      //Push empty room to back of array
      if (undefined !== this.lobby_list)
        this.lobby_list.normalRooms.push(this.n_gamestate);
    }
    else if (this.b_gamestate.player2)
    {
      this.b_gamestate.ball = this.b_ball;
      const loopInterval = 1000 / 60;
      let gamestate = this.b_gamestate;
      let server = this.server;
      if (Math.random() < 0.5)
        RespawnBall(this.b_gamestate.ball, 1);
      else
        RespawnBall(this.b_gamestate.ball, 1);
      //Start Room's Game Loop
      gamestate.id = setInterval(function() {loopFunction(gamestate, server);}, loopInterval);
      //Send Players their room's id
      server.to(this.b_gamestate.player2.socket.id).emit('id', [this.b_id, 1]);
      server.to(this.b_gamestate.player1.socket.id).emit('id', [this.b_id, 1]);
      server.to(this.b_gamestate.player1.socket.id).emit('name', 0);
      server.to(this.b_gamestate.player2.socket.id).emit('name', 1);
      server.to(this.b_gamestate.player1.socket.id).emit('score', [0, 0]);
      server.to(this.b_gamestate.player2.socket.id).emit('score', [0, 0]);

      //Reset info for next room
      this.b_ball = {
        x: 50,
        y: 50,
        dx: -50,
        dy: 0,
        width: 10,
        height: 10,
        speedmultiplier: 1,
      };
      this.b_gamestate = {
        userServices: this.userService,
        historyServices: this.historyService,
        player1: null,
        player2: null,
        spectators: [],
        ball: null,
        type: 0,
      };
      this.players = 0;
      //Push empty room to back of array
      if (undefined !== this.lobby_list)
        this.lobby_list.blitzRooms.push(this.b_gamestate);
    }
  }

  @SubscribeMessage('checkExistence')
  async checkExist(socket: Socket, data: number)
  {
    let found: boolean = false;
    await sleep(100);
    this.UpdateRooms();
    this.lobby_list.normalRooms.forEach(room => {
      if (!found)
      {
        if (room.player1 && room.player1.socket.id == socket.id)
        {
          found = true;
          this.server.to(room.player1.socket.id).emit('exists', [room.player1.points,room.player2.points]);
          this.server.to(room.player1.socket.id).emit('name', 0);
        }
        if (room.player2 && room.player2.socket.id == socket.id)
        {
          found = true;
          this.server.to(room.player2.socket.id).emit('exists', [room.player1.points,room.player2.points]);
          this.server.to(room.player2.socket.id).emit('name', 1);
        }
      }
    });
    if (!found)
    {
      this.lobby_list.blitzRooms.forEach(room => {
        if (!found)
        {
          if (room.player1 && room.player1.socket.id == socket.id)
          {
            found = true;
            this.server.to(room.player1.socket.id).emit('exists', [room.player1.points,room.player2.points]);
            this.server.to(room.player1.socket.id).emit('name', 0);
          }
          if (room.player2 && room.player2.socket.id == socket.id)
          {
            found = true;
            this.server.to(room.player2.socket.id).emit('exists', [room.player1.points,room.player2.points]);
            this.server.to(room.player2.socket.id).emit('name', 1);
          }
        }
      });
    }
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  @SubscribeMessage('logoutPlayer')
  async logout(socket: Socket, data: number)
  {
    let found: boolean = false;
    this.lobby_list.normalRooms.forEach(room => {
      if (!found)
      {
        if (room.player1 && room.player1.socket.id == socket.id)
        {
          found = true;
          room.player1.paddle.speedmultiplier = -1;
          room.player2.points = 5;
        }
        if (room.player2 && room.player2.socket.id == socket.id)
        {
          found = true;
          room.player2.paddle.speedmultiplier = -1;
          room.player1.points = 5;
        }
      }
    });
    if (!found)
    {
      this.lobby_list.blitzRooms.forEach(room => {
        if (!found)
        {
          if (room.player1 && room.player1.socket.id == socket.id)
          {
            found = true;
            room.player1.paddle.speedmultiplier = -1;
            room.player2.points = 5;
          }
          if (room.player2 && room.player2.socket.id == socket.id)
          {
            found = true;
            room.player2.paddle.speedmultiplier = -1;
            room.player1.points = 5;
          }
        }
      });
    }
  }


  //Paddle Movement handler Using room id and more
  @SubscribeMessage('paddle')
  async onPaddleMove(socket: Socket, data: number[]) {
    if (data !== null && data[2] == 0)
    {
      if (undefined !== this.lobby_list && this.lobby_list.normalRooms.length > data[1])
      {
        if (socket.id == this.lobby_list.normalRooms[data[1]].player1.socket.id)
        {
          if (data[0] == 0)
            this.lobby_list.normalRooms[data[1]].player1.paddle.dy = 0;
          else
            this.lobby_list.normalRooms[data[1]].player1.paddle.dy = data[0] < 0 ? 3: -3;
        }
        else if (socket.id == this.lobby_list.normalRooms[data[1]].player2.socket.id)
        {
          if (data[0] == 0)
            this.lobby_list.normalRooms[data[1]].player2.paddle.dy = 0;
          else
            this.lobby_list.normalRooms[data[1]].player2.paddle.dy = data[0] < 0 ? 3: -3;
        }
      }
    }
    else if (data !== null && data[2] == 1)
    {
      if (undefined !== this.lobby_list && this.lobby_list.blitzRooms.length > data[1])
      {
        if (socket.id == this.lobby_list.blitzRooms[data[1]].player1.socket.id)
        {
          if (data[0] == 0)
            this.lobby_list.blitzRooms[data[1]].player1.paddle.dy = 0;
          else
            this.lobby_list.blitzRooms[data[1]].player1.paddle.dy = data[0] < 0 ? 3: -3;
        }
        else if (socket.id == this.lobby_list.blitzRooms[data[1]].player2.socket.id)
        {
          if (data[0] == 0)
            this.lobby_list.blitzRooms[data[1]].player2.paddle.dy = 0;
          else
            this.lobby_list.blitzRooms[data[1]].player2.paddle.dy = data[0] < 0 ? 3: -3;
        }
      }
    }
  }
}