import { UserEntity } from "src/user/models/user.entity";

export interface FriendI {
    user: UserEntity;
    friend: UserEntity;
}