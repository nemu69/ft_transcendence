import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, map, startWith, tap } from 'rxjs/operators';
import { MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomI } from 'src/app/model/chat/room.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {

  @Input() chatRoom: RoomI;
  @ViewChild('messages') private messagesScroller: ElementRef;
  user: UserI = this.authService.getLoggedInUser();
  IsOwner: boolean = false;
  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]).pipe(
    map(([messagePaginate, message]) => {
		if (message && message.room.id === this.chatRoom.id && !messagePaginate.items.some(m => m.id === message.id)) {
		    messagePaginate.items.push(message);
		}
		const items = messagePaginate.items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
		messagePaginate.items = items;
		if (this.chatRoom.owner && this.chatRoom.owner.id === this.user.id)
			  this.IsOwner = true;
		if (this.chatRoom.muted && this.chatRoom.muted.some(m => m.id === this.user.id)){
			  this.chatMessage.disable();
			  this.chatMessage.setValue('You are muted');
			}
		else {
			this.chatMessage.enable();
			this.chatMessage.setValue('');
		}
		return messagePaginate;
    }),
    tap(() => this.scrollToBottom())
  )

  chatMessage: FormControl = new FormControl({value: '', disabled: false}, [Validators.required]);

  constructor(
	  private chatService: ChatService,
	  private authService: AuthService,
	  private router: Router,
	  private activatedRoute: ActivatedRoute,
	  private _snackBar: MatSnackBar
	  	) {
        chatService.socket.on('startGame', function(data: {room: RoomI, u_id: number, type: number, m_id: number}) {
          chatService.newPrivateGame(data.room, data.u_id, data.type, data.m_id);
          router.navigate(['../../private/match/']);
        });
      }

  ngOnChanges(changes: SimpleChanges) {
    this.chatService.leaveJoinRoom(changes['chatRoom'].previousValue);
    if (this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom);
    }
  }

  ngAfterViewInit() {
    if (this.messagesScroller) {
      this.scrollToBottom();
    }
  }

  ngOnDestroy() {
    this.chatService.leaveJoinRoom(this.chatRoom);
  }

  sendMessage() {
    if (this.chatMessage.valid) {
    this.chatService.sendMessage({ text: this.chatMessage.value, type: 0, room: this.chatRoom });
    this.chatMessage.reset();
    }
  }

  gameInvite(type: number) {
    if (type == 0)
      this.chatService.inviteMessage({ text: 'NORMAL GAME INVITE', type: 1, room: this.chatRoom }, this.user.id, type);
    else
      this.chatService.inviteMessage({ text: 'BLITZ GAME INVITE', type: 1, room: this.chatRoom }, this.user.id, type);
    this.chatMessage.reset();
  }

  joinGameRoom(id: number) {
    this.chatService.newPrivatePlayer(this.chatRoom, this.user.id, id);
    this.router.navigate(['../match/'], { relativeTo: this.activatedRoute });
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => { this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight }, 1);
    } catch { }

  }

  LeaveChatRoom(action : string) {
	this.chatService.leaveRoom(this.chatRoom);
	this._snackBar.open('You ' +  action + ' ' + this.chatRoom.name + ' !', 'Close', {
		duration: 2000,
	});
	this.router.navigate(['../profile/'], { relativeTo: this.activatedRoute });
  }
}
