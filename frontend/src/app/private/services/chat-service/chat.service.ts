import { HostListener, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageI, MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomI, RoomPaginateI } from 'src/app/model/chat/room.interface';
import { GameStateI } from 'src/app/model/game-state.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { CustomSocket } from '../../sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  socket: CustomSocket = null;
  constructor(
    private authService: AuthService,
    private snackbar: MatSnackBar,
    ) {
        if(authService.isAuthenticated())
        {
          console.log(this.socket);
          this.socket = new CustomSocket;
          console.log(this.socket);
        }
      }

  @HostListener('window:beforeunload') goToPage() {
    this.socket.emit('PlayerExit');
  }

  getAddedMessage(): Observable<MessageI> {
    return this.socket.fromEvent<MessageI>('messageAdded');
  }

  sendMessage(message: MessageI) {
    this.socket.emit('addMessage', message);
  }

  joinRoom(room: RoomI) {
    this.socket.emit('joinRoom', room);
  }

  leaveJoinRoom(room: RoomI) {    
    this.socket.emit('leaveJoinRoom', room);
  }

  leaveRoom(room : RoomI) {
	this.socket.emit('leaveRoom', room);
  }

  getMessages(): Observable<MessagePaginateI> {
    return this.socket.fromEvent<MessagePaginateI>('messages');
  }

  getMyRooms(): Observable<RoomPaginateI> {
    return this.socket.fromEvent<RoomPaginateI>('rooms');
  }
  
  emitPaginateRooms(limit: number, page: number) {
    this.socket.emit('paginateRooms', { limit, page });
  }

  createRoom(room: RoomI) {
    let iduser : number;
    this.authService.getUserId().subscribe(val => {
      iduser = val;
    })
    if (room.users.filter(function(e) { return e.id === iduser; }).length > 0) {
      this.snackbar.open(`You're adding YOU :)`, 'Close', {
        duration: 5000, horizontalPosition: 'right', verticalPosition: 'top',
        panelClass: ['red-snackbar','login-snackbar'],
      });
      throw iduser;
    }
    this.socket.emit('createRoom', room);
    this.snackbar.open(`Room ${room.name} created successfully`, 'Close', {
      duration: 3000, horizontalPosition: 'right', verticalPosition: 'top',
    });
  }

  checkExistence(n: number)
  {
    this.socket.emit('checkExistence', n);
  }

  gameLogout()
  {
    this.socket.emit('logoutPlayer', 0);
  }

  newPlayer(info: number, user: number) {
    console.log(this.socket);
    this.socket.emit('newPlayer', [info, user]);
  }

  getGameState(): Observable<GameStateI> {
    return this.socket.fromEvent<GameStateI>('gamestate');
  }

  emitInput(data: number[]){
    this.socket.emit("paddle", data);
  }
}
