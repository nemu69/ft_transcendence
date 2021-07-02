import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';
import { switchMap, map, catchError } from 'rxjs/operators';
import { FriendEntity } from 'src/friend/models/friend.entity';

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
				const friendEntity = new FriendEntity();
				newUser.friend = friendEntity;
				friendEntity.user = newUser;

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

	login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return 'Wrong Credentials';
                }
            })
        )
    }

	validateUser(email: string, password: string): Observable<User> {
        return from(this.userRepository.findOne(email)).pipe(
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