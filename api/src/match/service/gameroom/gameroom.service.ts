import { Injectable } from '@nestjs/common';
import { CoordinatesI } from 'src/match/model/coordinates/coordinates.interface';
import { LobbyI } from 'src/match/model/lobby/lobby.interface';
import { Socket, Server } from 'socket.io';
import { UserI, UserStatus} from 'src/user/model/user.interface';
import { GameStateI } from 'src/match/model/game-state/game-state.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { HistoryI } from 'src/history/model/history.interface';
import { RoomI } from 'src/chat/model/room/room.interface';

@Injectable()
export class GameRoomService {

  constructor(){};

  public findGameByMessageId(lobbies: LobbyI, id: number)
  {
    for (const room of lobbies.privateRooms)
    {
      if (room.p_id && room.p_id == id)
      {
        return(room);
      }
    }
  }

  public findGameById(lobbies: LobbyI, id: number)
  {
    for (const room of lobbies.privateRooms)
    {
      if (room.player1 && room.player1.user.id == id)
        return room;
      if (room.player2 && room.player2.user.id == id)
        return room;
    }
    for (const room of lobbies.normalRooms)
    {
      if (room.player1 && room.player1.user.id == id)
        return room;
      if (room.player2 && room.player2.user.id == id)
        return room;
    }
    for (const room of lobbies.blitzRooms)
    {
      if (room.player1 && room.player1.user.id == id)
        return room;
      if (room.player2 && room.player2.user.id == id)
        return room;
    }
    return null;
  }

  //Remove unused Rooms and change id's to coincide with new order
  public async UpdateRooms(lobbies: LobbyI, server: Server)
  {
    let i : number = 0;
    let y : number = 0;
    lobbies.normalRooms.forEach(room => {
      if (room.type < 0)
      {
        lobbies.normalRooms.splice(i, 1);
        y--;
      }
      else if (y != i && lobbies.normalRooms[y].ball != null)
      {
        server.to(lobbies.normalRooms[y].player1.socket.id).emit('id', [y, 0]);
        server.to(lobbies.normalRooms[y].player2.socket.id).emit('id', [y, 0]);
      }
      i++;
      y++;
    });
    i = 0;
    y = 0;
    lobbies.blitzRooms.forEach(room => {
      if (room.type < 0)
      {
        lobbies.blitzRooms.splice(i, 1);
        y--;
      }
      else if (y != i && lobbies.blitzRooms[y].ball != null)
      {
        server.to(lobbies.blitzRooms[y].player1.socket.id).emit('id', [y, 1]);
        server.to(lobbies.blitzRooms[y].player2.socket.id).emit('id', [y, 1]);
      }
      y++;
      i++;
    });
    i = 0;
    y = 0;
    lobbies.privateRooms.forEach(room => {
      if (room.type < 0)
      {
        lobbies.privateRooms.splice(i, 1);
        y--;
      }
      else if (y != i && lobbies.privateRooms[y].ball != null)
      {
        server.to(lobbies.privateRooms[y].player1.socket.id).emit('id', [y, 2]);
        server.to(lobbies.privateRooms[y].player2.socket.id).emit('id', [y, 2]);
      }
      y++;
      i++;
    });
    let n_id = lobbies.normalRooms.length - 1;
    let b_id = lobbies.blitzRooms.length - 1;
    let p_id = lobbies.privateRooms.length - 1;
    return ([n_id, b_id, p_id]);
  }

  private checkAll(room: GameStateI, user: UserI, socket: Socket, server: Server, opt: number, id: number)
  {
    if (room.player1 && room.player1.user.id == user.id)
    {
      if (!room.player2 && opt != 2)
      {
        room.player1 = null;
        return 1;
      }
      if (room.player1.socket != socket)
        server.to(room.player1.socket.id).emit('done', 1);
      room.player1.socket = socket;
      if (room.player1 && room.player2)
        server.to(room.player1.socket.id).emit('score', [room.player1.points, room.player2.points]);
      server.to(room.player1.socket.id).emit('exists', 0);
      server.to(room.player1.socket.id).emit('name', 0);
      server.to(room.player1.socket.id).emit('id', [id,opt]);
      server.to(room.player2.socket.id).emit('id', [id,opt]);
      return 1;
    }
    if (room.player2 && room.player2.user.id == user.id)
    {
      if (!room.player1 && opt != 2)
      {
        room.player2 = null;
        return 1;
      }
      if (room.player2.socket != socket)
        server.to(room.player2.socket.id).emit('done', 1);
      room.player2.socket = socket;
      if (room.player1 && room.player2)
        server.to(room.player2.socket.id).emit('score', [room.player1.points, room.player2.points]);
      server.to(room.player2.socket.id).emit('exists', 0);
      server.to(room.player2.socket.id).emit('name', 1);
      server.to(room.player2.socket.id).emit('id', [id,opt]);
      server.to(room.player1.socket.id).emit('id', [id,opt]);
      return 1;
    }
    for (const spec of room.spectators)
    {
      if (spec.socket.id == socket.id)
      {
        if (room.player1 && room.player2)
          server.to(spec.socket.id).emit('score', [room.player1.points,room.player2.points]);
        else if ((room.player1 || room.player2) && opt == 2)
          server.to(spec.socket.id).emit('score', [0,0]);
        else
          return 1;
        server.to(spec.socket.id).emit('name', 2);
        server.to(spec.socket.id).emit('exists', 2);
      }
    }
    return 0;
  }

  public checkIfAlready(lobbies: LobbyI, user: UserI, socket: Socket, server: Server)
  {
    let id: number = 0;
    for (const room of lobbies.normalRooms)
    {
      if (this.checkAll(room, user, socket, server, 0, id))
        return 1;
      id++;
    }
    id = 0;
    for (const room of lobbies.blitzRooms)
    {
      if (this.checkAll(room, user, socket, server, 1, id))
        return 1;
      id++;
    }
    id = 0;
    for (const room of lobbies.privateRooms)
    {
      if (this.checkAll(room, user, socket, server, 2, id))
        return 1;
      id++;
    }
    return 0;
  }

  //Check if Users are still connected properly
  public checkConnection(gamestate: GameStateI)
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

  public endGame(gamestate: GameStateI, gameRoomService: GameRoomService, userservice: UserService, server: Server)
  {
    let type: string;
    if (gamestate.type == 0)
      type = "normal";
    else if (gamestate.type == 1)
      type = "blitz";
    else
      type = "private";
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
    for (const spec of gamestate.spectators)
    {
      if (spec.user.status == UserStatus.GAME)
      {
        spec.user.status = UserStatus.ON;
        userservice.updateOne(spec.user.id, spec.user);
      }
    }
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
  }
}
