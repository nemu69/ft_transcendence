import { UserEntity } from "src/user/models/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";

@Entity()
export class FriendEntity {

	@PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.followings)
    following: UserEntity[];

	@ManyToOne(type => UserEntity, user => user.followers)
    follower: UserEntity[];
    
}