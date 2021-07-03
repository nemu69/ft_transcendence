import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { User, UserService } from '../service/user.service';
import { map, catchError } from 'rxjs/operators';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body() user: User): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({ error: err.message }))
        );
    }

	@Get()
    findAll(): Observable<User[]> {
        return this.userService.findAll();
    }

	@Post('login')
    login(@Body() user: User): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return { access_token: jwt };
            })
        )
    }

    @Get(':id')
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }
}