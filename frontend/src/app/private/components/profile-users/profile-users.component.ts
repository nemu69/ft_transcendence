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
			) { }

			ngOnInit(): void {
				this.authService.getUserId().pipe(
					switchMap((idt: number) => this.userService.findOne(idt).pipe(
					  tap((user) => {
						this.user$.subscribe(val => {
							if (val.id == user.id) {
								this.router.navigate(['../../profile'],{ relativeTo: this.activatedRoute })
							}
							});
					  })
					))
				  ).subscribe()
				
	  }
	  follow(){
		  console.log("follow");
	  }

}
