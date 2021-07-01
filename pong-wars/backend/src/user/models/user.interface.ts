import { FriendEntity } from "src/friend/models/friend.entity";

export interface UserI {
    id: number;
    name: string;
    password: string;
    email: string;
    avatar: string;
    level: number;
    friend: FriendEntity;
    status: string;
    role: string;
}