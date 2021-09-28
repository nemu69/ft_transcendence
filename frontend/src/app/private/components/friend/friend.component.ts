import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';
import { FriendsService } from '../../services/friends-service/friends.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent implements OnInit {

	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private router: Router,
		private userService: UserService,
		private authService: AuthService,
		private friendsService: FriendsService,
		) { }

  

	user : Observable<UserI>;
	imageToShow: any;
	isImageLoading : boolean;
	ngOnInit(): void {
		this.authService.getUserId().pipe(
		  switchMap((idt: number) => this.userService.findOne(idt).pipe(
			tap((user) => {
			  this.user = this.userService.findOne(user.id);
			  this.getImageFromService(user.id);
			})
		  ))
		).subscribe();
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
	}

}
