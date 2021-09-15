export interface UserI {
    id?: number;
    username?: string;
    password?: string;
    email?: string;
    avatar?: string;
    level?: number;
    status?: UserStatus;
    role?: UserRole;
	nbWin?: number;
	school42id?: number;
	nbLoss?: number;
	twoFactorAuthEnabled?: boolean;
	twoFactorAuthenticationSecret?: string;
}

export enum UserRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserStatus {
    ON = 'online',
    OFF = 'offline',
    GAME = 'in-game'
}