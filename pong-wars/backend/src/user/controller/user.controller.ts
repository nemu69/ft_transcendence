import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { User, UserService } from '../service/user.service';
import { map, catchError } from 'rxjs/operators';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from '../models/user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { JwtAuthGuard } from 'src/auth/guards/jtw-guards';
import { Pagination } from 'nestjs-typeorm-paginate';

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

	@hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRoleOfUser(@Param('id') id: string, @Body() user: User): Observable<User> {
        return this.userService.updateRoleOfUser(Number(id), user);
    }

	@Get()
    index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('name') name: string
    ): Observable<Pagination<User>> {
        limit = limit > 100 ? 100 : limit;

        if (name === null || name === undefined) {
            return this.userService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' });
        } else {
            return this.userService.paginateFilterByUsername(
                { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' },
                { name }
            )
        }
    }
}

@Controller('allusers')
export class UserControllerAdmin {

    constructor(private userService: UserService) {}

	@hasRoles(UserRole.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	findAll(): Observable<User[]> {
		return this.userService.findAll();
	}
}