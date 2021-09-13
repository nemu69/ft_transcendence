import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConnectedUserEntity } from "src/chat/model/connected-user/connected-user.entity";
import { JoinedRoomEntity } from "src/chat/model/joined-room/joined-room.entity";
import { MessageEntity } from "src/chat/model/message/message.entity";
import { RoomEntity } from "src/chat/model/room/room.entity";
import { Exclude } from 'class-transformer';

import { FriendEntity } from "src/friends/model/friends.entity";
// import { UserRole, UserStatus } from "./user.interface";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserStatus {
    ON = 'online',
    OFF = 'offline',
    GAME = 'in-game'
}

@Entity()
export class UserEntity {
	
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({unique: true})
	username: string;
	
	@Column({unique: true})
	email: string;
	
	@Column({select: false})
	password: string;
	
	@Column({default: 'user.png'})
	avatar: string;
	
	@Column({default: 0})
	level: number;
	
	@Column({ nullable: true })
	nbWin: number;
	
	@Column({ unique: true, nullable: true })
	school42id: number;

	@Column({ nullable: true })
	nbLoss: number;
	
	@Column({ default: false })
	twoFactorAuthEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret: string;
	
	@OneToMany(() => FriendEntity, friend => friend.following)
	following: FriendEntity[];

	@OneToMany(() => FriendEntity, friend => friend.followers)
	followers: FriendEntity[];

	@Column({type: 'enum', enum: UserStatus, default: UserStatus.OFF})
	status: UserStatus;

	@Column({type: 'enum', enum: UserRole, default: UserRole.USER})
	role: UserRole;

 	@ManyToMany(() => RoomEntity, room => room.users)
 	rooms: RoomEntity[]

 	@OneToMany(() => ConnectedUserEntity, connection => connection.user)
 	connections: ConnectedUserEntity[];

 	@OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
 	joinedRooms: JoinedRoomEntity[];

 	@OneToMany(() => MessageEntity, message => message.user)
 	messages: MessageEntity[];

 	@BeforeInsert()
 	@BeforeUpdate()
 	emailToLowerCase() {
    	this.email = this.email.toLowerCase();
    	this.username = this.username.toLowerCase();
  }

}