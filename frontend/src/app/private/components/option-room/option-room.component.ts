import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RoomI, RoomType } from 'src/app/model/chat/room.interface';
import { UserI, UserRole } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-option-room',
  templateUrl: './option-room.component.html',
  styleUrls: ['./option-room.component.css']
})
export class OptionRoomComponent {
	
  user: UserI = this.authService.getLoggedInUser();
  IsOwner: boolean = false;
  room: RoomI;

  private roomId$: Observable<number> = this.activatedRoute.params.pipe(
	map((params: Params) => parseInt(params['id']))
  )

  room$: Observable<RoomI> = this.roomId$.pipe(
	switchMap((roomId: number) => this.chatService.findOne(roomId))
	)

  constructor(
	  private chatService: ChatService,
	  private authService: AuthService,
	  private router: Router,
	  private activatedRoute: ActivatedRoute,
	  private _snackBar: MatSnackBar
	  	) { 
			this.activatedRoute.params.subscribe(params => {
				if (params["id"]) {
				  this.doSearch(params["id"]);
				}
			  });
			}

	  ngOnInit(): void {
		// check if user status is owner or admin
		if (this.user.role !== UserRole.ADMIN && this.user.role !== UserRole.OWNER) {
			this._snackBar.open('You are not authorized to access this page', '', {
				duration: 2000,
				panelClass: ['red-snackbar','login-snackbar'],
			});
		}
		this.room$.subscribe(val => {
			if (!val) this.router.navigate(['../../page-not-found'],{ relativeTo: this.activatedRoute })
			else {
				this.room = val;
			}
			});
	}

	doSearch(term: string) {
		let test = parseInt(term);
		if (isNaN(test)) {
		  this.router.navigate(['../../page-not-found'],{ relativeTo: this.activatedRoute })
		}
	  }  

	addAdmin(user: UserI) {
		this.chatService.addAdmin(this.room, user);
	}

	addMuted(user: UserI) {
		this.chatService.addMuted(this.room, user);
	}

	removeUser(user: UserI) {
		this.chatService.removeUser(this.room, user);
	}

	removeAdmin(user: UserI) {
		this.chatService.removeAdmin(this.room, user);
	}

	removeMuted(user: UserI) {
		this.chatService.removeMuted(this.room, user);
	}

	changePassword(password: string) {
		this.chatService.changePassword(this.room, password);
	}

	changeType(type: RoomType, password: string) {
		this.chatService.changeType(this.room, type, password);
	}
}
