import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { RoomPaginateI, RoomI, RoomType } from 'src/app/model/chat/room.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-all-rooms',
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.css']
})
export class AllRoomsComponent implements OnInit, AfterViewInit{

  rooms$: Observable<RoomPaginateI> = this.chatService.getMyRooms();
  selectedRoom : RoomI = null;
  InRoom = null;
  user: UserI = this.authService.getLoggedInUser();

  constructor(private chatService: ChatService,
	private authService: AuthService,
	public dialog: MatDialog
	) { }

  ngOnInit() {
    this.chatService.emitPaginateAllRooms(20, 0);
  }

  ngAfterViewInit() {
    this.chatService.emitPaginateAllRooms(20, 0);
  }

  addUserToRoom(event: MatSelectionListChange) {
	this.selectedRoom = event.source.selectedOptions.selected[0].value;
	console.log(this.selectedRoom.users);
	
	if (this.selectedRoom.users && this.selectedRoom.users.find(user => user.id === this.user.id)) {
		this.InRoom = true;
	} 
	else if  (this.selectedRoom.admin && this.selectedRoom.admin.find(user => user.id === this.user.id)) {
		this.InRoom = true;
	} 
	else if  (this.selectedRoom.muted && this.selectedRoom.muted.find(user => user.id === this.user.id)) {
		this.InRoom = true;
	} 
	else {
		this.InRoom = false;
	}
  }

  onPaginateRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginateAllRooms(20, pageEvent.pageIndex);
  }

}
