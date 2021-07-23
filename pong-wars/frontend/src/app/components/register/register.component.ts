import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';


class CustomValidators {
	static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
	  return (control: AbstractControl): { [key: string]: any } => {
		if (!control.value) {
		  return null as any;
		}
		const valid = regex.test(control.value);
		return valid ? null as any : error;
	  };
	}

  static passwordsMatch (control: AbstractControl): ValidationErrors {
    const password = control.get('password')!.value;
    const confirmPassword = control.get('confirmPassword')!.value;

    if((password === confirmPassword) && (password !== null && confirmPassword !== null)) {
      return null as any;
    } else {
      return {passwordsNotMatching: true};
    }
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
	
export class RegisterComponent implements OnInit {

	registerForm!: FormGroup;
  
	constructor(
	  private authService: AuthenticationService,
	  private formBuilder: FormBuilder,
	  private router: Router
	) { }
  
	ngOnInit(): void {
	  this.registerForm = this.formBuilder.group({
		name: [null, [Validators.required]],
		email: [null, [
		  Validators.required,
		  Validators.email,
		  Validators.minLength(5)
		]],
		password: [null, [
			Validators.required,
			Validators.minLength(8),
			CustomValidators.patternValidator(/\d/, { hasNumber: true }),
			CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
			CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
			CustomValidators.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,{ hasSpecialCharacters: true }),
		]],
	  },{
	  })
	}
	onSubmit(){
		if(this.registerForm.invalid) {
			return;
		}
		console.log(this.registerForm.getRawValue());
		this.authService.register(this.registerForm.value).pipe(
			map(user => this.router.navigate(['login']))
			).subscribe()
		}
		
		hide = true;
	getErrorMessageUser() {
		if (this.registerForm.controls.name.hasError('required')) {
		  return 'You must enter a value';
		}
		return '';
	  }
	getErrorMessageEmail() {
		if (this.registerForm.controls.email.hasError('required')) {
		  return 'You must enter a value';
		}
		return this.registerForm.controls.email.hasError('email') ? 'Not a valid email' : '';
	  }
}
