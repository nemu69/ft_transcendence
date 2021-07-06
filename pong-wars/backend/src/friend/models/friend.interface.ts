import { UserEntity } from "src/user/models/user.entity";

export interface FriendI {
	id: number;
	following?: UserEntity[];
	follower?: UserEntity[];
}
