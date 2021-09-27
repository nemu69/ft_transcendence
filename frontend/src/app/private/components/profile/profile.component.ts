import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { RoomPaginateI } from 'src/app/model/chat/room.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from '../../../public/services/user-service/user.service';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	
	constructor(private formBuilder: FormBuilder, private userService: UserService, private authService: AuthService) { }
	
	

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