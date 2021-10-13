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
      return messagePaginate;
    }),
    tap(() => this.scrollToBottom())
  )

  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  constructor(
	  private chatService: ChatService,
	  private authService: AuthService,
	  private router: Router,
	  private activatedRoute: ActivatedRoute,
	  private _snackBar: MatSnackBar
	  	) { }

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

  gameInvite() {
    this.chatService.inviteMessage({ text: 'GAME INVITE', type: 1, room: this.chatRoom });
    this.chatMessage.reset();
    this.chatService.newPrivateGame(this.chatRoom, this.user.id);
    this.router.navigate(['../match/'], { relativeTo: this.activatedRoute });
  }

  joinGameRoom() {
    this.chatService.newPrivatePlayer(this.chatRoom, this.user.id);
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
