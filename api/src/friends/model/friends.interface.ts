import { UserI, UserStatus } from "src/user/model/user.interface";


export interface FriendsI {
	id?: number;
	following_id?: number;
	follower_id?: number;
	followers?: UserI[];
	following?: UserI[];
	status?: UserStatus;
}