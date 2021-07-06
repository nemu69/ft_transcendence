import { FriendEntity } from "src/friend/models/friend.entity";

export interface UserI {
    id?: number;
    name?: string;
    password?: string;
    email?: string;
    avatar?: string;
    level?: number;
	followings?: FriendEntity;
	followers?: FriendEntity;
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