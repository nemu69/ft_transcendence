import { Component, OnInit } from '@angular/core';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { UserService } from '../../../public/services/user-service/user.service';
import { AuthService } from '../../../public/services/auth-service/auth.service';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { UserI } from 'src/app/model/user/user.interface';
import { TwoFactorService } from 'src/app/private/services/twoFactor-service/twoFactor.service';
import { setImmediate } from 'timers';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
	isChecked : boolean;
	constructor(
		private formBuilder: FormBuilder,
		private userService: UserService,
		private authService: AuthService,
		private router: Router,
		private twoFactorService: TwoFactorService,
		private activatedRoute: ActivatedRoute,
		private _snackBar: MatSnackBar
		) { }
	
	settingForm: FormGroup;
  ngOnInit(): void {
	this.settingForm = this.formBuilder.group({
		id: [{value: null, disabled: true}, [Validators.required]],
		username: [null, [Validators.required, Validators.maxLength(20)]],
		avatar: [null],
		email: [{value: null, disabled: true}, [Validators.required]],
		twoFactorAuthEnabled: [null],
		twoFactorAuthenticationSecret : {value: null, disabled: true}
	  });
	  
	  this.authService.getUserId().pipe(
		switchMap((idt: number) => this.userService.findOne(idt).pipe(
		  tap((user) => {
			this.settingForm.patchValue({
			  id: user.id,
			  username: user.username,
			  email: user.email,
			  avatar: user.avatar,
			  twoFactorAuthEnabled: user.twoFactorAuthEnabled,
			  twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret,
			})
		  })
		))
	  ).subscribe()
	}
	
	getErrorMessageUser() {
		if (this.settingForm.controls.username.hasError('required')) {
		  return 'You must enter a username';
		}
		else if (this.settingForm.controls.username.hasError('maxlength')) {
			return 'Username must be less than 20 characters';
		}
		return '';
	  }
	getStateAuth() {
		if (this.settingForm.value.twoFactorAuthEnabled) {
			this.settingForm.controls['twoFactorAuthEnabled'].setValue(true);
			return 'disable'
		}
		this.settingForm.controls['twoFactorAuthEnabled'].setValue(false);
		return 'enable';
  	}

	getQrCode() {
		if (this.settingForm.value.twoFactorAuthEnabled) {
				this.router.navigate(['../two-factor-disabled'],{ relativeTo: this.activatedRoute })
		}
		else {
			this.twoFactorService.generate({
				id: this.settingForm.get('id').value,
				email: this.settingForm.get('email').value,
				username: this.settingForm.get('username').value,
			}).subscribe(
				data => {
					this.settingForm.patchValue({
						twoFactorAuthenticationSecret: data
					});
					this.update(false);
				}
			);
			setTimeout(() => {
				this.router.navigate(['../two-factor'],{ relativeTo: this.activatedRoute })
			}, 200);
		}
	}

	changed(){
		if (this.settingForm.controls['twoFactorAuthEnabled'].value) this.settingForm.value.twoFactorAuthEnabled = true;
		else this.settingForm.value.twoFactorAuthEnabled = false;
	  }

	  selectedFile: File
	onFileChanged(event) {
	this.selectedFile = event.target.files[0]
	
	}
	onUpload() {
		this.userService.uploadFile(this.selectedFile).subscribe(
			data => {
				console.log(data);
			}
		);
	  }
	
	 uploadFile() {
		
	 }

	update(bool: boolean) {
		this.userService.updateOne(this.settingForm.getRawValue(), bool).subscribe();
	  }
}
