import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { UserI, UserPaginateI } from 'src/app/model/user/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient, private snackbar: MatSnackBar) { }

	getAllUsers(): Observable<UserPaginateI> {
		return this.http.get<UserPaginateI>('/api/users');
	}

	findByUsername(username: string): Observable<UserI[]> {
		return this.http.get<UserI[]>(`api/users/find-by-username?username=${username}`);
	}

	create(user: UserI): Observable<UserI> {
    	return this.http.post<UserI>('api/users', user).pipe(
    	  tap((createdUser: UserI) => this.snackbar.open(`User ${createdUser.username} created successfully`, 'Close', {
    	    duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    	  })),
    	  catchError(e => {
    	    this.snackbar.open(`User could not be created, due to: ${e.error.message}`, 'Close', {
    	      duration: 5000,
			  panelClass: ['red-snackbar','login-snackbar'],
    	    })
    	    return throwError(e);
    	  })
    	)
	}

	banUser(user: UserI): Observable<UserI> {
		return this.http.put<UserI>(`/api/users/ban/${user.id}`, user).pipe(
			tap((user: UserI) => {
				if (user.ban) {
					this.snackbar.open(`User ${user.username} banned successfully`, 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
					})
				}
				else {
					this.snackbar.open(`User ${user.username} unbanned successfully`, 'Close', {
				duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
			})}}),
			catchError(e => {
				this.snackbar.open(`User could not be banned, due to: ${e.error.message}`, 'Close', {
					duration: 5000,
					panelClass: ['red-snackbar','login-snackbar'],
				})
				return throwError(e);
			})
		)
	}

	updateOne(user: UserI, bool: boolean): Observable<UserI> {
		if(bool) {
    		return this.http.put('api/users/' + user.id, user).pipe(
		tap((user: UserI) => this.snackbar.open(`User update.`, 'Close', {
		  duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
		})),
		catchError(e => {
		  this.snackbar.open(`Username already use`, 'Close', {
			duration: 5000,
			panelClass: ['red-snackbar','login-snackbar'],
		  })
		  return throwError(e);
		})
	  )
	}
    	return this.http.put('api/users/' + user.id, user).pipe(
			catchError(e => {
		 		this.snackbar.open(`Error Google Authenticator`, 'Close', {
				duration: 5000, panelClass: ['red-snackbar','login-snackbar'],})
		 	return throwError(e);
		})
	  )
	}

	uploadFile(avatar : FormData): Observable<UserI> {
		return this.http.post('api/users/upload', avatar);
	}
	
	findOne(id: number): Observable<UserI> {
	  return this.http.get('/api/users/' + id).pipe(
	    map((user:UserI) => user)
	  )
	}

	getImage(imageUrl: string): Observable<Blob> {
		return this.http.get(imageUrl, { responseType: 'blob' });
	}

}
