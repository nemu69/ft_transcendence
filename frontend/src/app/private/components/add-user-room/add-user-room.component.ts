import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, map, startWith, tap } from 'rxjs/operators';
import { MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomI, RoomType } from 'src/app/model/chat/room.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-add-user-room',
  templateUrl: './add-user-room.component.html',
  styleUrls: ['./add-user-room.component.css']
})
export class AddUserRoomComponent {

  @Input() joinRoom: RoomI;
  user: UserI = this.authService.getLoggedInUser();
  protected = RoomType.PROTECTED;

  password: FormControl = new FormControl({value: '', disabled: false}, [Validators.required]);



  constructor(
	  private chatService: ChatService,
	  private authService: AuthService,
	  private router: Router,
	  private activatedRoute: ActivatedRoute,
	  	) { }

  addUser() {
	this.chatService.addUserToRoom(this.joinRoom, this.password.value);
  }

}
