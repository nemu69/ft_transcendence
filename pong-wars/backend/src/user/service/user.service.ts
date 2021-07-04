import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { UserI, UserRole, UserStatus } from '../models/user.interface';
import { switchMap, map, catchError } from 'rxjs/operators';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
		private authService: AuthService
    ) {}

    create(user: UserI): Observable<UserI> {
		return this.authService.hashPassword(user.password).pipe(
			switchMap((passwordHash: string) => {
				const newUser = new UserEntity();
				newUser.name = user.name;
		 		newUser.email = user.email;
				newUser.password = passwordHash;
				newUser.level = 0;
				newUser.avatar = "fake";
				newUser.status = user.status;
				newUser.role = user.role;

				return from(this.userRepository.save(newUser)).pipe(
					map((user: User) => {
						const {password, ...result} = user;
						return result;
					}),
					catchError(err => throwError(err))
				)
			})
		)
    }

	findOne(id: number): Observable<User> {
		return from(this.userRepository.findOne({id})).pipe(
			map((user: User) => {
				const {password, ...result} = user;
				return result;
			})
		)
	}

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach(function (v) {delete v.password});
                return users;
            })
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

	updateOne(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;
        delete user.role;

        return from(this.userRepository.update(id, user)).pipe(
            switchMap(() => this.findOne(id))
        );
    }

	updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

	updateStatusOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

	login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
					this.updateStatusOfUser(user.id, {"status": UserStatus.ON});
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return 'Wrong Credentials';
                }
            })
        )
    }

	validateUser(email: string, password: string): Observable<User> {
        return from(this.userRepository.findOne({email}, {select: ['id', 'password', 'name', 'email', 'role', 'status']})).pipe(
            switchMap((user: User) => this.authService.comparePasswords(password, user.password).pipe(
                map((match: boolean) => {
                    if(match) {
                        const {password, ...result} = user;
                        return result;
                    } else {
                        throw Error;
                    }
                })
            ))
        )

    }

    findByMail(email: string): Observable<User> {
        return from(this.userRepository.findOne({email}));
    }
}