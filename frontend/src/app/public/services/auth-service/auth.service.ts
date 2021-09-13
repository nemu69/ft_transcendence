import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginResponseI } from 'src/app/model/auth/login-response.interface';
import { UserI } from 'src/app/model/user/user.interface';
import { of, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export const JWT_NAME = 'auth-token';
export const JWT_TWO_NAME = 'two-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private snackbar: MatSnackBar, private jwtService: JwtHelperService) { }

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('api/users/login', user).pipe(
		tap((res: LoginResponseI) => {
		localStorage.setItem(JWT_NAME, res.access_token)}),
		tap(() => this.snackbar.open('Login Successfull', 'Close', {
			duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
		})),
	  catchError(e => {
        this.snackbar.open(`Password or email incorrect. Please try again.`, 'Close', {
          duration: 6000,
		  panelClass: ['red-snackbar','login-snackbar'],
        })
        return throwError(e);
      })
    );
  }

  public getToken(uri: string) {
    return this.http.get(uri);
    }

  logout() {
    localStorage.removeItem(JWT_NAME);
	if (this.isTwofactor) localStorage.removeItem(JWT_TWO_NAME);
  }

  getLoggedInUser() {
    const decodedToken = this.jwtService.decodeToken();
    return decodedToken.user;
  }

  getUsername() {
    const decodedToken = this.jwtService.decodeToken();
    return decodedToken.user.username;
  }

  get2faActive() {
    const decodedToken = this.jwtService.decodeToken();
    return decodedToken.user.twoFactorAuthEnabled;
  }
  
  isTwofactor(): boolean {
	  if (!this.get2faActive()) return true;
	  const token = localStorage.getItem(JWT_TWO_NAME);
	  return !this.jwtService.isTokenExpired(token);
	}
	
	isAuthenticated(): boolean {
	  const token = localStorage.getItem(JWT_NAME);
	  return !this.jwtService.isTokenExpired(token);
	}

  getUserId(): Observable<number>{
	const decodedToken = this.jwtService.decodeToken();
	console.log("decodedToken.user.twoFactorAuthEnabled" ,decodedToken);

	return of(localStorage.getItem(JWT_NAME)).pipe(
		switchMap((jwt: string) => of(decodedToken).pipe(
		  map((jwt) => jwt.user.id))
		)
	  )
  }
}
