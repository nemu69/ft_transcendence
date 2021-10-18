import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, map, startWith, tap } from 'rxjs/operators';
import { MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomI, RoomPaginateI, RoomType } from 'src/app/model/chat/room.interface';
import { UserI, UserRole } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';
import { ChatService } from '../services/chat-service/chat.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {

	user: UserI = this.authService.getLoggedInUser();
	allUsers$: Observable<UserI[]> = this.UserService.getAllUsers();
	allRooms$: Observable<RoomPaginateI> = this.chatService.getMyRooms();
	constructor(
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private snackBar: MatSnackBar,
		private UserService: UserService,
		private chatService: ChatService
  	) { }

	ngOnInit(): void {
		// check if user status is owner or admin
		if (this.user.role !== UserRole.ADMIN && this.user.role !== UserRole.OWNER) {
			this.snackBar.open('You are not authorized to access this page', '', {
				duration: 2000,
				panelClass: ['red-snackbar','login-snackbar'],
			});
		}
	}

	// get all users



}
