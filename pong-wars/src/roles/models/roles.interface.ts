import { UserEntity } from "src/user/models/user.entity";

export interface RolesI {
    label: string;
    users: UserEntity;
}