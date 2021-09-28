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


@Component({
  selector: 'app-profile',
  templateUrl: './profile-users.component.html',
  styleUrls: ['./profile-users.component.css']
})
export class ProfileusersComponent implements OnInit {

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
							});
					  })
					))
				  ).subscribe()
				
		  }
		  
		  addFriend(){
			  this.friendsService.sendFriendRequest(this.idProfile.toString()).subscribe(
				  (data) => {
					  console.log(data);
				  }
			  )		
		  }
		  blockUser(){
			  this.friendsService.blockOrUnblockUsers(this.idProfile.toString()).subscribe(
				(data) => {
					console.log(data);
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
			  console.log(error);
			});
			console.log(this.isImageLoading);
			
		}
	
	}
