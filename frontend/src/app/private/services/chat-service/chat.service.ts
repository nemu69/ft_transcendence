import { HttpClient } from '@angular/common/http';
import { HostListener, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MessageI, MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomType ,RoomI, RoomPaginateI } from 'src/app/model/chat/room.interface';
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
	private http: HttpClient,
	private router: Router
    ) {
        if(authService.isAuthenticated())
          this.socket = new CustomSocket;
      }

  @HostListener('window:beforeunload') goToPage() {
    this.socket.emit('PlayerExit');
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
  
  emitPaginateRooms(limit: number, page: number) {
	this.socket.emit('paginateRooms', { limit, page });
  }

  inviteMessage(message: MessageI) {
    this.socket.emit('gameMessage', message);
  }

  joinRoom(room: RoomI) {
	this.socket.emit('joinRoom', room);
  }

  spectate(id: number, self_id: number){
    this.socket.emit('specRoom', [id, self_id]);
  }

  leaveJoinRoom(room: RoomI) {    
	this.socket.emit('leaveJoinRoom', room);
  }

  leaveRoom(room : RoomI) {
	this.socket.emit('leaveRoom', room);
  }
  
  emitPaginateAllRooms(limit: number, page: number) {
    this.socket.emit('allRoom', { limit, page });
  }

  addUserToRoom(room: RoomI, password: string) {
	this.socket.emit('addUser',  {room, password});
  }

  addAdmin(room: RoomI, user: UserI) {
	this.socket.emit('addAdmin', { room, user });
  }

  addMuted(room: RoomI, user: UserI) {
	this.socket.emit('addMuted', { room, user });
  }

  removeAdmin(room: RoomI, user: UserI) {
	this.socket.emit('removeAdmin', { room, user });
  }

  removeMuted(room: RoomI, user: UserI) {
	this.socket.emit('removeMuted', { room, user });
  }

  changePassword(room: RoomI, password: string) {
	this.socket.emit('changePassword', { room, password });
  }

  changeType(room: RoomI, type: RoomType, password: string) {
	this.socket.emit('changeType', { room, type, password });
  }

  sendMessage(message: MessageI) {
    this.socket.emit('addMessage', message);
  }

  getMessages(): Observable<MessagePaginateI> {
    return this.socket.fromEvent<MessagePaginateI>('messages');
  }

  getMyRooms(): Observable<RoomPaginateI> {
    return this.socket.fromEvent<RoomPaginateI>('rooms');
  }

  getAddedMessage(): Observable<MessageI> {
    return this.socket.fromEvent<MessageI>('messageAdded');
  }

  IsInRoom(roomId: number, userId : number): Observable<number> {
	  return this.http.get<number>('/api/room/' + roomId + '/' +  userId).pipe(
		tap(val => {
		  if (val < 1) {
			this.snackbar.open(`Password failed, Try again !`, 'Close', {
			  duration: 3000, horizontalPosition: 'right', verticalPosition: 'top',
			});
		  }
		  else {
			this.snackbar.open(`Password success, You're in the room!`, 'Close', {
			  duration: 3000, horizontalPosition: 'right', verticalPosition: 'top',
			});
			this.router.navigate(['../../private/dashboard']);
		}
		}));
  }

  // Game
  checkExistence(n: number)
  {
    this.socket.emit('checkExistence', n);
  }

  gameLogout()
  {
    this.socket.emit('logoutPlayer', 0);
  }

  newPlayer(info: number, user: number) {
    this.socket.emit('newPlayer', [info, user]);
  }

  newPrivatePlayer(room: RoomI, user: number) {
    this.socket.emit('newPrivatePlayer', {room, user});
  }

  newPrivateGame(room: RoomI, user: number) {
    this.socket.emit('CreatePrivateGame', {room, user});
  }

  getGameState(): Observable<GameStateI> {
    return this.socket.fromEvent<GameStateI>('gamestate');
  }

  emitInput(data: number[]){
    this.socket.emit("paddle", data);
  }

  findOne(id: number): Observable<RoomI> {
	return this.http.get('/api/room/' + id).pipe(
	  map((room:RoomI) => room)
	)
  }
}
