import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable, Subscription } from 'rxjs';
import { RoomPaginateI } from 'src/app/model/chat/room.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from '../../../public/services/user-service/user.service';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FriendsService } from '../../services/friends-service/friends.service';
import { FriendRequest } from 'src/app/model/friends/friends.interface';


@Component({
  selector: 'app-profile',
  templateUrl: './profile-users.component.html',
  styleUrls: ['./profile-users.component.css']
})
export class ProfileusersComponent implements OnInit {

	blocked$: Observable<FriendRequest[]> = this.friendsService.getMyBlockedUsers();
	friends$: Observable<FriendRequest[]> = this.friendsService.getMyFriends();
	requests$: Observable<FriendRequest[]> = this.friendsService.getFriendRequests();

	
	private userId$: Observable<number> = this.activatedRoute.params.pipe(
	  map((params: Params) => parseInt(params['id']))
	)
  
	user$: Observable<UserI> = this.userId$.pipe(
		switchMap((userId: number) => this.userService.findOne(userId))
		)
		
	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private router: Router,
		private userService: UserService,
		private authService: AuthService,
		private friendsService: FriendsService,
		) { }

		imageToShow: any;
		isImageLoading : boolean;
		idProfile: number;
		idRequest: number;

		yourFriend : number;
		yourBlocked : boolean;
		ngOnInit(): void {
			this.authService.getUserId().pipe(
				switchMap((idt: number) => this.userService.findOne(idt).pipe(
				tap((user) => {
					this.user$.subscribe(val => {
						if (val.id == user.id) {
							this.router.navigate(['../../profile'],{ relativeTo: this.activatedRoute })
						}
						this.getImageFromService(val.id);
						this.idProfile = val.id;
						this.isFriend();
						this.isblockedUser();
						});
				  })
				))
			).subscribe()
		  }
		  
		addFriend(){
			  this.friendsService.sendFriendRequest(this.idProfile.toString()).subscribe(
				  (data) => {
					  this.yourFriend = 1;
				  }
			  )
		}

		isFriend(){
			this.yourFriend = 0;
			this.friendsService.statusFriendRequest(this.idProfile.toString()).pipe(
				tap((x) => {
						this.idRequest = x.id;
						if(x.status == 'not-sent'){
							this.yourFriend = 0;
						}
						else if(x.status == 'pending'){
							this.yourFriend = 1;
						}
						else if(x.status == 'accepted'){
							this.yourFriend = 2;
						}
						else if(x.status == 'declined'){
							this.yourFriend = 3;
						}
						else if(x.status == 'waiting-for-current-user-response'){
							this.yourFriend = 4;
						}
						else if(x.status == 'blocked'){
							this.yourFriend = 5;
						}

				})
			).subscribe();
		}
			
		blockUser(){
			this.friendsService.blockOrUnblockUsers(this.idProfile.toString()).subscribe(
				(data) => {
					console.log(data);
					this.yourBlocked = !this.yourBlocked;
					this.yourFriend = 0;
				})		
		}
			
		isblockedUser(){
			this.yourBlocked = false;
			this.blocked$.pipe(
				tap((x) => {
					for (let index = 0; index < x.length; index++) {
						if (x[index].receiver.id == this.idProfile)
							this.yourBlocked = true;
			}})).subscribe();
		  }

		removeFriend(){
			this.friendsService.removeFriendRequest(this.idProfile.toString()).subscribe(
				(data) => {
					console.log(data);
					this.yourFriend = 0;
				})
		}

		responseToFriend(res:string){
			this.friendsService.responseFriendRequest(this.idRequest.toString(),res).subscribe(
				(data) => {
					if (data.status == 'accepted')
						this.yourFriend = 2;
					if (data.status == 'declined')
						this.yourFriend = 3;
				}
			)
		}
	
		  
		createImageFromBlob(image: Blob) {
			let reader = new FileReader();
			reader.addEventListener("load", () => {
			   this.imageToShow = reader.result;
			}, false);
		 
			if (image) {
			   reader.readAsDataURL(image);
			}
		}

		getImageFromService(id:number) {
			this.isImageLoading = true;
			
			this.userService.getImage("/api/users/avatarById/" + id.toString()).subscribe(data => {
			  this.createImageFromBlob(data);
			  this.isImageLoading = false;
			}, error => {
			  this.isImageLoading = false;
			});
			console.log(this.isImageLoading);
			
		}
	
	}
