import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from 'src/auth/login/service/auth.service';
import { Socket, Server } from 'socket.io';
import { UserI, UserStatus } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { HistoryService } from 'src/history/service/history.service';
import { HistoryI } from 'src/history/model/history.interface';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { GameStateI } from 'src/match/model/game-state/game-state.interface';
import { PlayerI } from 'src/match/model/player/player.interface';
import { CoordinatesI } from 'src/match/model/coordinates/coordinates.interface';
import { PowerI } from 'src/match/model/powers/powers.interface';
import { LobbyI } from 'src/match/model/lobby/lobby.interface';
import { type } from 'os';
import { Console } from 'console';
import { FriendsService } from 'src/friends/service/friends.service';
import { UpdateDateColumn } from 'typeorm';
import { GameService } from './service/game/game.service';
import { GameRoomService } from './service/gameroom/gameroom.service';

@WebSocketGateway({ cors: true })
export class MatchGateway{

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
    private friendsService: FriendsService,
    private gameService: GameService,
    private gameRoomService: GameRoomService) { }

  //----------------------------------------CONNECTION HANDLER-------------------------------------------
  players = 0;
  n_id = 0;
  b_id = 0;
  //When a new player connects to the game (data -> gamemode | user id)
  @SubscribeMessage('newPlayer')
  async onNewPlayer(n_socket: Socket, data: number[]) {

    if (this.gameRoomService.checkConnection(this.n_gamestate) == 2)
      this.n_gamestate.player1 = null;
    if (this.gameRoomService.checkConnection(this.b_gamestate) == 2)
      this.b_gamestate.player1 = null;

    //Update rooms to facilitate setup
    this.gameRoomService.UpdateRooms(this.lobby_list, this.server);
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

    //Setup The end of the game through score or disconnect
    function endGame(gamestate: GameStateI, gameRoomService: GameRoomService, userServices: UserService, server: Server)
    {
      gameRoomService.endGame(gamestate, gameRoomService, userServices, server);
      clearInterval(gamestate.id);
    }

     //------------------------------------GAME LOOP--------------------------------------------
    function loopFunction(gamestate: GameStateI, server: Server, gameService: GameService, gameRoomService: GameRoomService)
    {
      var player1: PlayerI = gamestate.player1;
      let player2: PlayerI = gamestate.player2;
      let ball: CoordinatesI = gamestate.ball;
      //Check if game is done through either points or loss of connection
      let disc: number = 0;
      if ((disc = gameRoomService.checkConnection(gamestate)) || player1.points >= 5 || player2.points >= 5)
        endGame(gamestate, gameRoomService, gamestate.userServices, server);
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
            gameService.RespawnBall(ball, -1);
          else if (ball.x >= 415)
            gameService.RespawnBall(ball, 1);
          }, 1500);
      }
      //check collisions between player paddles and the ball
      if (gameService.collides(ball, player1.paddle) || gameService.collides(ball, player2.paddle))
      {
        //Bounce ball back
        if (gameService.collides(ball, player1.paddle))
          gameService.CalculateBounce(ball, player1.paddle);
        else
          gameService.CalculateBounce(ball, player2.paddle);
        //if the gamemode permits diceroll to determine if a powerup will be spawned
        if (gamestate.type == 1)
        {
          if (Math.floor(Math.random() * 7) == 1)
            gameService.spawnPowerUp(gamestate);
          gameService.updatePowerUp(gamestate);
        }
      }
      else if (gamestate.type == 1 && gamestate.powers)
      {
        //Check collision with potential powerups if gamemode permits
        let i: number = 0;
        gamestate.powers.forEach(element => {
          if (element.player == -1 && gameService.collides(ball, element.pos))
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
        this.server.to(n_player.socket.id).emit('name', 0);
      }
      else
      {
        room_nb = Math.floor(Math.random() * (this.lobby_list.blitzRooms.length - 1));
        this.lobby_list.blitzRooms[room_nb].spectators.push(n_player);
        this.server.to(n_player.socket.id).emit('score', [this.lobby_list.blitzRooms[room_nb].player1.points,this.lobby_list.blitzRooms[room_nb].player2.points]);
        this.server.to(n_player.socket.id).emit('name', 0);
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
        this.gameService.RespawnBall(this.n_gamestate.ball, 1);
      else
        this.gameService.RespawnBall(this.n_gamestate.ball, -1);
      //Start Room's Game Loop
      let gameService = this.gameService;
      let gameRoomService = this.gameRoomService;
      gamestate.id = setInterval(function() {loopFunction(gamestate, server, gameService, gameRoomService);}, loopInterval);
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
        this.gameService.RespawnBall(this.b_gamestate.ball, 1);
      else
        this.gameService.RespawnBall(this.b_gamestate.ball, 1);
      //Start Room's Game Loop
      let gameService = this.gameService;
      let gameRoomService = this.gameRoomService;
      gamestate.id = setInterval(function() {loopFunction(gamestate, server, gameService, gameRoomService);}, loopInterval);
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
    if (data != -1)
    {
      const payload = await this.userService.findOne(data);
      payload.status = UserStatus.GAME;
      this.userService.updateOne(payload.id, payload);
      this.gameRoomService.checkIfAlready(this.lobby_list, payload, socket, this.server);
    }
    await sleep(10);
    this.gameRoomService.UpdateRooms(this.lobby_list, this.server);
    this.gameRoomService.checkExists(socket, data, this.lobby_list, this.server);
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  @SubscribeMessage('logoutPlayer')
  async logout(socket: Socket, data: number)
  {
    let found: boolean = false;
    this.lobby_list.normalRooms.forEach(room => {
      if (room.player1 && room.player1.socket.id == socket.id)
      {
        room.player1.paddle.speedmultiplier = -1;
        room.player2.points = 5;
        return ;
      }
      if (room.player2 && room.player2.socket.id == socket.id)
      {
        room.player2.paddle.speedmultiplier = -1;
        room.player1.points = 5;
        return ;
      }
    });
    this.lobby_list.blitzRooms.forEach(room => {
        if (room.player1 && room.player1.socket.id == socket.id)
        {
          room.player1.paddle.speedmultiplier = -1;
          room.player2.points = 5;
          return ;
        }
        if (room.player2 && room.player2.socket.id == socket.id)
        {
          room.player2.paddle.speedmultiplier = -1;
          room.player1.points = 5;
          return ;
        }
      });
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