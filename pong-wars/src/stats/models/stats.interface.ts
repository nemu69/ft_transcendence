import { UserEntity } from "src/user/models/user.entity";

export interface StatsI {
    label: string;
    users: UserEntity;
}