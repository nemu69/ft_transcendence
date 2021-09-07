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
	
	
	profileForm: FormGroup;
	username: string;
	avatar: string;
	ngOnInit(): void {
	  this.profileForm = this.formBuilder.group({
		  username: [null, [Validators.required]],
		  avatar: [null]
		});
		this.authService.getUserId().pipe(
		  switchMap((idt: number) => this.userService.findOne(idt).pipe(
			tap((user) => {
			  this.profileForm.patchValue({
				username: user.username,
				avatar: user.avatar
			  })
			  this.username = user.username;
			  this.avatar = user.avatar;
			})
		  ))
		).subscribe()
	  }	

}
