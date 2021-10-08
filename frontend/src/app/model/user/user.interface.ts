import { FriendEntity } from "src/app/friend/models/friend.entity";
import { RoomI } from "../chat/room.interface";

export interface UserI {
    id?: number;
    username?: string;
    password?: string;
    email?: string;
    avatar?: string;
    level?: number;
	following?: FriendEntity[];
	followers?: FriendEntity[];
    status?: UserStatus;
    role?: UserRole;
	nbWin?: number;
	nbLoss?: number;
	twoFactorAuthEnabled?: boolean;
	twoFactorAuthenticationSecret?: string;
	chatOwner?: RoomI[];
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