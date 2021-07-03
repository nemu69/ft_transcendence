import { UserEntity } from "./user.entity";

export interface UserI {
    id?: number;
    name?: string;
    password?: string;
    email?: string;
    avatar?: string;
    level?: number;
	friend: UserEntity[];
    status?: UserStatus;
    role?: UserRole;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum UserStatus {
    ON = 'online',
    OFF = 'offline',
    GAME = 'in-game'
}