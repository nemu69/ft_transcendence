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
  selectedRoom = null;
  user: UserI = this.authService.getLoggedInUser();

  constructor(private chatService: ChatService,
	private authService: AuthService,
	public dialog: MatDialog
	) { }

  ngOnInit() {
    this.chatService.emitPaginateAllRooms(10, 0);
  }

  ngAfterViewInit() {
    this.chatService.emitPaginateAllRooms(10, 0);
  }

  addUserToRoom(event: MatSelectionListChange) {
	  console.log(event.source.selectedOptions.selected[0].value);
	  let room : RoomI = event.source.selectedOptions.selected[0].value;
    //this.selectedRoom = event.source.selectedOptions.selected[0].value;
	// addUserToRoom
  }

  onPaginateRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginateAllRooms(pageEvent.pageSize, pageEvent.pageIndex);
  }

}
