import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export class School42AuthenticationGuard extends AuthGuard('school42') {
    handleRequest(err:any, user:any, info: any) {
		// You can throw an exception based on either "info" or "err" arguments
        if (info && info.message === "The resource owner or authorization server denied the request.")
            return "failure";
		//TODO switch 'failure' to a throw
		if (err || !user) {
			console.log("err= ", err);
		  throw err || new UnauthorizedException ();
		}
		return user;
	}

}